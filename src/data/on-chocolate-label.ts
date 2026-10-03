export type OnSampleVariant = "chocolate" | "vanilla";

export const onChocolateLabel = {
  libraryFileId: "libfile_e35cf582e09c8191879140bf9ea17e8d",
  sourceName: "US_GSW_5LB_DRC_6076685 5.05磅2.29kg.pdf",
  pdfSha256: "d89d112807a6360906d7b9db37327dba5f595d24c14b87b36944cc158d8cea4e",
  texture: "/assets/media/on-chocolate-label-20261002/chocolate-label-srgb.webp",
  textureSha256: "143a26bbf51c29f6ea0583401eedff7f39b2a3eadffd1e81567ff052cfb6658e",
  poster: { src: "/assets/media/on-chocolate-label-20261002/hero-poster-v16.png", width: 829, height: 720, alt: "ON金标乳清双重巧克力味74份，完整标签三维展示的静态封面" },
  // 用户授权的局部印刷色显示校正；原始PDF/WebP保留，不影响奶金亮字和黑底。
  displayInk: { red: { source: "#d6252d", target: "#a62327" }, gold: { source: "#f9a51b", target: "#ca9f55" } },
  pageWidthPoints: 1534.5,
  pageHeightPoints: 378,
  frontU: .485,
  flavor: "Double Rich Chocolate",
  netWeight: "5.05 lb / 2.29 kg",
  servings: 74,
  barcode: "748927028669",
  artwork: "V.8.866.0825US / 6076685",
} as const;

export const onChocolateViews = [
  { yaw: 0, name: "正面" },
  { yaw: 130, name: "品牌说明" },
  { yaw: 210, name: "用法与条码" },
  { yaw: 245, name: "营养与配料" },
];
