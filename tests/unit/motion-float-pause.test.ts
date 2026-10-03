import { beforeEach, describe, expect, it, vi } from "vitest";
import { Group } from "three";
import { readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const hooks = vi.hoisted(() => ({
  refs: [] as { current: unknown }[],
  cursor: 0,
  frame: undefined as ((state: { clock: { elapsedTime: number }; invalidate: () => void }) => void) | undefined,
}));
vi.mock("react", async (original) => ({
  ...await original<typeof import("react")>(),
  useRef: () => hooks.refs[hooks.cursor++],
  useImperativeHandle: () => undefined,
}));
vi.mock("@react-three/fiber", () => ({ useFrame: (callback: typeof hooks.frame) => { hooks.frame = callback; } }));

// 运行已安装Drei的真实Float帧回调，隔离渲染调度即可，无浏览器或新增依赖。
import { Float } from "@react-three/drei/core/Float.js";

const render = (Float as unknown as { render: (props: { enabled: boolean; autoInvalidate: boolean; rotationIntensity: number; floatIntensity: number }, ref: null) => unknown }).render;
function configure(enabled: boolean) {
  hooks.cursor = 0;
  render({ enabled, autoInvalidate: enabled, rotationIntensity: .2, floatIntensity: .24 }, null);
}

describe("暂停后的商品悬浮", () => {
  let floating: Group;
  beforeEach(() => {
    floating = new Group();
    hooks.refs = [{ current: floating }, { current: 100 }];
    hooks.cursor = 0; hooks.frame = undefined;
  });

  it("GSAP滚动触发额外渲染时，暂停的Float矩阵保持不变；恢复后继续变化", () => {
    const invalidate = vi.fn();
    configure(true);
    hooks.frame!({ clock: { elapsedTime: 5 }, invalidate });
    const pausedMatrix = floating.matrix.toArray();
    const pausedPosition = floating.position.toArray();
    const pausedRotation = floating.rotation.toArray();
    expect(invalidate).toHaveBeenCalledOnce();

    configure(false);
    const scrollActor = new Group();
    for (const time of [6, 10, 50]) {
      scrollActor.position.x += 1; // 原生滚动编排仍可改变外层位置。
      hooks.frame!({ clock: { elapsedTime: time }, invalidate }); // 相当于GSAP invalidate后的绘制。
      expect(floating.matrix.toArray()).toEqual(pausedMatrix);
      expect(floating.position.toArray()).toEqual(pausedPosition);
      expect(floating.rotation.toArray()).toEqual(pausedRotation);
    }
    expect(invalidate).toHaveBeenCalledOnce();
    configure(true);
    hooks.frame!({ clock: { elapsedTime: 51 }, invalidate });
    expect(floating.matrix.toArray()).not.toEqual(pausedMatrix);
  });

  it("两个商品组都把实际运行状态交给Float.enabled，避免漏接暂停", () => {
    const source = ts.createSourceFile("MotionCanvas.tsx", readFileSync(path.resolve("src/components/motion/MotionCanvas.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let count = 0;
    const visit = (node: ts.Node) => {
      if (ts.isJsxOpeningElement(node) && node.tagName.getText(source) === "Float") {
        const enabled = node.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(source) === "enabled") as ts.JsxAttribute | undefined;
        expect(enabled?.initializer?.getText(source)).toBe("{running}");
        count++;
      }
      ts.forEachChild(node, visit);
    };
    visit(source); expect(count).toBe(2);
  });
});
