import { MeshBasicMaterial, Texture } from "three";

export const onTub = { radius: 1.03, labelBottom: -1.14, labelTop: .44, bottom: -1.57, top: 1.67 } as const;

// 接缝优先避开正面标题、营养表和条码；照片不是印刷展开图。
export function onLabelViewAt(surfaceDegrees: number) {
  const angle = ((surfaceDegrees % 360) + 360) % 360;
  return angle < 60 || angle >= 300 ? 0 : angle < 111 ? 6 : angle < 165 ? 5 : angle < 213 ? 4 : angle < 250 ? 3 : 2;
}

export function onLabelPhotoUv(x: number, y: number, z: number, view: number) {
  const angle = view * Math.PI / 4;
  const across = x * Math.cos(angle) + z * Math.sin(angle);
  const depth = -x * Math.sin(angle) + z * Math.cos(angle);
  const t = (y - onTub.labelBottom) / (onTub.labelTop - onTub.labelBottom);
  // 原图的弧面上下缘分别600/1360px；校正已拍入照片的竖向弧度。
  const photoY = 1360 - 760 * t + (depth / onTub.radius - 1) * (65 - 35 * t);
  return { u: (800 + across * 520 / onTub.radius) / 1600, v: 1 - photoY / 1600 };
}

export function createOnLabelMaterial(textures: Texture[]) {
  if (textures.length !== 8) throw new Error("ON旋转包装需要同一SKU的八张真实照片");
  // 原图已有棚拍光影，标签不重复受场景灯光/色调映射影响，避免文字被高光吞没。
  const material = new MeshBasicMaterial({ map: textures[0], toneMapped: false });
  material.name = "ON Vanilla Ice Cream 73 servings · eight verified photos";
  material.onBeforeCompile = (shader) => {
    textures.forEach((texture, i) => { shader.uniforms[`onPhoto${i}`] = { value: texture }; });
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vOnLocal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOnLocal = position;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", `#include <common>
varying vec3 vOnLocal;
${textures.map((_, i) => `uniform sampler2D onPhoto${i};`).join("\n")}
vec2 onPhotoUv(float angle) {
  float across = vOnLocal.x * cos(angle) + vOnLocal.z * sin(angle);
  float depth = -vOnLocal.x * sin(angle) + vOnLocal.z * cos(angle);
  float t = (vOnLocal.y - ${onTub.labelBottom.toFixed(5)}) / ${(onTub.labelTop - onTub.labelBottom).toFixed(5)};
  float photoY = 1360.0 - 760.0 * t + (depth / ${onTub.radius.toFixed(5)} - 1.0) * (65.0 - 35.0 * t);
  return vec2((800.0 + across * ${(520 / onTub.radius).toFixed(7)}) / 1600.0, 1.0 - photoY / 1600.0);
}
bool onBackdrop(vec3 c) {
  bool darkNeutral = max(c.r, max(c.g, c.b)) < 0.22 && abs(c.r-c.g) < 0.025 && abs(c.g-c.b) < 0.025;
  bool red = c.r > 0.08 && c.g < 0.1 && c.b < 0.12 && c.r > 2.4 * max(c.g,c.b);
  return darkNeutral || red;
}
vec4 onBackgroundJoin(vec4 base, vec4 left, vec4 right, float distance) {
  // 仅底色缓接；奶白/金色文字、营养表、白色图标和条码不混合。
  if (abs(distance) < 4.0 && onBackdrop(left.rgb) && onBackdrop(right.rgb)) {
    return mix(left, right, smoothstep(-4.0,4.0,distance));
  }
  return base;
}
`).replace("#include <map_fragment>", `
float onAngle = mod(degrees(atan(vOnLocal.x, vOnLocal.z)) + 360.0, 360.0);
// 所有纹理采样必须在分支外计算。否则接缝处隐式导数会选到含白底的低级mipmap。
${textures.map((_, i) => `vec4 onSample${i} = texture2D(onPhoto${i}, onPhotoUv(${(i * Math.PI / 4).toFixed(9)}));`).join("\n")}
vec4 onLabel = (onAngle < 60.0 || onAngle >= 300.0) ? onSample0 : onAngle < 111.0 ? onSample6 : onAngle < 165.0 ? onSample5 : onAngle < 213.0 ? onSample4 : onAngle < 250.0 ? onSample3 : onSample2;
onLabel = onBackgroundJoin(onLabel,onSample0,onSample6,onAngle-60.0);
onLabel = onBackgroundJoin(onLabel,onSample6,onSample5,onAngle-111.0);
onLabel = onBackgroundJoin(onLabel,onSample5,onSample4,onAngle-165.0);
onLabel = onBackgroundJoin(onLabel,onSample4,onSample3,onAngle-213.0);
onLabel = onBackgroundJoin(onLabel,onSample3,onSample2,onAngle-250.0);
onLabel = onBackgroundJoin(onLabel,onSample2,onSample0,onAngle-300.0);
diffuseColor *= onLabel;
`);
  };
  material.customProgramCacheKey = () => "on-vanilla-73-eight-source-v3";
  return material;
}
