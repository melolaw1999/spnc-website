// 原创云密度纹理。只生成环境云粒子，不处理商品标签或图片。
export function createCloudDensityTexture(size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!, pixels = context.createImageData(size, size);
  const field = new Float32Array(size * size);
  let seed = 739;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const noise = [12, 24, 48].map((width) => ({ width, values: Float32Array.from({ length: (width + 1) ** 2 }, random) }));
  const smooth = (v: number) => v * v * (3 - 2 * v);
  const sample = (layer: typeof noise[number], x: number, y: number) => {
    const px = x * layer.width, py = y * layer.width, ix = Math.floor(px), iy = Math.floor(py);
    const fx = smooth(px - ix), fy = smooth(py - iy), stride = layer.width + 1;
    const a = layer.values[iy * stride + ix], b = layer.values[iy * stride + ix + 1];
    const c = layer.values[(iy + 1) * stride + ix], d = layer.values[(iy + 1) * stride + ix + 1];
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
  };
  const lobes = [[-.43,.08,.23,.22],[-.24,-.06,.28,.32],[.06,-.17,.28,.36],[.33,-.03,.29,.30],[.48,.12,.21,.22],[.12,.19,.40,.27],[-.2,.20,.30,.23]];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size, px = u * 2 - 1, py = v * 2 - 1;
    let density = 0;
    // 连续叠加密度，不取最大球面：避免法线在球团交界形成硬折面。
    for (const [cx, cy, rx, ry] of lobes) density += Math.exp(-2.8 * (((px-cx)/rx)**2 + ((py-cy)/ry)**2));
    const detail = (sample(noise[0],u,v)-.5)*.24 + (sample(noise[1],u,v)-.5)*.10 + (sample(noise[2],u,v)-.5)*.04;
    field[y * size + x] = Math.max(0, (density - .22) / 1.8 + detail * .65);
  }
  for (let y = 1; y < size-1; y++) for (let x = 1; x < size-1; x++) {
    const i = y * size + x, h = field[i]; if (h <= 0) continue;
    const dx = (field[i+1] - field[i-1]) * 12, dy = (field[i+size] - field[i-size]) * 12;
    const lit = Math.max(0, (-dx * .48 - dy * .68 + .58) / Math.hypot(dx,dy,1));
    const light = Math.max(0, Math.min(1, .22 + lit * .95 - (y/size-.45)*.22));
    const alpha = smooth(Math.min(1, h/.50)) * .94;
    const p = i * 4;
    pixels.data[p] = 166 + 85 * light;
    pixels.data[p+1] = 180 + 73 * light;
    pixels.data[p+2] = 202 + 53 * light;
    pixels.data[p+3] = alpha * 255;
  }
  context.putImageData(pixels,0,0);
  const softened = document.createElement("canvas"); softened.width = softened.height = size;
  const soft = softened.getContext("2d")!; soft.filter = `blur(${6 * size / 512}px)`; soft.drawImage(canvas,0,0);
  return softened.toDataURL("image/png");
}
