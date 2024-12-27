import { UserType } from '../ApplicationProvider';
import { UserEmitterType } from '../use-socket-subscribers';
import { Camera } from './camera';
import { InputController } from './input-controller';
import { Meeting } from './meeting';
import { AuthorityType, Player } from './player';
import { ForestSpaceMap, SpaceMap } from './space-map';

export class Engine {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D | null;
  userEmitter: UserEmitterType;
  spaceMap: SpaceMap;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  player: Player;
  playerCamera: Camera;
  otherPlayers: Map<string, Player>;
  inputController: InputController;
  keys: Set<string>;
  meeting: Meeting;
  tileSize = 60;
  requestAnimationFrameId = 0;
  offsetX = 0;
  offsetY = 0;

  constructor(canvas: HTMLCanvasElement, userId: string, userEmitter: UserEmitterType, mapData: string) {
    this.canvas = canvas;
    this.userEmitter = userEmitter;
    this.context = canvas.getContext('2d');

    this.spaceMap = new ForestSpaceMap(this, this.tileSize, mapData);
    this.meeting = new Meeting(this);

    this.width = this.spaceMap.width;
    this.height = this.spaceMap.height;
    this.scaleX = this.width / this.canvas.clientWidth;
    this.scaleY = this.height / this.canvas.clientHeight;

    this.inputController = new InputController(this);
    this.keys = new Set();

    canvas.width = this.width;
    canvas.height = this.height;

    const playerX = 27 * this.tileSize;
    const playerY = 5 * this.tileSize;

    this.offsetX = Math.max(0, this.canvas.clientWidth - this.spaceMap.width) / 2;

    let cameraX = Math.max(0, playerX - this.canvas.clientWidth / 2);
    let cameraY = Math.max(0, playerY - this.canvas.clientHeight / 2);

    console.log(Math.max(0, this.canvas.clientWidth - this.spaceMap.width) / 2);

    this.playerCamera = new Camera(this, this.spaceMap, cameraX, cameraY, this.canvas.clientWidth, this.canvas.clientHeight);
    this.player = this.newPlayer(userId, 'local', playerX, playerY, this.playerCamera);
    this.otherPlayers = new Map();

    window.addEventListener('resize', () => {
      this.scaleX = this.width / this.canvas.clientWidth;
      this.scaleY = this.height / this.canvas.clientHeight;
      this.playerCamera.width = this.canvas.clientWidth;
      this.playerCamera.height = this.canvas.clientHeight;
    });
  }

  newPlayer(id: string, authority: AuthorityType, x: number, y: number, camera?: Camera) {
    const player = new Player(this, id, authority, x, y, 80, 170, camera);
    return player;
  }

  addOtherPlayer(user: UserType) {
    const playerX = user.position.x * this.tileSize;
    const playerY = user.position.y * this.tileSize;

    this.otherPlayers.set(user.id, this.newPlayer(user.id, 'remote', playerX, playerY));
  }

  removeOtherPlayer(id: string) {
    this.otherPlayers.delete(id);
  }

  onPlayerMove() {
    const normalizedX = this.player.x / this.tileSize;
    const normalizedY = this.player.y / this.tileSize;

    this.userEmitter(this.player.id, 'onusermove', JSON.stringify({ x: normalizedX, y: normalizedY }));
  }

  onOtherPlayerMove(id: string, data: { x: number; y: number }) {
    const otherPlayer = this.otherPlayers.get(id);

    if (!otherPlayer) return;

    otherPlayer.movements.push({
      x: data.x * this.tileSize,
      y: data.y * this.tileSize,
    });
  }

  start() {
    let startTime = 0;

    const animate = (timestamp: number) => {
      const deltaTime = timestamp - startTime;

      this.context?.clearRect(0, 0, this.width, this.height);
      this.onKeys(deltaTime);
      this.update(deltaTime);
      this.draw();

      startTime = timestamp;

      this.requestAnimationFrameId = requestAnimationFrame(animate);
    };

    animate(0);
  }

  stop() {
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  onKeyTouch(_keyCode: string) {}

  onKeys(deltaTime: number) {
    this.player.onKeys(this.keys, deltaTime);
  }

  update(deltaTime: number) {
    this.player.update(deltaTime);

    this.otherPlayers.forEach((otherPlayer) => {
      otherPlayer.update(deltaTime);

      otherPlayer.drawOnTop = otherPlayer.y > this.player.y;
    });

    this.spaceMap.update(deltaTime);
  }

  draw() {
    if (!this.context) return;

    this.spaceMap.drawBottomLayer(this.context);

    for (const otherPlayerTup of this.otherPlayers) {
      const [_playerId, otherPlayer] = otherPlayerTup;

      if (!otherPlayer.drawOnTop) otherPlayer.draw(this.context);
    }

    this.player.draw(this.context);

    for (const otherPlayerTup of this.otherPlayers) {
      const [_playerId, otherPlayer] = otherPlayerTup;

      if (otherPlayer.drawOnTop) otherPlayer.draw(this.context);
    }

    this.spaceMap.drawTopLayer(this.context);

    this.playerCamera.draw(this.context);
  }
}
