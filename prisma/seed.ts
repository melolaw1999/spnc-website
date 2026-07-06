import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const db = new PrismaClient();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

const products = [
  { slug:"on-gold-standard-whey", brand:"OPTIMUM NUTRITION", name:"金标乳清蛋白粉", type:"乳清蛋白", summary:"经典乳清产品，多种规格与风味可选。", highlights:["规格选择清晰","适合日常运动营养补充"], sizes:["2 磅","5 磅"], flavors:["双重巧克力","香草冰激凌","牛奶巧克力","草莓味"], featured:true },
  { slug:"on-gold-standard-isolate", brand:"OPTIMUM NUTRITION", name:"金标分离乳清", type:"分离乳清", summary:"以水解分离乳清与分离乳清组合为配方卖点。", highlights:["每份约 25g 分离蛋白","清晰版本说明"], sizes:["3 磅","5 磅"], flavors:["巧克力","香草"], featured:true },
  { slug:"on-hydro-whey", brand:"OPTIMUM NUTRITION", name:"水解乳清", type:"水解乳清", summary:"面向重视配方类型的训练者。", highlights:["水解乳清类别","购买前请核对版本标签"], sizes:["3.5 磅"], flavors:["巧克力"], featured:false },
  { slug:"on-creatine-glutamine", brand:"OPTIMUM NUTRITION", name:"肌酸和谷氨酰胺", type:"训练补剂", summary:"训练营养产品组合展示。", highlights:["按标签建议使用","补剂不能替代均衡饮食"], sizes:["标准装"], flavors:["原味"], featured:false },
  { slug:"yamamoto-iso-fuji", brand:"YAMAMOTO", name:"ISO-FUJI", type:"分离乳清", summary:"YAMAMOTO 分离乳清产品。", highlights:["分离乳清类别","版本随实际批次说明"], sizes:["标准装"], flavors:["巧克力"], featured:true },
  { slug:"yava-labs-range", brand:"YAVA LABS", name:"乳清、分离乳清和肌酸", type:"运动营养", summary:"YAVA LABS 运动营养系列。", highlights:["覆盖多类训练需求","按产品标签选择"], sizes:["标准装"], flavors:["多种风味"], featured:false },
  { slug:"bpj-protein-drink", brand:"BPJ", name:"高蛋白饮料", type:"即饮蛋白", summary:"便携即饮高蛋白饮料。", highlights:["即饮形式","口味选择直观"], sizes:["单瓶"], flavors:["可可熔岩","咖啡拿铁"], featured:true },
  { slug:"arla-isolate-shake", brand:"ARLA", name:"分离蛋白奶昔", type:"即饮蛋白", summary:"Arla 分离蛋白奶昔。", highlights:["即饮奶昔","实际营养信息以包装为准"], sizes:["单瓶"], flavors:["原味"], featured:false }
];

