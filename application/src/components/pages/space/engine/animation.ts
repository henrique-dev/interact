import { Actor } from './actor';
import { Engine } from './engine';
import { Sprite, SpriteMetrics } from './sprite';

export class Animation {
  engine: Engine;
  actor: Actor;
  frameRate: number;
  frameTime: number;
  currentFrame: number;
  sprites: Sprite[];

  constructor(engine: Engine, actor: Actor, spriteMetrics: SpriteMetrics, spriteStart: number, spriteEnd: number, frameRate: number) {
    this.engine = engine;
    this.actor = actor;

    this.frameRate = frameRate;
    this.frameTime = 0;
    this.currentFrame = 0;
    this.sprites = spriteMetrics.extractSprites(this.engine, this.actor, spriteStart, spriteEnd);
  }

  update(deltaTime: number) {
    this.frameTime += deltaTime;
    this.currentFrame = Math.floor(this.frameTime / this.frameRate);

    if (this.currentFrame >= this.sprites.length) {
      this.frameTime = 0;
      this.currentFrame = 0;
    }
  }

  draw(context: CanvasRenderingContext2D) {
    context.imageSmoothingEnabled = false;
    this.sprites[this.currentFrame].draw(context);
    context.imageSmoothingEnabled = true;
  }
}
