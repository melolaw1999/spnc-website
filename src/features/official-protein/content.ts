export type ProteinFaq = {
  question: string;
  answer: string;
  href?: string;
  linkLabel?: string;
};
export type ProteinPageContent = {
  slug: string;
  defaultVariantId: string;
  eyebrow: string;
  productNameZh: string;
  productNameLines?: string[];
  productAltNameZh: string;
  intro: string;
  factsNote?: string;
  selectorAria: string;
  infoTitle: string;
  infoIntro: string;
  overviewTitle: string;
  overview: string[];
  benefits: string[];
  suggestedUseNotes: string[];
  nutritionTitle?: string;
  nutritionIntro?: string;
  translationTitle?: string;
  faqs: ProteinFaq[];
};

const sharedFaqs = (productName: string, selectorAnchor: string, comparisonAnswer: string): ProteinFaq[] => [
  {
    question: "附带的量勺在哪里？",
    answer: "量勺通常随产品放在桶内，运输震动后可能沉入粉末。可用清洁且完全干燥的器具轻轻寻找，避免让水分进入桶内；若仍未找到，请保留包装和订单信息联系售后。",
    href: "/support",
    linkLabel: "联系售后",
  },
  {
    question: "为什么桶没有装满？",
    answer: "产品按包装标注的净含量销售，并不是按桶内体积销售。粉末在运输过程中会自然沉降，同时包装需要保留一定空间，因此视觉上可能没有满桶。若发现封签破损、漏粉或对净含量有疑问，请先拍照并联系售后核查。",
    href: "/support",
    linkLabel: "提交售后登记",
  },
  {
    question: "为什么收到的桶有凹陷？",
    answer: "塑料桶可能因运输挤压、温度或气压变化出现轻微凹陷。请重点检查桶身是否开裂、是否漏粉，以及瓶盖和内封是否完整；如有开裂、漏粉、封签异常、受潮或异味，请勿继续食用，并保留外箱和包装照片联系售后。",
    href: "/support",
    linkLabel: "提交售后登记",
  },
  {
    question: "应该去哪里验证真伪？",
    answer: "请先查看本站防伪溯源说明，并按照实际销售版本使用对应的官方查询渠道。不同地区和版本的防伪方式可能不同；如对防伪码、封签或购买渠道有疑问，请保留订单及包装照片再联系售后。",
    href: "/authenticity",
    linkLabel: "前往防伪溯源",
  },
  {
    question: "为什么粉末会出现结块？",
    answer: "粉末接触潮气、经历温差或长期受压后可能出现少量松散小结块。请始终使用干燥量勺并及时拧紧桶盖；若结块坚硬、范围明显，或同时出现变色、异味、漏气、受潮等情况，请勿继续食用并联系售后。",
    href: "/support",
    linkLabel: "联系售后",
  },
  {
    question: "为什么冲调后泡沫比较多？",
    answer: "乳清蛋白在摇晃或高速搅拌时可能带入空气并产生泡沫，冲调方式、液体温度和不同口味配方都会影响泡沫量。可降低摇晃强度、冲调后静置片刻，或改用低速搅拌。",
  },
  {
    question: `${productName}和其他 ON 乳清有什么区别？`,
    answer: comparisonAnswer,
  },
  {
    question: "为什么这次的包装或标签和以前不一样？",
    answer: "包装可能因销售地区、贸易版本、生产批次或官方改版而变化，口味名称、标签排版、配料和营养数据也可能调整。购买前请核对淘宝订单中的规格与版本，收货后以实物标签为准。",
    href: "/versions",
    linkLabel: "查看版本说明",
  },
  {
    question: "开封后应该怎样保存？",
    answer: "请存放在阴凉、干燥处，避免阳光直射、高温和潮湿；每次使用后及时拧紧桶盖，并确保量勺和接触粉末的器具完全干燥。保质期、储存条件及开封后的使用要求以实际包装标签为准。",
  },
  {
    question: "如何选择大小桶和口味？",
    answer: "可在页面顶部先选择大桶或小桶，再查看该组中的具体净含量、口味、产品图、每份信息和对应营养标签。官网收录状态不等同于淘宝库存，最终请在淘宝商品页再次确认可售规格、口味和销售版本。",
    href: selectorAnchor,
    linkLabel: "返回规格与口味选择",
  },
];

