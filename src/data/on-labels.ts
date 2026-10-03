// 同一件新包装：香草冰淇淋味，5 lb / 2.26 kg，73份。八张原图保持原字节。
export const onLabelSource = {
  libraryFileId: "libfile_53ef7e3841008191afae2c89821da543",
  productUrl: "https://ca.iherb.com/pr/optimum-nutrition-gold-standard-100-whey-vanilla-ice-cream-5-lb-2-26-kg/27514",
  identity: "Vanilla Ice Cream · 5 lb / 2.26 kg · 73 servings",
  imageSize: 1600,
} as const;

export const onLabelViews = [
  { file: 85, yaw: 0, name: "正面", sha256: "5666d317599e713b1414402734e820372ac089e90648c7baad07ce2541aa1de9" },
  { file: 86, yaw: 45, name: "左前侧", sha256: "c0cfc65d1b0f6edcc1fb625e5b50c91fd5c8472b23b7573754500b38554ff00c" },
  { file: 87, yaw: 90, name: "品牌说明", sha256: "fef89661286f1aaefecdcca0deb1902e7459ae76d04fea0b5b232ae0c8d9cc96" },
  { file: 88, yaw: 135, name: "左后侧", sha256: "cb17451620b22a2c2f25c3799e9900af9937fed6a9785a7f4f4f653307fd3fa7" },
  { file: 89, yaw: 180, name: "背部接缝", sha256: "957e96fb584ca4fe2acc7970a6928996e82c5875ff5e03b89b0dac044da612ea" },
  { file: 90, yaw: 225, name: "用法与条码", sha256: "638fb55521465e8ae19745113bc427c7d882149f18222195bbc7170e2386601d" },
  { file: 91, yaw: 270, name: "营养与配料", sha256: "82b5df529f550edded8be2b90f572523ba99e246084009ea65d8bf8d4485171c" },
  { file: 92, yaw: 315, name: "右前侧", sha256: "a7c467034902199469b2f9d7aa589e4308201d4dafc2f3f771c172b5e07ab9c7" },
].map((view) => ({ ...view, image: `/assets/media/on-vanilla-360-20261002/${view.file}.avif` }));
