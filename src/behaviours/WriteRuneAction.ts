import * as Behaviours from './index';
import * as Entities from '../entities';
import * as Events from '../events';
import * as Components from '../components';
import * as Map from '../map';

import Engine = require('../Engine');

export class WriteRuneAction extends Behaviours.Action {
  private engine: Engine;
  private physics: Components.PhysicsComponent;

  constructor(engine: Engine, entity: Entities.Entity) {
    super();
    this.engine = engine;
    this.physics = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }

  act(): number {
    const rune = new Entities.Entity(this.engine, 'Rune', 'rune');
    rune.addComponent(new Components.PhysicsComponent(this.engine, {
      position: this.physics.position,
      blocking: false
    }));
    rune.addComponent(new Components.RenderableComponent(this.engine, {
      glyph: new Map.Glyph('#', 0x44ff88, 0x000000)
    }));
    rune.addComponent(new Components.SelfDestructComponent(this.engine, {
      turns: 10
    }));
    rune.addComponent(new Components.RuneFreezeComponent(this.engine));
    return this.cost;
  }
}
