import { Engine } from './engine';
import { Player } from './player';
import { TileMetrics, TileSprite } from './sprite';

type MapType = {
  tileSize: number;
  mapWidth: number;
  mapHeight: number;
  collisions: { [code: string]: { halfX?: boolean; halfY?: boolean } | undefined };
  topLayer: string[];
  layers: {
    name: string;
    tiles: {
      id: string;
      x: number;
      y: number;
    }[];
    collider: boolean;
  }[];
};

export class SpaceMap {
  engine: Engine;
  width: number;
  height: number;
  tileSize: number;
  tiles: Map<string, TileSprite>;
  map: {
    x: number;
    y: number;
    w: number;
    h: number;
    tileCode: string;
    collision?: { halfX?: boolean; halfY?: boolean };
  }[];
  mapTop: {
    x: number;
    y: number;
    w: number;
    h: number;
    tileCode: string;
    collision?: { halfX?: boolean; halfY?: boolean };
  }[];

  constructor(engine: Engine, width: number, height: number, tileSize: number) {
    this.engine = engine;
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.tiles = new Map();
    this.map = [];
    this.mapTop = [];
  }

  collidesWith(_player: Player) {
    return false;
  }

  update(_deltaTime: number) {
    return;
  }

  drawBottomLayer(_context: CanvasRenderingContext2D) {
    return;
  }
  drawTopLayer(_context: CanvasRenderingContext2D) {
    return;
  }
}

export class ForestSpaceMap extends SpaceMap {
  constructor(engine: Engine, tileSize: number, mapData: string) {
    super(engine, 35 * tileSize, 19 * tileSize, tileSize);

    const floorElement = document.getElementById('img_floor_and_walls');

    if (floorElement) {
      const floorImage = floorElement as HTMLImageElement;

      const tileMetrics = new TileMetrics(floorImage, 8, 0, floorImage.width / 8, floorImage.height / 16);

      const houseMap = JSON.parse(mapData) as MapType;

      houseMap.layers.reverse().forEach((layer) => {
        layer.tiles.forEach((tile) => {
          if (!this.tiles.has(tile.id)) {
            this.tiles.set(tile.id, tileMetrics.extractSprites(this.engine, parseInt(tile.id)));
          }

          const collisionObj = houseMap.collisions[tile.id];
          const topTile = houseMap.topLayer.includes(tile.id);

          if (topTile) {
            this.mapTop.push({
              x: tileSize + tile.x * tileSize,
              y: tileSize + tile.y * tileSize,
              w: tileSize,
              h: tileSize,
              tileCode: tile.id,
              collision: collisionObj,
            });
          } else {
            this.map.push({
              x: tileSize + tile.x * tileSize,
              y: tileSize + tile.y * tileSize,
              w: tileSize,
              h: tileSize,
              tileCode: tile.id,
              collision: collisionObj,
            });
          }
        });
      });
    }
  }

  collidesWith(player: Player) {
    for (const mapData of this.map) {
      const { tileCode, collision, x, y, w, h } = mapData;

      const tile = this.engine.spaceMap.tiles.get(tileCode);

      if (!tile) {
        return false;
      }

      if (collision) {
        const cx = x;
        const cy = y;
        const cw = w - (collision.halfX ? w / 2 : 0);
        const ch = h - (collision.halfY ? h / 2 : 0);

        if (
          player.canCheckCollision({
            x: cx,
            y: cy,
            w: cw,
            h: ch,
          })
        ) {
          if (
            player.collidesWith({
              x: cx,
              y: cy,
              w: cw,
              h: ch,
            })
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  drawBottomLayer(context: CanvasRenderingContext2D): void {
    context.save();

    context.fillStyle = '#261103';
    context.fillRect(0, 0, this.width, this.height);

    context.imageSmoothingEnabled = false;
    this.map.forEach((mapData) => {
      const { x, y, w, h, tileCode } = mapData;

      const tile = this.tiles.get(tileCode);

      if (!tile) return;

      tile.draw(context, x, y, w, h);
    });

    context.imageSmoothingEnabled = true;

    context.restore();
  }

  drawTopLayer(context: CanvasRenderingContext2D): void {
    context.save();

    context.imageSmoothingEnabled = false;
    this.mapTop.forEach((mapData) => {
      const { x, y, w, h, tileCode } = mapData;

      const tile = this.tiles.get(tileCode);

      if (!tile) return;

      tile.draw(context, x, y, w, h);
    });
    context.imageSmoothingEnabled = true;

    context.restore();
  }
}
