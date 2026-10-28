import { env } from "cloudflare:workers";
import { verifyGoogleToken } from "../../../verify-google";
import { randomToken, tokenHash, SESSION_COOKIE, NONCE_COOKIE, SESSION_AGE, cookie, readCookie, sameOrigin } from "../../../auth";

export const dynamic="force-dynamic";
const error=(message:string,status:number)=>Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request) {
  if(!sameOrigin(request)) return error("Недопустимый источник запроса.",403);
  if(!env.GOOGLE_CLIENT_ID) return error("Вход Google ещё не подключён. Свяжитесь с Easy Plast по телефону или в Telegram.",503);
  if(!env.DB) return error("Вход временно недоступен. Попробуйте ещё раз.",503);
  let credential:string,nonce:string;
  try { const raw=await request.text(); if(raw.length>16000) return error("Слишком большой запрос.",413); const body=JSON.parse(raw); credential=body.credential;nonce=body.nonce; if(typeof credential!=="string" || typeof nonce!=="string") throw new Error(); }
  catch { return error("Не удалось проверить вход Google.",400); }
  const cookieNonce=readCookie(request,NONCE_COOKIE);
  if(!cookieNonce || cookieNonce!==nonce || !/^[0-9a-f]{64}$/.test(nonce)) return error("Сеанс входа истёк. Откройте окно входа ещё раз.",403);
  let identity;
  try {
    identity=await verifyGoogleToken(credential,env.GOOGLE_CLIENT_ID,nonce);
  } catch { return error("Google не подтвердил вход. Попробуйте ещё раз.",401); }
  try {
    const {userId,email,displayName}=identity;
    const session=randomToken(), now=Date.now(), oldSession=readCookie(request,SESSION_COOKIE);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO users (id,email,display_name,created_at) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET email=excluded.email,display_name=excluded.display_name").bind(userId,email,displayName,now),
      env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
      env.DB.prepare("DELETE FROM sessions WHERE hash=?").bind(oldSession ? await tokenHash(oldSession) : ""),
      env.DB.prepare("INSERT INTO sessions (hash,user_id,expires_at) VALUES (?,?,?)").bind(await tokenHash(session),userId,now+SESSION_AGE*1000),
    ]);
    const headers=new Headers({"Cache-Control":"no-store"});
    headers.append("Set-Cookie",cookie(SESSION_COOKIE,session,SESSION_AGE));
    headers.append("Set-Cookie",cookie(NONCE_COOKIE,"",0));
    return Response.json({user:{displayName,email}},{headers});
  } catch {return error("Не удалось создать сеанс. Попробуйте ещё раз.",503);}
}
