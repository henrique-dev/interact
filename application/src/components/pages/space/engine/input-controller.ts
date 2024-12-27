import { Engine } from './engine';

export class InputController {
  engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;

    window.addEventListener('keydown', (event) => {
      this.engine.keys.add(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.engine.keys.delete(event.code);
    });
  }
}
