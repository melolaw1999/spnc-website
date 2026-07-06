import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db"; import { createSession,hashValue,rateLimit } from "@/lib/security";
import { smsService } from "@/lib/sms";
const schema=z.object({phone:z.string().regex(/^1\d{10}$/),code:z.string().length(6)});
export async function POST(req:Request){
  const parsed=schema.safeParse(await req.json()); if(!parsed.success)return NextResponse.json({error:"请输入有效手机号和验证码"},{status:400});
  if(!await rateLimit(parsed.data.phone,"LOGIN",8,10*60_000))return NextResponse.json({error:"尝试次数过多，请稍后再试"},{status:429});
  if(!await smsService.verifyCode(parsed.data.phone,parsed.data.code))return NextResponse.json({error:"测试验证码不正确"},{status:401});
  const user=await db.user.findUnique({where:{phoneHash:hashValue(parsed.data.phone)}}); if(!user)return NextResponse.json({error:"演示账户不存在"},{status:404});
  await createSession(user.id); return NextResponse.json({ok:true,role:user.role});
}
