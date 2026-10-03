import { describe, expect, it } from "vitest";
import { advanceHeroBottleYaw, advanceHeroGoldYaw, heroGoldModel } from "@/lib/hero-bottle-motion";
import { motionChapters, motionFrames } from "@/lib/product-motion";

describe("首页欧福真实瓶体旋转", () => {
  it("完整金标只在ON章节就绪且未暂停/细看时旋转，滚动额外绘制不能推进角度", () => {
    for(const chapter of [0,1,2]) for(const running of [true,false]) for(const ready of [true,false]) for(const inspecting of [true,false]) {
      const next = advanceHeroGoldYaw(1.2,1/60,chapter,running,ready,inspecting);
      expect(next > 1.2).toBe(chapter !== motionChapters.ovodan && running && ready && !inspecting);
    }
  });

  it("金标真实体积和6%放大在手机、桌面的文案与底部控制之间留边", () => {
    for(const mobile of [true,false]) for(const [width,height] of mobile ? [[310,760],[320,760],[390,772],[390,900]] : [[1024,720],[1440,824],[1440,924]]) {
      const frames = motionFrames(mobile,width/height);
      for(const chapter of [motionChapters.intro,motionChapters.on]) {
        const actor=frames.photos[chapter][0];
        const scale=actor.scale*height*(mobile?heroGoldModel.mobileFit:heroGoldModel.desktopFit)*heroGoldModel.inspectZoom;
        const bodyWidth=scale*heroGoldModel.width/heroGoldModel.height;
        const bodyHeight=scale*(Math.cos(heroGoldModel.pitch)+heroGoldModel.width/heroGoldModel.height*Math.sin(heroGoldModel.pitch));
        const halfX=(bodyWidth*Math.cos(actor.rz)+bodyHeight*Math.abs(Math.sin(actor.rz)))/2;
        const halfY=(bodyHeight*Math.cos(actor.rz)+bodyWidth*Math.abs(Math.sin(actor.rz)))/2;
        const x=(.5+actor.x)*width,y=(.5-actor.y)*height;
        expect(x-halfX).toBeGreaterThan(mobile?12:width*.45);
        expect(x+halfX).toBeLessThan(width-12);
        expect(y-halfY).toBeGreaterThan(mobile?330:80);
        expect(y+halfY).toBeLessThan(height-68);
      }
    }
  });
  it("只在欧福段、贴图已就绪且正在播放时自转，滚动额外绘制不会破坏暂停", () => {
    const yaw = 2.1;
    for (const chapter of [0, 1, 2]) for (const running of [false, true]) for (const ready of [false, true]) {
      const next = advanceHeroBottleYaw(yaw, 1 / 60, chapter, running, ready);
      if (chapter === motionChapters.ovodan && running && ready) expect(next).toBeGreaterThan(yaw);
      else expect(next).toBe(yaw);
    }
    expect(advanceHeroBottleYaw(yaw, 30, motionChapters.ovodan, true, true) - yaw).toBeLessThan(.02);
  });

  it("手机单瓶完整落在文案/三面按钮与底部控制之间，两口味中心一致", () => {
    for (const width of [310, 320, 360, 390]) for (const height of [760, 772, 900]) {
      const frame = motionFrames(true, width / height).bottles[motionChapters.ovodan];
      expect(frame[0]).toEqual(frame[1]);
      const actor = frame[0], visibleHeight = actor.scale * height;
      const halfWidth = visibleHeight * (.4 + Math.sin(.04)) / 2 + 2;
      expect(width / 2 - halfWidth).toBeGreaterThan(12);
      expect((.5 - actor.y) * height - visibleHeight / 2 - 5).toBeGreaterThan(365);
      expect((.5 - actor.y) * height + visibleHeight / 2 + 5).toBeLessThan(height - 84);
      expect(frame.slice(2).every((pose) => pose.scale < .01)).toBe(true);
    }
  });
});
