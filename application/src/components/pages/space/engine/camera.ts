import { Engine } from './engine';
import { SpaceMap } from './space-map';

export class Camera {
  engine: Engine;
  spaceMap: SpaceMap;
  x: number = 0;
  y: number = 0;
  width: number;
  height: number;

  constructor(engine: Engine, spaceMap: SpaceMap, x: number, y: number, width: number, height: number) {
    this.engine = engine;
    this.width = width;
    this.height = height;
    this.spaceMap = spaceMap;

    this.resize(x, y, this.width, this.height);
  }

  resize(x: number, y: number, w: number, h: number) {
    this.width = w;
    this.height = h;

    if (this.engine.offsetX > 0) {
      this.x = 0;
    } else {
      this.x =
        this.spaceMap.width -
        this.engine.canvas.clientWidth -
        this.engine.canvas.clientWidth / 2 +
        Math.min(x, this.engine.canvas.clientWidth / 2);
    }

    if (this.engine.offsetY > 0) {
      this.y = 0;
    } else {
      this.y = Math.max(0, y - this.engine.canvas.clientHeight / 2);
    }
  }

  move(ox: number, oy: number) {
    const fx = Math.max(0, ox - this.width / 2);

    const dx = this.spaceMap.width - (fx + this.width);

    if (dx >= 0) {
      this.x = fx;
    }

    const fy = Math.max(0, oy - this.height / 2);

    const dy = this.spaceMap.height - (fy + this.height);

    if (dy >= 0) {
      this.y = fy;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.save();

    context.restore();
  }
}