export const isolatePageContent: ProteinPageContent = {
  slug: "on-gold-standard-isolate",
  defaultVariantId: "on-isolate-5lb-chocolate-bliss",
  eyebrow: "OPTIMUM NUTRITION · GOLD STANDARD 100% ISOLATE",
  productNameZh: "金标分离乳清蛋白粉",
  productAltNameZh: "ON 金标分离",
  intro: "按中国在售组合选择 5 磅档或 3 磅档及口味，页面会同步切换对应产品图、营养标签与每份信息。",
  selectorAria: "选择金标分离乳清规格与口味",
  infoTitle: "了解金标分离乳清",
  infoIntro: "以下内容依据 ON 澳洲区域产品说明、新加坡区域 76 份标签及 ON 44 份标签整理；具体净含量、配料、营养和使用方式以中国实际销售版本及到货包装为准。",
  overviewTitle: "进一步过滤的分离乳清配方",
  overview: [
    "ON 金标 100% 分离乳清每份提供 25 克蛋白质及 5.5 克天然存在的 BCAA。官网将其定位为经过进一步过滤的分离乳清产品。",
    "本页按中国在售组合整理四项选择：巧克力 5.2 磅与 3 磅，香草 5.02 磅与 3 磅档。香草 3 磅档的包装净含量实标为 2.91 磅（约 1.32 千克），页面会同时写明。",
    "不同口味的每份克数、热量、配料及矿物质数据并不完全相同。切换选项后，本页会同步展示对应版本，避免把一个口味的标签套给另一个口味。",
  ],
  benefits: [
    "每份提供 25 克蛋白质",
    "每份含 5.5 克天然存在的 BCAA",
    "以水解分离乳清蛋白和分离乳清蛋白为蛋白来源",
    "官网说明经过进一步过滤",
    "中国在售组合提供 5 磅档与 3 磅档",
    "区域标签标注无麸质并经过禁用物质检测",
  ],
  suggestedUseNotes: [
    "不同口味的每勺克数可能不同，请先核对当前选项对应的营养标签。",
    "可根据个人口感适当调整液体量，并充分搅拌、摇匀或用搅拌机混合。",
    "蛋白质补充剂不能替代均衡饮食，请结合个人饮食与训练安排使用。",
  ],
  faqs: sharedFaqs(
    "金标分离",
    "#on-gold-standard-isolate-selector",
    "金标分离以水解分离乳清蛋白和分离乳清蛋白为蛋白来源，官网每份标示 25 克蛋白质；金标乳清则是多种乳清蛋白来源的组合。两者的口味、每份克数和营养数据不同，选择时请按实际标签、饮食安排和个人偏好核对。",
  ),
};

export const hydrowheyPageContent: ProteinPageContent = {
  slug: "on-platinum-hydrowhey",
  defaultVariantId: "on-hydro-large-turbo-chocolate",
  eyebrow: "OPTIMUM NUTRITION · PLATINUM HYDROWHEY",
  productNameZh: "白金水解乳清蛋白粉",
  productAltNameZh: "ON 白金水解乳清",
  intro: "选择大小桶和口味，页面会同步切换当前美国官网对应的产品图、每份信息与可核到的英文营养标签。",
  selectorAria: "选择白金水解乳清规格与口味",
  infoTitle: "了解白金水解乳清",
  infoIntro: "以下内容依据 ON 美国官网当前规格、产品说明和对应英文标签整理；具体配料、营养和使用方式以当前所选口味及实际到货包装为准。",
  overviewTitle: "以水解分离乳清蛋白为蛋白来源",
  overview: [
    "ON 白金水解乳清以水解分离乳清蛋白为蛋白来源，每份提供 30 克蛋白质，并标示 15.5 克必需氨基酸和 8.8 克天然存在及额外添加的 BCAA。",
    "当前美国官网共列出 5 个规格与口味组合：小桶三种口味，大桶巧克力和香草两种口味。巧克力每份为 41 克，草莓和香草每份为 40 克。",
    "水解指蛋白质经过加工形成更小的肽链。本页只转述官网配方与标签信息，不把产品描述延伸为疾病治疗、身体效果或个体适用承诺。",
  ],
  benefits: [
    "每份提供 30 克蛋白质",
    "每份标示 15.5 克必需氨基酸",
    "每份标示 8.8 克天然存在及额外添加的 BCAA",
    "以水解分离乳清蛋白为蛋白来源",
    "当前官网提供三种口味、大小桶组合",
    "官网说明产品经过禁用物质检测",
  ],
  suggestedUseNotes: [
    "巧克力口味每份为 41 克；香草与草莓口味每份为 40 克，请按当前标签核对。",
    "官网标签建议与 10–12 液体盎司冷水、牛奶或其他饮料混合约 30 秒，可按个人口感调整。",
    "蛋白质补充剂不能替代均衡饮食，请结合个人饮食与训练安排使用。",
  ],
  faqs: sharedFaqs(
    "白金水解乳清",
    "#on-platinum-hydrowhey-selector",
    "白金水解乳清以水解分离乳清蛋白为蛋白来源，官网每份标示 30 克蛋白质，并额外列出必需氨基酸和 BCAA；金标分离每份标示 25 克蛋白质，配方和冲调克数也不同。页面不把这些标签差异解释为对每个人都相同的身体效果，选择时请以实际包装、饮食安排和个人偏好为准。",
  ),
};

