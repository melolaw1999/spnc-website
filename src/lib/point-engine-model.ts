export type ModelOrder={id:string;status:"UNPAID"|"PAID"|"SHIPPED"|"COMPLETED";productCents:number;refundCents:number;completedDaysAgo?:number};
export type ModelLedger={key:string;amount:number;status:"PENDING"|"AVAILABLE";rule:number};
export function applyOrderEvent(rows:ModelLedger[],order:ModelOrder,pointsPerYuan=1,days=7){
  if(order.status==="UNPAID")return rows;
  const gross=Math.floor(order.productCents/100)*pointsPerYuan;
  const available=order.status==="COMPLETED"&&(order.completedDaysAgo??0)>=days;
  const award:ModelLedger={key:`${order.id}:award`,amount:gross,status:available?"AVAILABLE":"PENDING",rule:pointsPerYuan};
  const next=[...rows];const i=next.findIndex(x=>x.key===award.key);if(i<0)next.push(award);else next[i]={...next[i],status:award.status};
  const deduction=gross-Math.floor(Math.max(0,order.productCents-order.refundCents)/100)*pointsPerYuan;
  if(deduction>0&&!next.some(x=>x.key===`${order.id}:refund:${order.refundCents}`))next.push({key:`${order.id}:refund:${order.refundCents}`,amount:-deduction,status:available?"AVAILABLE":"PENDING",rule:pointsPerYuan});
  return next;
}
export function claimOrder(currentUserId:string|null,newUserId:string){if(currentUserId&&currentUserId!==newUserId)throw new Error("ALREADY_CLAIMED");return newUserId;}
export const canAccessAdmin=(role:"MEMBER"|"ADMIN")=>role==="ADMIN";
