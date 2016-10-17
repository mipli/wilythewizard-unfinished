import * as Core from '../../core';
import * as Map from '../index';

export class RoomGenerator {
  private cells: number[][];

  private width: number;
  private height: number;

  private maxAttempts: number;

  constructor(cells: number[][], maxAttempts: number = 500) {
    this.cells = cells;

    this.width = this.cells.length;
    this.height = this.cells[0].length;

    this.maxAttempts = maxAttempts;
  }

  private isSpaceAvailable(x: number, y: number, width: number, height: number) {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (!Map.Utils.canCarve(this.cells, new Core.Position(i, j), 0, true)) {
          return false;
        }
      }
    }
    return true;
  }

  generate() {
    while (this.addRoom()) { }
  }

  private addRoom() {
    let roomGenerated = false;
    let attempts = 0;
    while (!roomGenerated && attempts < this.maxAttempts) {
      roomGenerated = this.generateRoom();
      attempts++
    }

    return roomGenerated;
  }

  private generateRoom() {
    const size = Core.Utils.getRandom(4, 7);
    const rectangularity = Core.Utils.getRandom(1, 3);
    let width: number;
    let height: number;
    if (Math.random() > 0.5) {
      height = size;
      width = size + rectangularity;
    } else {
      width = size;
      height = size + rectangularity;
    }

    let x = Core.Utils.getRandom(0, (this.width - width - 2));
    x = Math.floor(x/2) * 2 + 1;
    let y = Core.Utils.getRandom(0, (this.height - height - 2));
    y = Math.floor(y/2) * 2 + 1;

    if (this.isSpaceAvailable(x, y, width, height)) {
        for (var i = x; i < x + width; i++) {
            for (var j = y; j < y + height; j++) {
              this.cells[i][j] = 0;    
            }
        }
        return true;
    }

    return false;
  }

  getCells() {
    return this.cells;
  }
}