export const domesticGoldStandardPageContent: ProteinPageContent = {
  slug: "on-domestic-gold-standard-whey",
  defaultVariantId: "on-domestic-gsw-5lb-double-rich-chocolate",
  eyebrow: "OPTIMUM NUTRITION · 中国制造 / 一般贸易进口",
  productNameZh: "金标乳清蛋白粉（中国制造 / 一般贸易进口）",
  productNameLines: ["金标乳清蛋白粉", "中国制造 / 一般贸易进口"],
  productAltNameZh: "ON 金标乳清蛋白粉",
  intro: "中国制造区完整收录 5 磅、4 磅、2 磅各 4 种口味；一般贸易进口区收录 5 种补充口味。切换规格与口味后，产品图、包装事实和标签参考同步更新。",
  factsNote: "蛋白质与份数优先采用当前包装正面；BCAA、热量、配料和营养表如采用 ON 官网同口味资料，会明确标注“仅供参考”。",
  selectorAria: "选择金标乳清中国制造或一般贸易进口规格与口味",
  infoTitle: "了解中国制造 / 一般贸易进口金标乳清",
  infoIntro: "本页把中国制造与一般贸易进口放在同一个选择器内，但版本、包装正面事实和标签参考分别注明；不会把一般贸易口味归为国产，也不会把其他地区标签冒充中国背标。",
  overviewTitle: "两类销售版本，按规格与口味分别核对",
  overview: [
    "中国制造系列收录 5 磅、4 磅、2 磅，每个规格均包含双重巧克力、牛奶巧克力、草莓和香草冰激凌，共 12 个组合。",
    "咸焦糖、摩卡卡布奇诺、巧克力薄荷、巧克力椰子和奶油香蕉归入一般贸易进口，当前按 5 磅档展示，不与中国制造口味混淆。",
    "不同规格与口味的包装、每桶份数及营养信息可能不同。选择规格与口味后，请核对对应页面信息，并以淘宝订单和实际到货标签为准。",
  ],
  benefits: [
    "中国制造 3 个磅数 × 4 种口味，共 12 个组合",
    "一般贸易进口 5 个补充口味独立成组",
    "规格选择器直接标明销售版本",
    "产品图按当前选择同步切换",
    "不同销售版本与口味独立展示",
    "包装事实与同口味官网营养参考分开注明",
  ],
  suggestedUseNotes: [
    "量勺可能在运输过程中沉入粉末，首次开桶可用清洁、干燥器具轻轻寻找。",
    "不同口味、磅数和销售版本的每勺克数可能不同；没有对应中文背标时，不应仅按其他地区标签自行换算。",
    "蛋白质补充剂不能替代均衡饮食，请结合个人饮食与训练安排使用。",
  ],
  nutritionTitle: "营养成分与配料参考",
  nutritionIntro: "包装正面可确认的内容与同口味官网标签参考会分开注明。切换选项后表格同步更新；没有对应中文背标的项目不会伪装成该销售版本的独立标签。",
  translationTitle: "中文资料对照",
  faqs: sharedFaqs(
    "金标乳清中国制造 / 一般贸易进口",
    "#on-domestic-gold-standard-whey-selector",
    "中国制造版本使用中国包装与中文食品标签；一般贸易进口版本的口味、标签和规格标示可能不同。页面会把当前包装可确认的信息与其他地区官网参考分开标注；购买时请以订单中的销售版本和实际到货标签为准。",
  ),
};

