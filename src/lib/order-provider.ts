import { db } from "./db";

export interface OrderProvider {
  name:string;
  getOrder(externalOrderId:string):Promise<unknown>;
  syncIncremental():Promise<{count:number}>;
}
export class MockTaobaoOrderProvider implements OrderProvider{
  name="MOCK_TAOBAO";
  getOrder(externalOrderId:string){return db.externalOrder.findUnique({where:{externalOrderId},include:{items:true}})}
  async syncIncremental(){return {count:await db.externalOrder.count({where:{provider:this.name}})}}
}
export class TaobaoOpenPlatformProvider implements OrderProvider{
  name="TAOBAO_OPEN_PLATFORM";
  async getOrder():Promise<never>{throw new Error("待淘宝授权：尚未配置 OAuth 与订单权限");}
  async syncIncremental():Promise<never>{throw new Error("待淘宝授权：尚未配置 OAuth 与订单权限");}
}