const assetSeeds = [
  {path:"/assets/brand/ideal-nutrition-share.jpg",name:"ideal-nutrition-share.jpg",type:".jpg",w:800,h:800,bytes:41203,alpha:false,sha:"bbfee40558a86be529c2b3a0738296df8e69ad61af57d8d43be207dd1a46da40",brand:"理想营养",product:"分享图与浏览器图标",size:null,flavor:null,confidence:.99},
  {path:"/assets/brand/ideal-nutrition-logo-blue.png",name:"ideal-nutrition-logo-blue.png",type:".png",w:1326,h:700,bytes:99931,alpha:true,sha:"a8f692fbf818f284ab6c75f1bfc66a7c1c1360ab732f9bfadf5ab68ddf57a102",brand:"理想营养",product:"品牌 Logo",size:null,flavor:null,confidence:.99},
  {path:"/assets/brand/ideal-nutrition-logo-black.png",name:"ideal-nutrition-logo-black.png",type:".png",w:1326,h:700,bytes:102267,alpha:true,sha:"64f249fa95572de666dffdc237fe883eb38c2c2919d896ed179b07339002139b",brand:"理想营养",product:"品牌 Logo",size:null,flavor:null,confidence:.99},
  {path:"/assets/brand/ideal-nutrition-logo-white.png",name:"ideal-nutrition-logo-white.png",type:".png",w:1326,h:700,bytes:104668,alpha:true,sha:"1da0debea5f69edb454470fc68d4c85ddbd617ee31adb691bea03255dcbdc9c2",brand:"理想营养",product:"品牌 Logo",size:null,flavor:null,confidence:.99},
  {path:"/assets/brand/southern-ecommerce-logo.png",name:"southern-ecommerce-logo.png",type:".png",w:2587,h:1413,bytes:319202,alpha:true,sha:"189393bc3024fc3c8c6a7709638a0138e61f9aa79553c6b9e19dd5d2b1521eb5",brand:"萨瑟恩",product:"公司主体 Logo",size:null,flavor:null,confidence:.98},
  {path:"/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.jpg",name:"on-gold-standard-whey-5lb-double-rich-chocolate-front.jpg",type:".jpg",w:800,h:800,bytes:74126,alpha:false,sha:"e177779c7ed48eb3dc1ddb5c7e5f7a54f1d2a2af5511b6a3dc7b8548c36db139",brand:"OPTIMUM NUTRITION",product:"金标乳清蛋白粉",size:"5 磅",flavor:"双重巧克力",confidence:.98},
  {path:"/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-vanilla-ice-cream-front.jpg",name:"on-gold-standard-whey-5lb-vanilla-ice-cream-front.jpg",type:".jpg",w:800,h:800,bytes:171969,alpha:false,sha:"7efb0f076188f1aa4607cb60c4b0db9ac206b0bf04d6358a7002cb68ccba571b",brand:"OPTIMUM NUTRITION",product:"金标乳清蛋白粉",size:"5 磅",flavor:"香草冰激凌",confidence:.97},
  {path:"/assets/products/on/gold-standard-whey/on-gold-standard-whey-2lb-strawberry-front.jpg",name:"on-gold-standard-whey-2lb-strawberry-front.jpg",type:".jpg",w:800,h:800,bytes:199393,alpha:false,sha:"72710f46282cb8c31e9d160bdad30027a99a45e7598d8eaca7bfc8667b523a7f",brand:"OPTIMUM NUTRITION",product:"金标乳清蛋白粉",size:"2 磅",flavor:"草莓味",confidence:.97},
  {path:"/assets/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front.webp",name:"on-gold-standard-isolate-3lb-chocolate-bliss-front.webp",type:".webp",w:1000,h:1000,bytes:60964,alpha:true,sha:"80ffc44696deb4c20e569853d404e7ce2131d94086c0a1d746e28f86f7426c24",brand:"OPTIMUM NUTRITION",product:"金标分离乳清",size:"3 磅",flavor:"巧克力",confidence:.98},
  {path:"/assets/products/on/hydro-whey/on-platinum-hydrowhey-3-5lb-front.jpg",name:"on-platinum-hydrowhey-3-5lb-front.jpg",type:".jpg",w:800,h:800,bytes:179248,alpha:false,sha:"c8c7debe5921abfbf958baa7bf700834ee338a5136a5c0a335b4380c322e9e6d",brand:"OPTIMUM NUTRITION",product:"水解乳清",size:"3.5 磅",flavor:"巧克力",confidence:.97},
  {path:"/assets/products/on/creatine/on-micronized-creatine-300g-front.jpg",name:"on-micronized-creatine-300g-front.jpg",type:".jpg",w:800,h:800,bytes:152678,alpha:false,sha:"659bda545371334925e88d2f96aec628ef15ff71f837cdda71a4e3a9c541ff13",brand:"OPTIMUM NUTRITION",product:"肌酸",size:"300g",flavor:"原味",confidence:.96},
  {path:"/assets/products/on/glutamine/on-glutamine-front.jpg",name:"on-glutamine-front.jpg",type:".jpg",w:800,h:800,bytes:125971,alpha:false,sha:"f2a44b63e50c86e51aaa309784db49ab245d250e5edeabf06d8f36242624ea7b",brand:"OPTIMUM NUTRITION",product:"谷氨酰胺",size:null,flavor:"原味",confidence:.94},
  {path:"/assets/products/yamamoto/yamamoto-iso-fuji-2kg-gourmet-chocolate-front.jpg",name:"yamamoto-iso-fuji-2kg-gourmet-chocolate-front.jpg",type:".jpg",w:800,h:800,bytes:72973,alpha:false,sha:"8f5f647800916ef51497f12a842e1f80d9b228cc0b665342080fb65ca64805f3",brand:"YAMAMOTO",product:"ISO-FUJI",size:"2kg",flavor:"巧克力",confidence:.98},
  {path:"/assets/products/yava/yava-pure-iso-whey-2kg-raspberry-ice-cream-front.jpg",name:"yava-pure-iso-whey-2kg-raspberry-ice-cream-front.jpg",type:".jpg",w:800,h:800,bytes:79117,alpha:false,sha:"645f546f04fc81219bfc3e4f90951241df78fbafe1f3e827fabccc3d22ab3d3e",brand:"YAVA LABS",product:"分离乳清",size:"2kg",flavor:"树莓冰淇淋",confidence:.96},
  {path:"/assets/products/yava/yava-premium-whey-front.jpg",name:"yava-premium-whey-front.jpg",type:".jpg",w:800,h:800,bytes:107216,alpha:false,sha:"abdd99f015af81e173420f08aa833773729a49c6e6c2ac91395e539f0c9837bd",brand:"YAVA LABS",product:"乳清蛋白",size:null,flavor:null,confidence:.92},
  {path:"/assets/products/yava/yava-creapure-front.jpg",name:"yava-creapure-front.jpg",type:".jpg",w:800,h:800,bytes:81131,alpha:false,sha:"6a72d67998cd4f1c89429b2d0a1c63ce80652e725d6c20b619748eec3a99849d",brand:"YAVA LABS",product:"肌酸",size:null,flavor:"原味",confidence:.95},
  {path:"/assets/products/bpj/bpj-cocoa-lava-box-and-bottle-front.jpg",name:"bpj-cocoa-lava-box-and-bottle-front.jpg",type:".jpg",w:800,h:800,bytes:107358,alpha:false,sha:"62bf33a8de83b3a7a75d5dfd7a1b2391aa53636b6fa1d2a04f82c2a686a47ea4",brand:"BPJ",product:"高蛋白饮料",size:"330mL",flavor:"可可熔岩",confidence:.98},
  {path:"/assets/products/bpj/bpj-coffee-latte-box-front.png",name:"bpj-coffee-latte-box-front.png",type:".png",w:1080,h:564,bytes:665771,alpha:true,sha:"45addf232dabef52d3d9006232b2b8e4a8cb675b7d9879e8f5d0d5a311d15665",brand:"BPJ",product:"高蛋白饮料",size:"330mL",flavor:"咖啡拿铁",confidence:.93}
];

