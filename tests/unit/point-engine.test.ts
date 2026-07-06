import{describe,it,expect}from"vitest";import{applyOrderEvent,claimOrder,canAccessAdmin,type ModelOrder}from"@/lib/point-engine-model";
import{assetAdopted,assertVariantBelongsToProduct}from"@/lib/asset-review";
const paid:ModelOrder={id:"o1",status:"PAID",productCents:59899,refundCents:0};
describe("积分引擎",()=>{
 it("相同订单同步两次不重复",()=>{let x=applyOrderEvent([],paid);x=applyOrderEvent(x,paid);expect(x).toHaveLength(1);expect(x[0].amount).toBe(598)});
 it("相同事件重复十次仍幂等",()=>{let x=[] as ReturnType<typeof applyOrderEvent>;for(let i=0;i<10;i++)x=applyOrderEvent(x,paid);expect(x).toHaveLength(1)});
 it("未付款不产生积分",()=>expect(applyOrderEvent([],{...paid,status:"UNPAID"})).toHaveLength(0));
 it("已付款产生待生效积分",()=>expect(applyOrderEvent([],paid)[0].status).toBe("PENDING"));
 it("确认收货不足七天仍待生效",()=>expect(applyOrderEvent([],{...paid,status:"COMPLETED",completedDaysAgo:6})[0].status).toBe("PENDING"));
 it("满七天后生效",()=>expect(applyOrderEvent([],{...paid,status:"COMPLETED",completedDaysAgo:7})[0].status).toBe("AVAILABLE"));
 it("部分退款按商品金额扣回",()=>{const x=applyOrderEvent([],{...paid,refundCents:12000});expect(x.map(r=>r.amount)).toEqual([598,-120])});
 it("全额退款全部扣回",()=>{const x=applyOrderEvent([],{...paid,refundCents:59899});expect(x.reduce((s,r)=>s+r.amount,0)).toBe(0)});
 it("积分使用后退款可以形成负积分",()=>{const used={key:"redeem",amount:-500,status:"AVAILABLE" as const,rule:1};const x=applyOrderEvent([used],{...paid,refundCents:59899,status:"COMPLETED",completedDaysAgo:8});expect(x.reduce((s,r)=>s+r.amount,0)).toBe(-500)});
 it("同一订单不能被两个用户认领",()=>expect(()=>claimOrder("u1","u2")).toThrow("ALREADY_CLAIMED"));
 it("非管理员无后台权限",()=>expect(canAccessAdmin("MEMBER")).toBe(false));
 it("修改规则不追溯已有流水",()=>{let x=applyOrderEvent([],paid,1);x=applyOrderEvent(x,{...paid,id:"o2"},2);expect(x.find(r=>r.key==="o1:award")?.amount).toBe(598);expect(x.find(r=>r.key==="o2:award")?.amount).toBe(1196)});
 it("只有已采用状态会进入网站素材库",()=>{expect(assetAdopted("ADOPTED")).toBe(true);expect(assetAdopted("PENDING")).toBe(false);expect(assetAdopted("REJECTED")).toBe(false)});
 it("素材不能绑定到其他商品的 SKU",()=>{expect(()=>assertVariantBelongsToProduct("p1","p2")).toThrow("SKU 与商品不匹配");expect(()=>assertVariantBelongsToProduct("p1","p1")).not.toThrow()});
});
