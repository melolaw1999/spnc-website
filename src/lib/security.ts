import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const hashValue = (value:string) => createHash("sha256").update(value).digest("hex");
export const maskOrder = (id:string) => id.length < 8 ? "****" : `${id.slice(0,4)}****${id.slice(-4)}`;

export async function createSession(userId:string){
  const token=randomBytes(32).toString("hex");
  await db.userSession.create({data:{userId,tokenHash:hashValue(token),expiresAt:new Date(Date.now()+7*86400000)}});
  (await cookies()).set("ipn_session",token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:7*86400});
}
export async function currentUser(){
  const token=(await cookies()).get("ipn_session")?.value; if(!token) return null;
  const session=await db.userSession.findUnique({where:{tokenHash:hashValue(token)},include:{user:true}});
  return session && session.expiresAt>new Date()?session.user:null;
}
export async function requireUser(){ const user=await currentUser(); if(!user) throw new Error("UNAUTHORIZED"); return user; }
export async function requireAdmin(){ const user=await requireUser(); if(user.role!=="ADMIN") throw new Error("FORBIDDEN"); return user; }
export async function rateLimit(key:string,action:string,limit:number,windowMs:number){
  const keyHash=hashValue(key); const since=new Date(Date.now()-windowMs);
  const count=await db.rateLimitEvent.count({where:{keyHash,action,createdAt:{gte:since}}});
  if(count>=limit) return false; await db.rateLimitEvent.create({data:{keyHash,action}}); return true;
}
