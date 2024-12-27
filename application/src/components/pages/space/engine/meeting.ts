import { Engine } from './engine';

export class Meeting {
  engine: Engine;
  state: 'idle' | 'creating' | 'created' = 'idle';
  timerToConnect: NodeJS.Timeout | null = null;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  connectToMeeting(otherUserId: string) {
    if (this.timerToConnect) {
      clearTimeout(this.timerToConnect);
    }

    this.timerToConnect = setTimeout(() => {
      if (this.state === 'idle') {
        this.state = 'creating';
        this.engine.userEmitter(otherUserId, 'onrequesttoconnect');
      }
    }, 250);
  }

  disconnectFromMeeting(userId: string) {
    if (['created', 'creating'].includes(this.state)) {
      this.engine.userEmitter(userId, 'onrequesttodisconnect');
      this.state = 'idle';
    }

    if (this.timerToConnect) {
      clearTimeout(this.timerToConnect);
    }
  }
}
