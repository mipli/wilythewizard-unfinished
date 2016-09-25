import * as Events from './events';

import Engine = require('./Engine');
import Console = require('./Console');

class LogView {
  private currentTurn: number;
  private messages: {turn: number, message: string}[];
  private console: Console;

  constructor(private engine: Engine, private width: number, private height: number) {
    this.registerListeners();

    this.console = new Console(this.width, this.height);
    this.currentTurn = 1;
    this.messages = [];
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'turn',
      this.onTurn.bind(this)
    ));

    this.engine.listen(new Events.Listener(
      'message',
      this.onMessage.bind(this)
    ));
  }

  private onTurn(event: Events.Event) {
    this.currentTurn = event.data.currentTurn;
  }

  private onMessage(event: Events.Event) {
    if (event.data.message) {
      this.messages.unshift({
        turn: this.currentTurn,
        message: event.data.message
      });
    }
    if (this.messages.length > this.height) {
      this.messages.pop();
    }
    console.log(this.messages);
  }

  render(blitFunction: any) {
    this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
    this.messages.forEach((data, idx) => {
      let color = 0xffffff;
      if (data.turn < this.currentTurn - 5) {
        color = 0x666666;
      } else if (data.turn < this.currentTurn - 2) {
        color = 0xaaaaaa;
      }
      this.console.print(data.message, 0, idx, color);
    });
    blitFunction(this.console);
  }
}

export = LogView;
