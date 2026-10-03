import { describe, expect, it } from "vitest";
import { Euler, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { choreographyYawAt, productChoreography } from "@/lib/on-choreography";
import { heroGoldModel } from "@/lib/hero-bottle-motion";

describe("ON整罐透视编排", () => {
  it("回顶或章节跳转尚未收尾时，手动正面使用目标角度，不遗留中间角度", () => {
    const motion=productChoreography(false,1440/824);
    expect(choreographyYawAt(motion,0)).toBe(0);
    expect(choreographyYawAt(motion,.5)).toBeCloseTo(2*Math.PI);
    expect(choreographyYawAt(motion,-1)).toBe(0);
    expect(choreographyYawAt(motion,2)).toBeCloseTo(3.25*Math.PI);
    for(const stop of motion.stops.slice(1,-1)) expect(Math.abs(choreographyYawAt(motion,stop+.00001)-choreographyYawAt(motion,stop-.00001))).toBeLessThan(.001);
  });
  it.each([false,true])("四个滚动姿态改变真实XYZ与纵深，辅助正面图始终朝向镜头：mobile=%s", mobile => {
    const motion = productChoreography(mobile,mobile?390/772:1440/824);
    const gold = motion.actors.slice(0,4).map(frame=>frame[2]);
    expect(new Set(gold.map(p=>p.rx)).size).toBe(4);
    expect(new Set(gold.map(p=>p.rz)).size).toBe(4);
    expect(new Set(gold.map(p=>p.z)).size).toBe(4);
    expect(gold[2].ry-gold[0].ry).toBeCloseTo(Math.PI*2);
    for(const frame of motion.actors) for(const photo of frame.slice(3)) {
      expect(photo.rx).toBe(0); expect(photo.ry).toBe(0);
    }
    expect(motion.actors[4][2].x).toBeGreaterThan(1);
  });

  it("主罐在两个停留位置含悬停放大仍保留屏幕边距", () => {
    for(const [width,height] of [[1440,824],[390,772],[320,760]]) {
      const mobile=width<761, motion=productChoreography(mobile,width/height);
      const camera=new PerspectiveCamera(30,width/height,.1,60);camera.position.z=12;camera.updateMatrixWorld();
      const vh=24*Math.tan(Math.PI/12),vw=vh*width/height;
      for(const index of [0,2]) {
        const p=motion.actors[index][2], fit=mobile?heroGoldModel.mobileFit:heroGoldModel.desktopFit;
        const scale=p.scale*vh/heroGoldModel.height*fit*heroGoldModel.inspectZoom;
        for(const [idleX,idleZ] of [[-.13,-.105],[.13,.105]]) {
          const outer=new Matrix4().compose(new Vector3(p.x*vw,p.y*vh,p.z),new Quaternion().setFromEuler(new Euler(p.rx,p.ry,p.rz)),new Vector3(scale,scale,scale));
          outer.multiply(new Matrix4().makeRotationFromEuler(new Euler(idleX,0,idleZ)));
          outer.multiply(new Matrix4().makeRotationX(heroGoldModel.pitch));
          for(const [radius,y] of [[.85,-1.47],[1.03,-1.29],[1.03,.48],[.85,.925],[.664,1.339]]) for(let j=0;j<24;j++) {
            const a=j*Math.PI/12,v=new Vector3(Math.sin(a)*radius,y-heroGoldModel.centerY,Math.cos(a)*radius).applyMatrix4(outer).project(camera);
            const x=(.5+v.x/2)*width,sy=(.5-v.y/2)*height;
            expect(x,`${width}, stop${index}`).toBeGreaterThan(mobile?8:width*.45);
            expect(x,`${width}, stop${index}`).toBeLessThan(width-8);
            expect(sy,`${width}, stop${index}`).toBeGreaterThan(mobile?318:65);
            expect(sy,`${width}, stop${index}`).toBeLessThan(height-(mobile?68:100));
          }
        }
      }
    }
  });
});
