import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/security";
import { syncOrderPoints } from "@/lib/points";

const schema=z.object({orderId:z.string(),action:z.enum(["PAY","SHIP","COMPLETE","ADVANCE_7_DAYS","PARTIAL_REFUND","FULL_REFUND","SYNC","RETRY"])});
export async function POST(req:Request){
 try{
  const admin=await requireAdmin();const p=schema.parse(await req.json());
  let order=await db.externalOrder.findUniqueOrThrow({where:{externalOrderId:p.orderId}});const now=new Date();
  const data:Prisma.ExternalOrderUpdateInput={providerUpdatedAt:now};
  if(p.action==="PAY"){data.status="PAID";data.paidAt=now}
  if(p.action==="SHIP"){data.status="SHIPPED";data.shippedAt=now}
  if(p.action==="COMPLETE"){data.status="COMPLETED";data.completedAt=now}
  if(p.action==="ADVANCE_7_DAYS"){data.status="COMPLETED";data.completedAt=new Date(now.getTime()-8*86400000)}
  if(p.action==="PARTIAL_REFUND")data.refundAmount=Math.floor(order.productPaidAmount/3);
  if(p.action==="FULL_REFUND")data.refundAmount=order.productPaidAmount;
  order=await db.externalOrder.update({where:{id:order.id},data});
  const job=await db.syncJob.create({data:{provider:"MOCK_TAOBAO",kind:p.action,status:p.action==="RETRY"?"RETRIED":"SUCCESS",processed:1,completedAt:new Date()}});
  const result=await syncOrderPoints(order);
  await db.auditLog.create({data:{actorId:admin.id,action:`SIMULATE_${p.action}`,targetType:"ExternalOrder",targetId:order.id,detail:JSON.stringify({jobId:job.id,result})}});
  return NextResponse.json({ok:true});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"操作失败"},{status:403})}
}
