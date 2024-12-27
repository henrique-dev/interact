import { Camera } from './camera';
import { Engine } from './engine';

export class Actor {
  engine: Engine;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collisionBox: { x: number; y: number; w: number; h: number };
  collisionAreaToCheck: { x: number; y: number; w: number; h: number };
  movements: { x: number; y: number }[];
  faceDirection: { x: number; y: number };

  constructor(
    engine: Engine,
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    collisionBox: { x: number; y: number; w: number; h: number }
  ) {
    this.engine = engine;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.collisionBox = collisionBox;
    this.movements = [];
    this.faceDirection = { x: 0, y: 1 };

    const collisionAreaToCheckWidth = 600;
    const collisionAreaToCheckHeight = 500;
    this.collisionAreaToCheck = {
      x: -(collisionAreaToCheckWidth / 2 - width / 2),
      y: -(collisionAreaToCheckHeight / 2 - height / 2),
      w: collisionAreaToCheckWidth,
      h: collisionAreaToCheckHeight,
    };
  }

  update(_deltaTime: number) {}

  draw(_context: CanvasRenderingContext2D, _camera: Camera) {}

  collidesWith(collisionBox: { x: number; y: number; w: number; h: number }) {
    const scaleX = this.engine.scaleX;
    const scaleY = this.engine.scaleY;

    const Ax = scaleX * (this.x + this.collisionBox.x);
    const Ay = scaleY * (this.y + this.collisionBox.y);
    const Aw = scaleX * this.collisionBox.w;
    const Ah = scaleY * this.collisionBox.h;
    const Bx = scaleX * collisionBox.x;
    const By = scaleY * collisionBox.y;
    const Bw = scaleX * collisionBox.w;
    const Bh = scaleY * collisionBox.h;

    if (Bx + Bw >= Ax && Bx < Ax + Aw && By + Bh >= Ay && By < Ay + Ah) {
      return true;
    }

    return false;
  }

  canCheckCollision(collisionBox: { x: number; y: number; w: number; h: number }) {
    const scaleX = this.engine.scaleX;
    const scaleY = this.engine.scaleY;

    const Ax = scaleX * (this.x + this.collisionAreaToCheck.x);
    const Ay = scaleY * (this.y + this.collisionAreaToCheck.y);
    const Aw = scaleX * this.collisionAreaToCheck.w;
    const Ah = scaleY * this.collisionAreaToCheck.h;
    const Bx = scaleX * collisionBox.x;
    const By = scaleY * collisionBox.y;
    const Bw = scaleX * collisionBox.w;
    const Bh = scaleY * collisionBox.h;

    return Bx > Ax && Bx + Bw <= Ax + Aw && By > Ay && By + Bh <= Ay + Ah;
  }
}
