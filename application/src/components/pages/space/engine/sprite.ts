import { Actor } from './actor';
import { Engine } from './engine';

export class SpriteMetrics {
  image: HTMLImageElement;
  maxSpritesPerRow: number;
  padding: number;
  width: number;
  height: number;

  constructor(image: HTMLImageElement, maxSpritesPerRow: number, padding: number, width: number, height: number) {
    this.image = image;
    this.maxSpritesPerRow = maxSpritesPerRow;
    this.padding = padding;
    this.width = width;
    this.height = height;
  }

  extractSprites(engine: Engine, actor: Actor, spriteStart: number, spriteEnd: number) {
    const sprites: Sprite[] = [];

    for (let i = spriteStart; i < spriteEnd; i++) {
      const row = Math.floor(i / this.maxSpritesPerRow);
      const col = i - row * this.maxSpritesPerRow;

      const sprite = new Sprite(engine, actor, this.image, {
        x: col * this.width + this.padding / 2,
        y: row * this.height + this.padding / 2,
        w: this.width - this.padding,
        h: this.height - this.padding,
      });

      sprites.push(sprite);
    }

    return sprites;
  }
}

export class TileMetrics {
  image: HTMLImageElement;
  maxSpritesPerRow: number;
  padding: number;
  width: number;
  height: number;

  constructor(image: HTMLImageElement, maxSpritesPerRow: number, padding: number, width: number, height: number) {
    this.image = image;
    this.maxSpritesPerRow = maxSpritesPerRow;
    this.padding = padding;
    this.width = width;
    this.height = height;
  }

  extractSprites(engine: Engine, spriteIndex: number) {
    const row = Math.floor(spriteIndex / this.maxSpritesPerRow);
    const col = spriteIndex - row * this.maxSpritesPerRow;

    return new TileSprite(engine, this.image, {
      x: col * this.width + this.padding / 2,
      y: row * this.height + this.padding / 2,
      w: this.width - this.padding,
      h: this.height - this.padding,
    });
  }
}

export class Sprite {
  engine: Engine;
  actor: Actor;
  image: HTMLImageElement;
  clipRect: { x: number; y: number; w: number; h: number };

  constructor(engine: Engine, actor: Actor, image: HTMLImageElement, clipRect: { x: number; y: number; w: number; h: number }) {
    this.engine = engine;
    this.image = image;
    this.actor = actor;
    this.clipRect = clipRect;
  }

  draw(context: CanvasRenderingContext2D) {
    const scaleX = this.engine.scaleX;
    const scaleY = this.engine.scaleY;
    const cameraX = this.engine.playerCamera.x;
    const cameraY = this.engine.playerCamera.y;

    context.drawImage(
      this.image,
      this.clipRect.x,
      this.clipRect.y,
      this.clipRect.w,
      this.clipRect.h,
      scaleX * (this.engine.offsetX + this.actor.x - cameraX),
      scaleY * (this.actor.y - cameraY),
      scaleX * this.actor.width,
      scaleY * this.actor.height
    );
  }
}

export class TileSprite {
  engine: Engine;
  image: HTMLImageElement;
  clipRect: { x: number; y: number; w: number; h: number };

  constructor(engine: Engine, image: HTMLImageElement, clipRect: { x: number; y: number; w: number; h: number }) {
    this.engine = engine;
    this.image = image;
    this.clipRect = clipRect;
  }

  draw(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    const scaleX = this.engine.scaleX;
    const scaleY = this.engine.scaleY;
    const cameraX = this.engine.playerCamera.x;
    const cameraY = this.engine.playerCamera.y;

    context.drawImage(
      this.image,
      this.clipRect.x,
      this.clipRect.y,
      this.clipRect.w,
      this.clipRect.h,
      scaleX * (this.engine.offsetX + x - cameraX),
      scaleY * (y - cameraY),
      scaleX * w,
      scaleY * h
    );
  }
}