const supplementCommonFaqs = (selectorAnchor: string): ProteinFaq[] => [
  {
    question: "附带的量勺在哪里？",
    answer: "量勺可能在运输过程中沉入粉末。可用清洁且完全干燥的器具轻轻寻找，避免让水分进入桶内；具体每勺克数请按当前包装标签核对。",
  },
  {
    question: "为什么桶没有装满？",
    answer: "粉末按包装标注净含量销售，并不是按桶内体积销售。运输过程中的自然沉降会让桶内留有空间；若存在封签破损、漏粉、受潮或异味，请保留照片并联系售后。",
    href: "/support",
    linkLabel: "提交售后登记",
  },
  {
    question: "为什么收到的桶有轻微凹陷？",
    answer: "塑料桶可能因运输挤压、温度或气压变化出现轻微凹陷。请重点检查桶身是否开裂、是否漏粉，以及瓶盖和内封是否完整；出现异常时请勿继续使用。",
    href: "/support",
    linkLabel: "提交售后登记",
  },
  {
    question: "应该去哪里验证真伪？",
    answer: "请根据实际销售版本查看本站防伪溯源说明，并使用包装上的对应查询渠道。对贴码、封签或查询结果有疑问时，请保留订单与包装照片联系售后。",
    href: "/authenticity",
    linkLabel: "前往防伪溯源",
  },
  {
    question: "为什么包装或标签和以前不一样？",
    answer: "包装可能因销售地区、贸易版本、生产批次或品牌改版而变化，标签排版、配料和每份数据也可能调整。购买前请核对淘宝订单，收货后以实物标签为准。",
    href: "/versions",
    linkLabel: "查看版本说明",
  },
  {
    question: "开封后应该怎样保存？",
    answer: "请存放在阴凉、干燥处，避免阳光直射、高温和潮湿；每次使用后及时拧紧桶盖，并确保量勺和接触粉末的器具完全干燥。",
  },
  {
    question: "页面信息为什么会和别的地区官网略有差异？",
    answer: "页面优先记录当前中国在售实物包装可确认的信息；ON 不同地区页面和不同批次的规格、配方或标签可能不同。官网参考会单独注明，不会替代实际到货包装。",
  },
  {
    question: "如何返回当前规格与口味？",
    answer: "页面顶部显示当前已核对的规格和口味。官网收录状态不等同于淘宝实时库存，购买前仍需在淘宝商品页再次确认。",
    href: selectorAnchor,
    linkLabel: "返回规格与口味选择",
  },
];

export const micronizedCreatinePageContent: ProteinPageContent = {
  slug: "on-micronized-creatine",
  defaultVariantId: "on-creatine-300g-unflavored",
  eyebrow: "OPTIMUM NUTRITION · MICRONIZED CREATINE POWDER",
  productNameZh: "微粉化肌酸粉",
  productAltNameZh: "ON 微粉化肌酸粉",
  intro: "当前收录中国在售 300 克无味规格。每份数据先按实物包装正面核对，使用方式与产品说明再参考 ON 当前美国官网。",
  factsNote: "包装正面标示每份 5 克一水肌酸、约 60 份；完整配料和注意事项仍以实际到货背标为准。",
  selectorAria: "选择微粉化肌酸粉规格与口味",
  infoTitle: "了解微粉化肌酸粉",
  infoIntro: "本页把实物包装事实与 ON 官网参考分开呈现。不会把蓝莓柠檬味、其他净含量或其他地区新版包装的信息套到当前 300 克无味规格。",
  overviewTitle: "单一无味规格，重点看每份与净含量",
  overview: [
    "当前在售包装正面标示净含量 300 克、约 60 份，每份提供 5 克一水肌酸，并标示 100% Pure Creatine Monohydrate。",
    "“微粉化”描述的是粉末颗粒处理方式。页面只陈列包装与 ON 官网可核对的产品信息，不把它延伸为对每位使用者都相同的训练结果承诺。",
    "ON 当前美国官网建议把无味粉末加入蛋白奶昔或其他饮料。具体每份用量、适用人群、保存和注意事项以实际到货标签为准。",
  ],
  benefits: [
    "每份标示 5 克一水肌酸",
    "300 克无味规格",
    "包装正面标示约 60 份",
    "可加入蛋白奶昔或其他饮料",
    "实物包装信息与官网参考分开注明",
    "包装正面带禁用物质检测标识",
  ],
  suggestedUseNotes: [
    "ON 当前美国官网建议以 1 满茶匙作为一次用量，并加入饮料搅拌。",
    "请使用清洁、干燥的量具，具体克数以实际包装标签和随桶量勺为准。",
    "膳食补充剂不能替代均衡饮食；使用前请阅读实际包装的适用人群与注意事项。",
  ],
  nutritionTitle: "包装正面与标签资料",
  nutritionIntro: "下方为 ON 当前美国官网 0.66 磅 / 60 份无味标签参考，与本页 300 克包装正面的每份和份数一致；最终仍以实际到货背标为准。",
  faqs: [
    {
      question: "当前 300 克规格每份是多少？",
      answer: "当前实物包装正面标示每份 5 克一水肌酸、约 60 份。每次使用仍请以到货包装说明和实际量具为准。",
    },
    {
      question: "一定要在训练前使用吗？",
      answer: "ON 当前美国官网把无味微粉化肌酸描述为可加入日常蛋白奶昔或单独使用，并未把使用时间限定在训练前。请按实际包装建议和个人饮食训练安排使用。",
    },
    ...supplementCommonFaqs("#on-micronized-creatine-selector"),
  ],
};

