import { Actor } from './actor';
import { Animation } from './animation';
import { Camera } from './camera';
import { Engine } from './engine';
import { Sprite, SpriteMetrics } from './sprite';
import { boxesCollision } from './utils';

export type AuthorityType = 'local' | 'remote';

export class Player extends Actor {
  authority: AuthorityType;
  camera: Camera | undefined;
  speed: number;
  lastMoveSendTimer: number;
  shadowSprite: Sprite | undefined;
  idleRightAnimation: Animation | undefined;
  idleLeftAnimation: Animation | undefined;
  idleTopAnimation: Animation | undefined;
  idleBottomAnimation: Animation | undefined;
  walkRightAnimation: Animation | undefined;
  walkLeftAnimation: Animation | undefined;
  walkTopAnimation: Animation | undefined;
  walkBottomAnimation: Animation | undefined;
  currentAnimation: Animation | undefined;
  lastX: number;
  lastY: number;
  connectArea: { x: number; y: number; w: number; h: number };
  allowedPlayersToConnect: Set<string>;
  timerToCheckClosestPlayers: NodeJS.Timeout | null = null;
  timerToChangeAnimation: NodeJS.Timeout | null = null;
  drawOnTop = false;

  constructor(engine: Engine, id: string, authority: AuthorityType, x: number, y: number, width: number, height: number, camera?: Camera) {
    super(engine, id, x, y, width, height, { x: width / 4, y: height / 2 + height / 4, w: width / 2, h: height / 6 });
    this.authority = authority;
    this.speed = 5;
    this.lastMoveSendTimer = 20;
    this.camera = camera;
    this.lastX = 0;
    this.lastY = 0;
    this.allowedPlayersToConnect = new Set();

    const connectAreaWidth = 300;
    const connectAreaHeight = 300;
    this.connectArea = {
      x: -(connectAreaWidth / 2 - width / 2),
      y: -(connectAreaHeight / 2 - height / 2),
      w: connectAreaWidth,
      h: connectAreaHeight,
    };

    const idleElement = document.getElementById('img_character_idle');
    if (idleElement) {
      const idleImage = idleElement as HTMLImageElement;

      const spriteMetrics = new SpriteMetrics(idleImage, 8, 30, idleImage.width / 8, idleImage.height / 6);

      this.idleTopAnimation = new Animation(this.engine, this, spriteMetrics, 24, 31, 120);
      this.idleBottomAnimation = new Animation(this.engine, this, spriteMetrics, 0, 7, 120);
      this.idleLeftAnimation = new Animation(this.engine, this, spriteMetrics, 8, 15, 120);
      this.idleRightAnimation = new Animation(this.engine, this, spriteMetrics, 40, 47, 120);
    }

    const walkElement = document.getElementById('img_character_walk');
    if (walkElement) {
      const walkImage = walkElement as HTMLImageElement;

      const spriteMetrics = new SpriteMetrics(walkImage, 8, 30, walkImage.width / 8, walkImage.height / 6);

      this.walkTopAnimation = new Animation(this.engine, this, spriteMetrics, 24, 31, 120);
      this.walkBottomAnimation = new Animation(this.engine, this, spriteMetrics, 0, 7, 120);
      this.walkLeftAnimation = new Animation(this.engine, this, spriteMetrics, 8, 15, 120);
      this.walkRightAnimation = new Animation(this.engine, this, spriteMetrics, 40, 47, 120);
    }

    this.currentAnimation = this.idleBottomAnimation;

    const shadowElement = document.getElementById('img_character_shadow');
    if (shadowElement) {
      const shadowImage = shadowElement as HTMLImageElement;

      const spriteMetrics = new SpriteMetrics(shadowImage, 1, 25, shadowImage.width, shadowImage.height);

      this.shadowSprite = spriteMetrics.extractSprites(this.engine, this, 0, 1)[0];
    }
  }

  onKeys(keys: Set<string>, deltaTime: number) {
    if (keys.has('ArrowLeft') || keys.has('KeyA')) {
      this.move(-this.speed, 0, deltaTime);
    }
    if (keys.has('ArrowRight') || keys.has('KeyD')) {
      this.move(this.speed, 0, deltaTime);
    }
    if (keys.has('ArrowUp') || keys.has('KeyW')) {
      this.move(0, -this.speed, deltaTime);
    }
    if (keys.has('ArrowDown') || keys.has('KeyS')) {
      this.move(0, this.speed, deltaTime);
    }
  }

