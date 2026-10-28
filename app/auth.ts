import { cookies } from "next/headers";
import { env } from "cloudflare:workers";

export const SESSION_COOKIE = "__Host-ep_session";
export const NONCE_COOKIE = "__Host-ep_nonce";
export const SESSION_AGE = 60 * 60 * 24 * 14;
export function randomToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), b=>b.toString(16).padStart(2,"0")).join(""); }
export async function tokenHash(value:string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,"0")).join(""); }
export function cookie(name:string,value:string,age:number) { return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`; }
export function sameOrigin(request:Request) { return request.headers.get("origin") === new URL(request.url).origin; }
export function readCookie(request:Request,name:string) { return request.headers.get("cookie")?.split(";").map(s=>s.trim()).find(s=>s.startsWith(`${name}=`))?.slice(name.length+1) ?? ""; }
export async function getSiteUser() {
  const token=(await cookies()).get(SESSION_COOKIE)?.value;
  if(!token || !/^[0-9a-f]{64}$/.test(token) || !env.DB) return null;
  const row=await env.DB.prepare("SELECT u.id,u.email,u.display_name FROM users u INNER JOIN sessions s ON s.user_id=u.id WHERE s.hash=? AND s.expires_at>?").bind(await tokenHash(token),Date.now()).first<{id:string;email:string;display_name:string}>();
  return row ? {userId:row.id,email:row.email,displayName:row.display_name} : null;
}
