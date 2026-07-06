import type { ExternalOrder, PointRule } from "@prisma/client";
import { db } from "./db";

export type PointSnapshot={available:number;pending:number;earned:number;used:number};
export function calculateOrderPoints(productPaidCents:number,refundCents:number,rule:Pick<PointRule,"pointsPerYuan">){
  const eligible=Math.max(0,productPaidCents-refundCents); return Math.floor(eligible/100)*rule.pointsPerYuan;
}
export async function getPointSnapshot(userId:string):Promise<PointSnapshot>{
  const rows=await db.pointLedger.findMany({where:{userId}});
  return {available:rows.filter(x=>x.status==="AVAILABLE").reduce((s,x)=>s+x.amount,0),pending:rows.filter(x=>x.status==="PENDING").reduce((s,x)=>s+x.amount,0),earned:rows.filter(x=>x.amount>0).reduce((s,x)=>s+x.amount,0),used:Math.abs(rows.filter(x=>x.type==="REDEEM").reduce((s,x)=>s+x.amount,0))};
}

export async function syncOrderPoints(order:ExternalOrder, now=new Date()){
  if(!order.boundUserId || ["UNPAID","CLOSED"].includes(order.status)) return {changed:false,reason:"订单未绑定或不计积分"};
  const rule=await db.pointRule.findUniqueOrThrow({where:{id:"default"}});
  const gross=Math.floor(order.productPaidAmount/100)*rule.pointsPerYuan;
  const net=calculateOrderPoints(order.productPaidAmount,order.refundAmount,rule);
  const availableAt=order.completedAt?new Date(order.completedAt.getTime()+rule.activationDays*86400000):null;
  const canActivate=Boolean(availableAt && availableAt<=now);
  const baseRef=`award-v1-${gross}`;
  const award=await db.pointLedger.upsert({where:{sourceType_sourceId_externalReference:{sourceType:"ORDER",sourceId:order.id,externalReference:baseRef}},update:{status:canActivate?"AVAILABLE":"PENDING",type:canActivate?"ORDER_AVAILABLE":"ORDER_PENDING",description:canActivate?"订单积分已生效":"订单积分待生效",availableAt},create:{userId:order.boundUserId,type:canActivate?"ORDER_AVAILABLE":"ORDER_PENDING",amount:gross,status:canActivate?"AVAILABLE":"PENDING",sourceType:"ORDER",sourceId:order.id,externalReference:baseRef,description:canActivate?"订单积分已生效":"订单积分待生效",availableAt,metadata:JSON.stringify({ruleSnapshot:{pointsPerYuan:rule.pointsPerYuan,activationDays:rule.activationDays}})}});
  const deduction=gross-net;
  if(deduction>0){
    const refundRef=`refund-${order.refundAmount}`;
    await db.pointLedger.upsert({where:{sourceType_sourceId_externalReference:{sourceType:"ORDER_REFUND",sourceId:order.id,externalReference:refundRef}},update:{},create:{userId:order.boundUserId,type:order.refundAmount>=order.productPaidAmount?"FULL_REFUND":"PARTIAL_REFUND",amount:-deduction,status:canActivate?"AVAILABLE":"PENDING",sourceType:"ORDER_REFUND",sourceId:order.id,externalReference:refundRef,description:order.refundAmount>=order.productPaidAmount?"全额退款积分扣回":"部分退款积分扣回",metadata:JSON.stringify({refundCents:order.refundAmount})}});
  }
  return {changed:true,ledgerId:award.id};
}
