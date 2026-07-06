export interface SmsService{sendCode(phone:string):Promise<{accepted:boolean}>;verifyCode(phone:string,code:string):Promise<boolean>}
export class LocalMockSmsService implements SmsService{async sendCode(){return{accepted:true}}async verifyCode(_phone:string,code:string){return code==="123456"}}
export const smsService:SmsService=new LocalMockSmsService();
