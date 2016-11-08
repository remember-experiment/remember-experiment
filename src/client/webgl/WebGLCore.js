import { EffectComposer, RenderPass, GlitchPass, SMAAPass } from 'postprocessing';
import * as motion from 'popmotion';
import _ from 'lodash';
import { Vector3 } from 'three';
import { Scene } from './Scene';
import { Renderer } from './Renderer';
import * as actions from '~/actions';

import { RoomWorld } from './RoomWorld';
import { MindWorld } from './MindWorld';
import { MemoryWorld } from './MemoryWorld';

// interface World {
//   constructor(stateManager)
//   getScene()
//   getRootObject()
//   getCameraman()
//   update()
// }

export class WebGLCore {

  constructor(parentElement, stateManager) {
    this.parentElement = parentElement;

    this.width = null;
    this.height = null;
    this.lastState = null;
    this.stateManager = stateManager;
    this.currentWorld = this.stateManager.state.getIn([`world`, `current`]);
    this.transitionStartTime = null;

    this.scene = new Scene();
    this.renderer = new Renderer();
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.renderPass.renderToScreen = true;
    this.composer.addPass(this.renderPass);

    this.worlds = {
      room: new RoomWorld(this.stateManager),
      mind: new MindWorld(this.stateManager),
      memory: new MemoryWorld(this.stateManager)
    };

    this.scene.add(this.worlds[this.currentWorld].getRootObject());

    this._initComposer();

    this._resize();
    // Append to DOM
    this.parentElement.appendChild( this.renderer.domElement );
  }

  update(time, dt) {
    if (this.stateManager.state !== this.lastState) {
      this._onStateChange(time, dt);
      this.lastState = this.stateManager.state;
    }
    // Update worlds
    this.worlds[this.currentWorld].update(time, dt);
    // Pass
    if (
      this.stateManager.state.getIn([`world`, `transitionInProgress`]) &&
      time - this.transitionStartTime < 500
    ) {
      this.glitchPass.enabled = true;
      this.renderPass.renderToScreen = false;
    } else {
      this.renderPass.renderToScreen = true;
      this.glitchPass.enabled = false;
      this.stateManager.updateState(actions.world.endTransition());
    }
  }

  render(time, dt) {
    var cameraman = this.worlds[this.currentWorld].getCameraman();
    this.renderPass.camera = cameraman.getCamera();
    this.composer.render(dt);
  }

  _onStateChange(time, dt) {
    this._resize();
    const currentWorld = this.stateManager.state.getIn([`world`, `current`]);
    if (currentWorld !== this.currentWorld) {
      this._startWorldTransition(this.currentWorld, currentWorld, time);
      this.currentWorld = currentWorld;
    }
  }

  _startWorldTransition(fromWorld, toWorld, time) {
    const nextWordlRootObject = this.worlds[toWorld].getRootObject();
    const prevWordlRootObject = this.worlds[fromWorld].getRootObject();
    this.scene.add(nextWordlRootObject);
    this.scene.remove(prevWordlRootObject);
    this.transitionStartTime = time;
    this.stateManager.updateState(actions.world.startTransition());
  }

  _resize() {
    const state = this.stateManager.state;
    if (this.width !== state.get(`width`) || this.height !== state.get(`height`)) {
      this.width = state.get(`width`);
      this.height = state.get(`height`);
      _.forEach(this.worlds, (world) => {
        if (_.isFunction(world.setSize)) {
          world.setSize(this.width, this.height);
        }
      });
      this.composer.setSize(this.width, this.height);
      this.renderer.setSize(this.width, this.height);
    }
  }

  _initComposer() {
    // this.smaaPass = new SMAAPass(window.Image);
    // this.smaaPass.renderToScreen = true;
    // this.smaaPass.enabled = false;
    // this.composer.addPass(this.smaaPass);
    this.glitchPass = new GlitchPass();
    this.glitchPass.renderToScreen = true;
    this.glitchPass.mode = 1;
    this.glitchPass.enabled = false;
    this.composer.addPass(this.glitchPass);
  }

}
