import { env } from "cloudflare:workers";
import { randomToken, NONCE_COOKIE, cookie } from "../../../auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const clientId=env.GOOGLE_CLIENT_ID;
  if(!clientId) return Response.json({configured:false},{headers:{"Cache-Control":"no-store"}});
  const nonce=randomToken();
  return Response.json({configured:true,clientId,nonce},{headers:{"Cache-Control":"no-store","Set-Cookie":cookie(NONCE_COOKIE,nonce,600)}});
}
