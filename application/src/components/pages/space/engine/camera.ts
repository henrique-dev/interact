import { Engine } from './engine';
import { SpaceMap } from './space-map';

export class Camera {
  engine: Engine;
  spaceMap: SpaceMap;
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(engine: Engine, spaceMap: SpaceMap, x: number, y: number, width: number, height: number) {
    this.engine = engine;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.spaceMap = spaceMap;
  }

  move(ox: number, oy: number) {
    const fx = Math.max(0, ox - this.width / 2);

    const dx = this.spaceMap.width - (fx + this.width);

    if (dx >= 0) {
      this.x = fx;
    }

    const fy = Math.max(0, oy - this.height / 2);

    const dy = this.spaceMap.height - (fy + this.height)

    if (dy >= 0) {
      this.y = fy;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.save();

    context.restore();
  }
}
