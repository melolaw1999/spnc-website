import { Float32BufferAttribute, LatheGeometry, Vector2 } from "three";

// 移植现有欧福Blender工程的原图轮廓。仅近似外形＋原始正面投射，不补造背面标签。
export const bottlePixelProfile = [
  [1708,192],[1704,204],[1694,216],[1675,218],[1650,226],[1625,233],[1600,240],
  [1575,245],[1550,249],[1525,249],[1500,249],[1475,249],[1450,247],[1400,243],
  [1350,241],[1300,238],[1250,236],[1200,235],[1150,235],[1100,235],[1050,235],
  [1000,237],[950,239],[900,243],[850,247],[825,249],[800,247],[775,241],
  [750,229],[725,207],[700,181],[680,163],[661,156],
] as const;
export const bottleHeight = 3.195;

function lathe(profile: readonly (readonly [number, number])[], segments = 64) {
  return new LatheGeometry(profile.map(([height, radius]) => new Vector2(radius, height)), segments);
}

export function createOvodanGeometries(frontHalfAngle = Math.PI / 2) {
  const body = lathe(bottlePixelProfile.map(([y, r]) => [(1708-y)/400, r/400]));
  const positions = body.getAttribute("position");
  const uvs: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    uvs.push((774 + positions.getX(i)*400*.99)/1500, 1-(1708-positions.getY(i)*400)/2126);
  }
  body.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  body.clearGroups();
  const index = body.getIndex()!;
  const frontIndices: number[] = [], backIndices: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const x = (positions.getX(index.getX(i)) + positions.getX(index.getX(i+1)) + positions.getX(index.getX(i+2)))/3;
    const z = (positions.getZ(index.getX(i)) + positions.getZ(index.getX(i+1)) + positions.getZ(index.getX(i+2)))/3;
    // 首页仍沿用原半面投射；独立样品限于正面±55°，未知侧背面保持无标签。
    const front = frontHalfAngle === Math.PI / 2 ? z >= -.008 : z / Math.hypot(x, z) >= Math.cos(frontHalfAngle);
    (front ? frontIndices : backIndices).push(index.getX(i), index.getX(i+1), index.getX(i+2));
  }
  body.setIndex([...frontIndices, ...backIndices]);
  body.addGroup(0, frontIndices.length, 0);
  body.addGroup(frontIndices.length, backIndices.length, 1);
  const neck = lathe([[2.61,.39],[2.65,.377],[2.70,.38],[2.745,.383],[2.757,.424],[2.775,.427],[2.79,.406]]);
  const cap = lathe([[2.782,.422],[2.79,.431],[2.805,.431],[3.165,.431],[3.185,.425],[3.195,.405]]);
  return { body, neck, cap };
}