  closeToConnect = (otherPlayer: Player) => {
    return boxesCollision(
      this.engine,
      {
        x: this.x + this.connectArea.x,
        y: this.y + this.connectArea.y,
        w: this.connectArea.w,
        h: this.connectArea.h,
      },
      {
        x: otherPlayer.x + otherPlayer.connectArea.x,
        y: otherPlayer.y + otherPlayer.connectArea.y,
        w: otherPlayer.connectArea.w,
        h: otherPlayer.connectArea.h,
      }
    );
  };

  checkClosestPlayers() {
    this.engine.otherPlayers.forEach((otherPlayer) => {
      if (this.closeToConnect(otherPlayer)) {
        this.allowedPlayersToConnect.add(otherPlayer.id);
      } else {
        this.allowedPlayersToConnect.delete(otherPlayer.id);
      }
    });

    if (this.allowedPlayersToConnect.size > 0) {
      this.allowedPlayersToConnect.forEach((otherUserId) => {
        this.engine.meeting.connectToMeeting(otherUserId);
      });
    } else {
      this.engine.meeting.disconnectFromMeeting(this.id);
    }
  }

  move(x: number, y: number, deltaTime: number) {
    const oldX = this.x;
    const oldY = this.y;

    this.x += x * (deltaTime * 0.1);
    this.y += y * (deltaTime * 0.1);

    if (this.engine.spaceMap.collidesWith(this)) {
      this.lastX = this.x;
      this.lastY = this.y;
      this.x = oldX;
      this.y = oldY;

      this.faceDirection.x = Math.sign(this.lastX - oldX);
      this.faceDirection.y = Math.sign(this.lastY - oldY);
    } else {
      this.camera?.move(this.x, this.y);
      this.faceDirection.x = Math.sign(this.x - oldX);
      this.faceDirection.y = Math.sign(this.y - oldY);
    }

    this.checkClosestPlayers();

    if (this.lastMoveSendTimer <= 0) {
      this.engine.onPlayerMove();
      this.lastMoveSendTimer = 20;
    }

    this.lastMoveSendTimer -= deltaTime;
  }

  changeCurrentIdleAnimation(animation: Animation | undefined) {
    if (this.currentAnimation === animation) return;

    if (this.authority === 'local') {
      this.currentAnimation = animation;
    } else {
      this.timerToChangeAnimation = setTimeout(() => {
        this.currentAnimation = animation;

        if (this.timerToChangeAnimation) clearTimeout(this.timerToChangeAnimation);
      }, 125);
    }
  }

  update(deltaTime: number): void {
    const movementToExecute = this.movements.shift();

    if (movementToExecute) {
      const oldX = this.x;
      const oldY = this.y;

      this.x = movementToExecute.x;
      this.y = movementToExecute.y;

      this.faceDirection.x = Math.sign(this.x - oldX);
      this.faceDirection.y = Math.sign(this.y - oldY);

      if (this.timerToChangeAnimation) clearTimeout(this.timerToChangeAnimation);
    }

    if (this.currentAnimation) {
      this.currentAnimation.update(deltaTime);
    }

    const walkingRight = this.lastX < this.x;
    const walkingLeft = this.lastX > this.x;
    const walkingTop = this.lastY > this.y;
    const walkingBottom = this.lastY < this.y;

    const walking = walkingRight || walkingLeft || walkingTop || walkingBottom;

    if (walking) {
      if (this.faceDirection.x > 0) {
        this.currentAnimation = this.walkRightAnimation;
      }
      if (this.faceDirection.x < 0) {
        this.currentAnimation = this.walkLeftAnimation;
      }
      if (this.faceDirection.y < 0) {
        this.currentAnimation = this.walkTopAnimation;
      }
      if (this.faceDirection.y > 0) {
        this.currentAnimation = this.walkBottomAnimation;
      }
    } else if (this.faceDirection.x === 0 && this.faceDirection.y === 0) {
      this.changeCurrentIdleAnimation(this.idleBottomAnimation);
    } else {
      if (this.faceDirection.x > 0) {
        this.changeCurrentIdleAnimation(this.idleRightAnimation);
      }
      if (this.faceDirection.x < 0) {
        this.changeCurrentIdleAnimation(this.idleLeftAnimation);
      }
      if (this.faceDirection.y < 0) {
        this.changeCurrentIdleAnimation(this.idleTopAnimation);
      }
      if (this.faceDirection.y > 0) {
        this.changeCurrentIdleAnimation(this.idleBottomAnimation);
      }
    }

    this.lastX = this.x;
    this.lastY = this.y;
  }

  draw(context: CanvasRenderingContext2D): void {
    context.save();

    if (this.currentAnimation) {
      this.shadowSprite?.draw(context);
      this.currentAnimation.draw(context);
    }

    context.restore();
  }
}