async function main() {
  await db.favorite.deleteMany(); await db.pointLedger.deleteMany(); await db.orderClaim.deleteMany();
  await db.externalOrderItem.deleteMany(); await db.externalOrder.deleteMany(); await db.productImage.deleteMany(); await db.asset.deleteMany(); await db.productVariant.deleteMany();
  await db.product.deleteMany(); await db.userSession.deleteMany(); await db.auditLog.deleteMany();
  await db.user.deleteMany(); await db.syncJob.deleteMany(); await db.rateLimitEvent.deleteMany();
  await db.pointRule.upsert({ where:{id:"default"}, update:{pointsPerYuan:1,activationDays:7}, create:{id:"default",pointsPerYuan:1,activationDays:7} });

  const member = await db.user.create({ data:{ phoneHash:hash("13800000001"),phoneMasked:"138****0001",displayName:"演示会员",role:"MEMBER" } });
  await db.user.create({ data:{ phoneHash:hash("13800000000"),phoneMasked:"138****0000",displayName:"管理员",role:"ADMIN" } });
  const variants:string[]=[]; const createdProducts=new Map<string,string>(); const createdVariants:{id:string;slug:string;size:string;flavor:string}[]=[];
  for (const p of products) {
    const product=await db.product.create({data:{slug:p.slug,brand:p.brand,name:p.name,type:p.type,summary:p.summary,highlightsJson:JSON.stringify(p.highlights),audience:"希望根据日常饮食与训练安排补充蛋白质或运动营养的人群。",formula:"仅展示已提供的产品类别信息；营养成分请以实物包装标签为准。",versionInfo:"不同进口与销售版本的包装、标签可能随地区和批次调整，请按订单与实物信息核验。",usage:"请遵循实物包装标签建议，并结合个人饮食和训练安排。",allergen:"请阅读实物过敏原标签；孕期、哺乳期、未成年人或有特殊健康状况者应先咨询专业人士。",featured:p.featured}});
    createdProducts.set(p.slug,product.id);
    let i=0; for(const size of p.sizes) for(const flavor of p.flavors){ const v=await db.productVariant.create({data:{productId:product.id,sku:`${p.slug}-${++i}`,size,flavor,imagePath:null}}); variants.push(v.id); createdVariants.push({id:v.id,slug:p.slug,size,flavor}); }
  }

  const createdAssets=new Map<string,string>();
  for(const a of assetSeeds){const asset=await db.asset.create({data:{fileName:a.name,projectPath:a.path,fileType:a.type,width:a.w,height:a.h,sizeBytes:a.bytes,transparentBackground:a.alpha,sha256:a.sha,guessedBrand:a.brand,guessedProduct:a.product,guessedSize:a.size,guessedFlavor:a.flavor,confidence:a.confidence,reviewStatus:"ADOPTED_AUTO",adopted:true,sourceType:"COPIED_FROM_LOCAL_ORIGINAL",humanConfirmed:false,note:"原始文件只读；项目使用复制件。"}});createdAssets.set(a.path,asset.id)}
  const links=[
    ["on-gold-standard-whey","/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.jpg","PRIMARY","ON 金标乳清蛋白粉 5 磅双重巧克力正面图",null,null],
    ["on-gold-standard-whey","/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-double-rich-chocolate-front.jpg","FRONT","ON 金标乳清蛋白粉 5 磅双重巧克力正面图","5 磅","双重巧克力"],
    ["on-gold-standard-whey","/assets/products/on/gold-standard-whey/on-gold-standard-whey-5lb-vanilla-ice-cream-front.jpg","FRONT","ON 金标乳清蛋白粉 5 磅香草冰激凌正面图","5 磅","香草冰激凌"],
    ["on-gold-standard-whey","/assets/products/on/gold-standard-whey/on-gold-standard-whey-2lb-strawberry-front.jpg","FRONT","ON 金标乳清蛋白粉 2 磅草莓味正面图","2 磅","草莓味"],
    ["on-gold-standard-isolate","/assets/products/on/isolate/on-gold-standard-isolate-3lb-chocolate-bliss-front.webp","PRIMARY","ON 金标分离乳清 3 磅巧克力正面图","3 磅","巧克力"],
    ["on-hydro-whey","/assets/products/on/hydro-whey/on-platinum-hydrowhey-3-5lb-front.jpg","PRIMARY","ON 铂金水解乳清 3.5 磅正面图","3.5 磅","巧克力"],
    ["on-creatine-glutamine","/assets/products/on/creatine/on-micronized-creatine-300g-front.jpg","PRIMARY","ON 微粉化肌酸 300 克正面图",null,null],
    ["on-creatine-glutamine","/assets/products/on/glutamine/on-glutamine-front.jpg","DETAIL","ON 谷氨酰胺产品正面图",null,null],
    ["yamamoto-iso-fuji","/assets/products/yamamoto/yamamoto-iso-fuji-2kg-gourmet-chocolate-front.jpg","PRIMARY","YAMAMOTO ISO-FUJI 2 千克巧克力正面图",null,null],
    ["yava-labs-range","/assets/products/yava/yava-premium-whey-front.jpg","PRIMARY","YAVA LABS 乳清蛋白正面图",null,null],
    ["yava-labs-range","/assets/products/yava/yava-pure-iso-whey-2kg-raspberry-ice-cream-front.jpg","DETAIL","YAVA LABS PURE ISO WHEY 正面图",null,null],
    ["yava-labs-range","/assets/products/yava/yava-creapure-front.jpg","DETAIL","YAVA LABS CreaPure 肌酸正面图",null,null],
    ["bpj-protein-drink","/assets/products/bpj/bpj-cocoa-lava-box-and-bottle-front.jpg","PRIMARY","BPJ 可可熔岩高蛋白饮料包装与单瓶正面图","单瓶","可可熔岩"],
    ["bpj-protein-drink","/assets/products/bpj/bpj-coffee-latte-box-front.png","FRONT","BPJ 咖啡拿铁高蛋白饮料整箱正面图","单瓶","咖啡拿铁"]
  ] as const;
  for(const [slug,path,role,alt,size,flavor] of links){const productId=createdProducts.get(slug)!;const assetId=createdAssets.get(path)!;const variant=size&&flavor?createdVariants.find(v=>v.slug===slug&&v.size===size&&v.flavor===flavor):undefined;await db.productImage.create({data:{productId,variantId:variant?.id,assetId,role,altText:alt,sortOrder:role==="PRIMARY"?0:1,sourceType:"LOCAL_COPY",confirmed:false}})}

  const now=new Date(); const day=86_400_000;
  const orders=[
    ["TB202606280001","COMPLETED",59800,0,-10,member.id,"正常完成订单"],
    ["TB202606280002","PAID",32800,0,-2,null,"已付款未发货订单"],
    ["TB202606280003","SHIPPED",72800,0,-1,null,"已发货订单"],
    ["TB202606280004","COMPLETED",59800,12000,-12,null,"部分退款订单"],
    ["TB202606280005","COMPLETED",32800,32800,-15,null,"全额退款订单"],
    ["TB202606280006","PAID",42800,0,-3,null,"重复同步订单"]
  ] as const;
  for(let i=0;i<orders.length;i++){
    const [externalOrderId,status,paid,refund,offset,boundUserId,title]=orders[i];
    await db.externalOrder.create({data:{provider:"MOCK_TAOBAO",externalOrderId,status,buyerPaidAmount:paid+1000,productPaidAmount:paid,shippingAmount:1000,refundAmount:refund,orderedAt:new Date(now.getTime()+offset*day),paidAt:new Date(now.getTime()+offset*day),shippedAt:["SHIPPED","COMPLETED"].includes(status)?new Date(now.getTime()+(offset+1)*day):null,completedAt:status==="COMPLETED"?new Date(now.getTime()+(offset+2)*day):null,providerUpdatedAt:now,recipientPhoneLast4Hash:hash(i===0?"0001":"1234"),boundUserId,rawPayload:JSON.stringify({source:"模拟淘宝",maskedRecipient:"***"}),items:{create:{variantId:variants[i],title,quantity:1,paidAmount:paid,refundedAmount:refund}}}});
  }
  console.log("演示数据已写入：8 个产品、2 个账户、6 张模拟订单。");
}
main().finally(()=>db.$disconnect());
