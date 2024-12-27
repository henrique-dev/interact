import { Engine } from './engine';

export type RectType = { x: number; y: number; w: number; h: number };

export const boxesCollision = (engine: Engine, bcA: RectType, bcB: RectType) => {
  const scaleX = engine.scaleX;
  const scaleY = engine.scaleY;

  const Ax = scaleX * bcA.x;
  const Ay = scaleY * bcA.y;
  const Aw = scaleX * bcA.w;
  const Ah = scaleY * bcA.h;
  const Bx = scaleX * bcB.x;
  const By = scaleY * bcB.y;
  const Bw = scaleX * bcB.w;
  const Bh = scaleY * bcB.h;

  if (Bx + Bw >= Ax && Bx < Ax + Aw && By + Bh >= Ay && By < Ay + Ah) {
    return true;
  }

  return false;
};
