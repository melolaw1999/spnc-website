/* Adapted from Prismic course-fizzi-next, Apache-2.0, commit 84b5775.
 * 2026-10-02: replace actor refs and selector with SPNC refs; preserve all
 * source Hero transform targets, offsets, duration and easing values.
 * See licenses/fizzi-NOTICE.txt and fizzi-Apache-2.0.txt.
 */
import gsap from "gsap";
import type { Group } from "three";

export function resetFizziActors(group: Group, actors: Group[]) {
  group.position.set(0, 0, 0); group.rotation.set(0, 0, 0);
  actors.forEach((actor) => { actor.position.set(0, 0, 0); actor.rotation.set(0, 0, 0); });
  actors[0].position.x = -1.5; actors[0].rotation.z = -.5;
  actors[1].position.x = 1.5; actors[1].rotation.z = .5;
  actors[2].position.set(0, 5, 2);
  actors[3].position.set(2, 4, 2);
  actors[4].position.y = -5;
}

export function addFizziScrollTracks(timeline: gsap.core.Timeline, group: Group, actors: Group[]) {
  return timeline
    .to(group.rotation, { y: Math.PI * 2 })
    .to(actors[0].position, { x: -.2, y: -.7, z: -2 }, 0)
    .to(actors[0].rotation, { z: .3 }, 0)
    .to(actors[1].position, { x: 1, y: -.2, z: -1 }, 0)
    .to(actors[1].rotation, { z: 0 }, 0)
    .to(actors[2].position, { x: -.3, y: .5, z: -1 }, 0)
    .to(actors[2].rotation, { z: -.1 }, 0)
    .to(actors[3].position, { x: 0, y: -.3, z: .5 }, 0)
    .to(actors[3].rotation, { z: .3 }, 0)
    .to(actors[4].position, { x: .3, y: .5, z: -.5 }, 0)
    .to(actors[4].rotation, { z: -.25 }, 0)
    .to(group.position, { x: 1, duration: 3, ease: "sine.inOut" }, 1.3);
}

export function addFizziEntrance(timeline: gsap.core.Timeline, groups: Group[]) {
  return timeline
    .from(groups[0].position, { y: -5, x: 1 }, 0)
    .from(groups[0].rotation, { z: 3 }, 0)
    .from(groups[1].position, { y: 5, x: 1 }, 0)
    .from(groups[1].rotation, { z: 3 }, 0);
}