export const goldStandardPreWorkoutPageContent: ProteinPageContent = {
  slug: "on-gold-standard-pre-workout",
  defaultVariantId: "on-pre-workout-300g-blueberry-lemonade",
  eyebrow: "OPTIMUM NUTRITION · GOLD STANDARD PRE-WORKOUT",
  productNameZh: "金标训练前配方",
  productAltNameZh: "ON 金标训练前配方",
  intro: "当前收录中国在售 300 克蓝莓柠檬味规格。页面按实物包装正面展示每份核心成分，并单独标注 ON 当前官网参考。",
  factsNote: "这批实物包装正面标示一水肌酸 3.3 克、β-丙氨酸 1.6 克；ON 当前美国官网标签写 3 克和 1.5 克。页面以实际销售包装为主，不把版本数据混写。",
  selectorAria: "选择金标训练前配方规格与口味",
  infoTitle: "了解金标训练前配方",
  infoIntro: "以下核心数字来自中国在售实物包装正面；建议使用方式参考 ON 当前美国官网同规格产品。完整配料、警示和营养资料以实际到货背标为准。",
  overviewTitle: "训练前使用的含咖啡因复合配方",
  overview: [
    "当前 300 克蓝莓柠檬味包装正面标示每份含 175 毫克咖啡因、3.3 克一水肌酸和 1.6 克 β-丙氨酸，每桶 30 份。",
    "ON 当前美国官网把 Gold Standard Pre-Workout 定位为训练前使用的能量与专注配方，并建议在运动前 15–30 分钟饮用。",
    "ON 当前美国官网产品文案标示 3 克一水肌酸、1.6 克 β-丙氨酸，官网当前标签图则标示 3 克和 1.5 克；两者都与这批实物包装正面的 3.3 克和 1.6 克不完全相同。购买和使用时请以实际到货包装为准。",
  ],
  benefits: [
    "每份标示 175 毫克咖啡因",
    "每份标示 3.3 克一水肌酸",
    "每份标示 1.6 克 β-丙氨酸",
    "300 克蓝莓柠檬味",
    "包装正面标示 30 份",
    "包装事实与官网参考独立注明",
  ],
  suggestedUseNotes: [
    "ON 当前美国官网建议 1 勺加入约 177–237 毫升冷水，摇匀约 30 秒。",
    "官网建议在运动前 15–30 分钟饮用；实际用量与警示以到货包装为准。",
    "本品每份标示含 175 毫克咖啡因。使用前请核对实际包装警示，不要超过标签建议用量。",
  ],
  nutritionTitle: "包装正面与官网标签参考",
  nutritionIntro: "下方为 ON 当前美国官网蓝莓柠檬味标签参考。标签中的 3 克一水肌酸、1.5 克 β-丙氨酸与本页实物包装正面不同，页面并列展示差异，不把官网标签冒充实际到货背标。",
  faqs: [
    {
      question: "当前蓝莓柠檬味每份含多少咖啡因？",
      answer: "当前实物包装正面标示每份含 175 毫克咖啡因。使用前请同时核对实际包装的建议用量与警示。",
    },
    {
      question: "为什么实物包装与 ON 官网数据不同？",
      answer: "当前中国在售实物包装正面标示 3.3 克一水肌酸和 1.6 克 β-丙氨酸；ON 当前美国官网标签图标示 3 克和 1.5 克。页面以实际销售包装为主，并把官网标签作为版本参考单独展示；最终以收到的商品标签为准。",
    },
    ...supplementCommonFaqs("#on-gold-standard-pre-workout-selector"),
  ],
};
