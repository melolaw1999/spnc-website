// 用户补传的同一草莓225mL三面原图。角度用于展示拼接，不是工程接缝坐标。
export const strawberryLabelViews = [
  { id: "front", name: "正面", image: "/assets/media/product-motion-20261002/strawberry-label-front.png", centerDegrees: 0, viewDegrees: 0, centerPixelX: 774, libraryFileId: "libfile_033545b45f6c8191984875abbb15fdc0", sha256: "fa56ce410845457beb72a7e2a6c7ff7e8569862bad65a978bbb780ca97044539" },
  { id: "ingredients", name: "配料面", image: "/assets/media/product-motion-20261002/strawberry-ingredients.png", centerDegrees: 235, viewDegrees: 125, centerPixelX: 780, libraryFileId: "libfile_90246e0ec23c819197112b9ccf957ff4", sha256: "13d8024cbd63b9b7aa3248740939fe9d65a2836579839aac1b79daea99af4bbc" },
  { id: "nutrition", name: "营养面", image: "/assets/media/product-motion-20261002/strawberry-nutrition.png", centerDegrees: 125, viewDegrees: 235, centerPixelX: 766, libraryFileId: "libfile_e62c4e4e5ee4819180f3470fa4b3d461", sha256: "42ce601fd545f5e65560cc94e2dcb0a3acd90e191eb818bcc24a929e9e7ce358" },
] as const;

// 正面140°保留完整主标；配料与营养各110°，三面只出现一次。
export const strawberryLabelSeams = [70, 180, 290] as const;

export type OvodanLabelFlavor = "strawberry" | "passionfruit";
export const passionfruitLabelViews = [
  { id: "front", name: "正面", image: "/assets/media/product-motion-20261002/passionfruit-label-front.jpg", centerDegrees: 0, viewDegrees: 0, centerPixelX: 774, libraryFileId: "libfile_17b7117a42708191861e15879be02876", sha256: "23f4a77eec292bdc471c16d8195b03c73d221cb03ddee65a192523d1db92d848" },
  { id: "ingredients", name: "配料面", image: "/assets/media/product-motion-20261002/passionfruit-ingredients.jpg", centerDegrees: 235, viewDegrees: 125, centerPixelX: 783, libraryFileId: "libfile_6ad06b9940f081918faabef43027f6b4", sha256: "6141381a3ef5a43b4c86f6081279d3ad1a3976125dbf0b6f57971b905b35367f" },
  { id: "nutrition", name: "营养面", image: "/assets/media/product-motion-20261002/passionfruit-nutrition.jpg", centerDegrees: 125, viewDegrees: 235, centerPixelX: 766, libraryFileId: "libfile_76dd49003bd48191b58d4dee615a430f", sha256: "f450b973134760fa9534001db757e40298db74215a824a025420f6c2f16ae6c1" },
] as const;
export const ovodanLabelViews = { strawberry: strawberryLabelViews, passionfruit: passionfruitLabelViews } as const;
