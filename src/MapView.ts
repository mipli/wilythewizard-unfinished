import * as Core from './core';
import * as Components from './components';
import * as Entities from './entities';
import * as Events from './events';
import * as Map from './map';

import Engine = require('./Engine');
import Console = require('./Console');

class MapView {
  private renderableEntities: ({guid: string, renderable: Components.RenderableComponent, physics: Components.PhysicsComponent})[];
  private renderableItems: ({guid: string, renderable: Components.RenderableComponent, physics: Components.PhysicsComponent})[];
  private console: Console;

  private viewEntity: Entities.Entity;

  private lightMap: number[][];
  private fovCalculator: Map.FoV;

  private hasSeen: boolean[][];

  private fogOfWarColor: Core.Color;

  constructor(private engine: Engine, private map: Map.Map, private width: number, private height: number) {
    this.fogOfWarColor = 0x9999aa;
    this.registerListeners();
    this.console = new Console(this.width, this.height);
    this.renderableEntities = [];
    this.renderableItems = [];
    this.viewEntity = null;
    this.fovCalculator = null;
    this.lightMap = Core.Utils.buildMatrix<number>(this.width, this.height, 0);
    this.hasSeen = Core.Utils.buildMatrix<boolean>(this.width, this.height, false);
  }

  setViewEntity(entity: Entities.Entity) {
    this.hasSeen = Core.Utils.buildMatrix<boolean>(this.width, this.height, false);

    this.viewEntity = entity;
    this.viewEntity.listen(new Events.Listener(
      'move',
      this.onViewEntityMove.bind(this)
    ));

    this.fovCalculator = new Map.FoV(
      (pos: Core.Position) => {
        let tile = this.map.getTile(pos);
        return !tile.blocksSight;  
      },
      this.map.width,
      this.map.height,
      20 
    );

    this.onViewEntityMove(null);
  }

  private onViewEntityMove(event: Events.Event) {
    let pos: Core.Position = (<Components.PhysicsComponent>this.viewEntity.getComponent(Components.PhysicsComponent)).position;

    this.lightMap = this.fovCalculator.calculate(pos);

    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (this.lightMap[x][y] > 0) {
          this.hasSeen[x][y] = true;
        }
      }
    }
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'renderableComponentCreated',
      this.onRenderableComponentCreated.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'renderableComponentDestroyed',
      this.onRenderableComponentDestroyed.bind(this)
    ));
  }

  private onRenderableComponentDestroyed(event: Events.Event) {
    const physics = <Components.PhysicsComponent>event.data.entity.getComponent(Components.PhysicsComponent);
    let idx = null;

    if (physics.blocking) {
      idx = this.renderableEntities.findIndex((entity) => {
        return entity.guid === event.data.entity.guid;
      });
      if (idx !== null) {
        this.renderableEntities.splice(idx, 1);
      }
    } else {
      idx = this.renderableItems.findIndex((entity) => {
        return entity.guid === event.data.entity.guid;
      });
      if (idx !== null) {
        this.renderableItems.splice(idx, 1);
      }
    }
  }

  private onRenderableComponentCreated(event: Events.Event) {
    const physics = <Components.PhysicsComponent>event.data.entity.getComponent(Components.PhysicsComponent);

    if (physics.blocking) {
      this.renderableEntities.push({
        guid: event.data.entity.guid,
        renderable: event.data.renderableComponent,
        physics: physics
      });
    } else {
      this.renderableItems.push({
        guid: event.data.entity.guid,
        renderable: event.data.renderableComponent,
        physics: physics
      });
    }
  }

  mouseClick(position: Core.Position) {
    console.group("Position: " + position.x + ", " + position.y);
    console.log(this.map.getTile(position));
    console.groupEnd();
  }


  render(blitFunction: any) {
    this.renderMap(this.console);
    blitFunction(this.console);
  }

  private renderMap(console: Console) {
    if (this.viewEntity === null) {
      return;
    }
    this.renderBackground(console);
    this.renderItems(console);
    this.renderEntities(console);
  }

  private renderEntities(console: Console) {
    this.renderableEntities.forEach((data) => {
      if (data.renderable && data.physics) {
        this.renderGlyph(console, data.renderable.glyph, data.physics.position);
      }
    });
  }

  private renderItems(console: Console) {
    this.renderableItems.forEach((data) => {
      if (data.renderable && data.physics) {
        this.renderGlyph(console, data.renderable.glyph, data.physics.position);
      }
    });
  }

  private renderGlyph(console: Console, glyph: Map.Glyph, position: Core.Position) {
    if (!this.isVisible(position)) {
      return;
    }
    console.setText(glyph.glyph, position.x, position.y);
    console.setForeground(glyph.foregroundColor, position.x, position.y);
  }

  private renderBackground(console: Console) {
    this.map.forEach((position: Core.Position, tile: Map.Tile) => {
      let glyph = tile.glyph;
      if (!this.isVisible(position)) {
        if (this.hasSeen[position.x][position.y]) {
          glyph = new Map.Glyph(
            glyph.glyph,
            Core.ColorUtils.colorMultiply(glyph.foregroundColor, this.fogOfWarColor),
            Core.ColorUtils.colorMultiply(glyph.backgroundColor, this.fogOfWarColor)
          );
        } else {
          glyph = new Map.Glyph(Map.Glyph.CHAR_FULL, 0x111111, 0x111111);
        }
      }
      console.setText(glyph.glyph, position.x, position.y);
      console.setForeground(glyph.foregroundColor, position.x, position.y);
      console.setBackground(glyph.backgroundColor, position.x, position.y);
    });
  }

  private isVisible(position: Core.Position) {
    return this.lightMap[position.x][position.y] === 1;
  }
}

export = MapView;
