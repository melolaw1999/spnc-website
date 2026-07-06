import { NextResponse } from "next/server"; import { cookies } from "next/headers"; import { db } from "@/lib/db"; import { hashValue } from "@/lib/security";
export async function POST(){const c=await cookies();const token=c.get("ipn_session")?.value;if(token)await db.userSession.deleteMany({where:{tokenHash:hashValue(token)}});c.delete("ipn_session");return NextResponse.json({ok:true});}
