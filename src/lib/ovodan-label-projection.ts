import { MeshStandardMaterial, Texture } from "three";
import { OvodanLabelFlavor, ovodanLabelViews, strawberryLabelSeams } from "@/data/ovodan-labels";

export function labelViewAt(surfaceDegrees: number) {
  const angle = ((surfaceDegrees % 360) + 360) % 360;
  return angle < strawberryLabelSeams[0] || angle >= strawberryLabelSeams[2] ? 0 : angle < strawberryLabelSeams[1] ? 2 : 1;
}

// 逆向曲面投射：在每个拍摄面中心，文字位置和方向与原图保持一致。
// 坐标来自1500×2126原始母图；补传图等比缩至1445×2048，归一化UV不变。
export function labelPhotoUv(position: { x: number; y: number; z: number }, viewIndex: number, flavor: OvodanLabelFlavor = "strawberry") {
  const view = ovodanLabelViews[flavor][viewIndex];
  const angle = view.centerDegrees * Math.PI / 180;
  const across = position.x * Math.cos(angle) - position.z * Math.sin(angle);
  const pixelY = Math.max(663, Math.min(1702, 1708 - position.y * 400));
  return { u: (view.centerPixelX + across * 400 * .99) / 1500, v: 1 - pixelY / 2126 };
}

// 只接合纯红背景；白字、金字、蓝色商标、黑白条码及粉末图案均不混合。
export function isPlainRedBackground(rgb: readonly [number, number, number]) {
  return rgb[0] > .07 && rgb[1] < .08 && rgb[2] < .08 && rgb[0] > Math.max(rgb[1], rgb[2]) * 3.2;
}

export function isPlainLabelBackground(rgb: readonly [number, number, number], flavor: OvodanLabelFlavor) {
  if (flavor === "strawberry") return isPlainRedBackground(rgb);
  const [r, g, b] = rgb;
  return r > .04 && g > .12 && b > .23 && g > r * 1.4 && b > r * 1.6 && b > g * 1.15 && b < g * 2.2;
}

const projectionShader = (flavor: OvodanLabelFlavor) => `
varying vec3 vOvodanLocalPosition;
uniform sampler2D ovodanFront;
uniform sampler2D ovodanIngredients;
uniform sampler2D ovodanNutrition;
vec2 ovodanUv(float angle, float centerX) {
  float across = vOvodanLocalPosition.x * cos(angle) - vOvodanLocalPosition.z * sin(angle);
  // 上下只收进数像素无字底色，兼顾JPG白底与PNG透明底的轮廓边缘。
  float photoY = clamp(1708.0 - vOvodanLocalPosition.y * 400.0, 663.0, 1702.0);
  return vec2((centerX + across * 396.0) / 1500.0, 1.0 - photoY / 2126.0);
}
vec4 ovodanPhoto(sampler2D source, vec2 uv, float centerX) {
  vec4 pixel = texture2D(source, uv);
  if (pixel.a < 0.98) {
    // 原图透明外轮廓向瓶内采样少量像素，避免黑色透明底渗入；不动不透明标签。
    uv.x = mix(uv.x, centerX / 1500.0, 0.02);
    uv.y = clamp(uv.y, 1.0 - 1702.0 / 2126.0, 1.0 - 663.0 / 2126.0);
    pixel = texture2D(source, uv);
  }
  return pixel;
}
bool ovodanPlainBackground(vec3 color) {
  return ${flavor === "strawberry" ? "color.r > 0.07 && color.g < 0.08 && color.b < 0.08 && color.r > max(color.g, color.b) * 3.2" : "color.r > 0.04 && color.g > 0.12 && color.b > 0.23 && color.g > color.r * 1.4 && color.b > color.r * 1.6 && color.b > color.g * 1.15 && color.b < color.g * 2.2"};
}
vec4 ovodanBackgroundJoin(vec4 base, vec4 left, vec4 right, float distance) {
  if (abs(distance) < 4.0 && ovodanPlainBackground(left.rgb) && ovodanPlainBackground(right.rgb)) {
    return mix(left, right, smoothstep(-4.0, 4.0, distance));
  }
  return base;
}
`;

const mapShader = (flavor: OvodanLabelFlavor) => {
  const views = ovodanLabelViews[flavor];
  return `
vec4 ovFront = ovodanPhoto(ovodanFront, ovodanUv(${(views[0].centerDegrees * Math.PI / 180).toFixed(9)}, ${views[0].centerPixelX.toFixed(1)}), ${views[0].centerPixelX.toFixed(1)});
vec4 ovIngredients = ovodanPhoto(ovodanIngredients, ovodanUv(${(views[1].centerDegrees * Math.PI / 180).toFixed(9)}, ${views[1].centerPixelX.toFixed(1)}), ${views[1].centerPixelX.toFixed(1)});
vec4 ovNutrition = ovodanPhoto(ovodanNutrition, ovodanUv(${(views[2].centerDegrees * Math.PI / 180).toFixed(9)}, ${views[2].centerPixelX.toFixed(1)}), ${views[2].centerPixelX.toFixed(1)});
float ovAngle = mod(degrees(atan(vOvodanLocalPosition.x, vOvodanLocalPosition.z)) + 360.0, 360.0);
vec4 ovLabel = (ovAngle < ${strawberryLabelSeams[0].toFixed(1)} || ovAngle >= ${strawberryLabelSeams[2].toFixed(1)}) ? ovFront : (ovAngle < ${strawberryLabelSeams[1].toFixed(1)} ? ovNutrition : ovIngredients);
ovLabel = ovodanBackgroundJoin(ovLabel, ovFront, ovNutrition, ovAngle - ${strawberryLabelSeams[0].toFixed(1)});
ovLabel = ovodanBackgroundJoin(ovLabel, ovNutrition, ovIngredients, ovAngle - ${strawberryLabelSeams[1].toFixed(1)});
ovLabel = ovodanBackgroundJoin(ovLabel, ovIngredients, ovFront, ovAngle - ${strawberryLabelSeams[2].toFixed(1)});
diffuseColor *= ovLabel;
`;
};

export function createOvodanLabelMaterial(textures: readonly [Texture, Texture, Texture], flavor: OvodanLabelFlavor = "strawberry") {
  const material = new MeshStandardMaterial({ map: textures[0], roughness: .72, metalness: 0, toneMapped: false });
  material.name = `OVODAN ${flavor} · three verified source views`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.ovodanFront = { value: textures[0] };
    shader.uniforms.ovodanIngredients = { value: textures[1] };
    shader.uniforms.ovodanNutrition = { value: textures[2] };
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vOvodanLocalPosition;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvOvodanLocalPosition = position;");
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\n" + projectionShader(flavor))
      .replace("#include <map_fragment>", mapShader(flavor));
  };
  material.customProgramCacheKey = () => `ovodan-${flavor}-three-source-projection-v2`;
  return material;
}
