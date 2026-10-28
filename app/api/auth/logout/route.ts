import { env } from "cloudflare:workers";
import { cookie, readCookie, SESSION_COOKIE, tokenHash, sameOrigin } from "../../../auth";
export async function POST(request:Request) {
  if(!sameOrigin(request)) return Response.json({error:"Недопустимый источник запроса."},{status:403});
  const session=readCookie(request,SESSION_COOKIE);
  if(session && env.DB) await env.DB.prepare("DELETE FROM sessions WHERE hash=?").bind(await tokenHash(session)).run();
  return Response.json({ok:true},{headers:{"Cache-Control":"no-store","Set-Cookie":cookie(SESSION_COOKIE,"",0)}});
}
