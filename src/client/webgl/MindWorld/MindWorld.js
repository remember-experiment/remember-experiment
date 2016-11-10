import {
  Cube,
  Ground,
  Tile
} from '~/webgl/meshes';
import {
  Cameraman,
  OBJLoader
} from '~/webgl';
import {
  PointLight,
  Object3D,
  LoadingManager,
  Mesh,
  Raycaster,
  JSONLoader,
  SkinnedMesh,
  MeshFaceMaterial,
  MeshStandardMaterial,
  ObjectLoader,
  Vector3,
  AnimationMixer
} from 'three';
import _ from 'lodash';
import * as actions from '~/store/actions';
import {
  PointerLock
} from '~/core';
import * as motion from 'popmotion';

export class MindWorld {

  constructor(name, store, parentElement) {
    this.name = name;
    this.store = store;
    this.parentElement = parentElement;

    this.cameramanRotation = {
      vert: 0,
      hori: 0
    };

    // this.pointerLock = new PointerLock(this.parentElement, this._onPointerLockChange.bind(this));
    // _onPointerLockChange(pointerLocked) {
    //   this.store.dispatch(actions.movement.setPointerLock(pointerLocked));
    // }

    this.scene = new Object3D();

    this.cameraman = new Cameraman(45, 1, 1, 1100);
    this.cameraman.position.set(0, 3, 7);
    this.cameraman.setVerticalAngle(-0.3);

    this.light = new PointLight();
    this.light.position.y = 20;
    this.scene.add(this.light);

    this.userPosition = new Object3D();
    this.scene.add(this.userPosition);
    this.userPosition.add(this.cameraman);

    this.tile = new Tile();
    this.scene.add(this.tile);
    this.tile.position.y = 0.1;

    this.user = new Cube();
    this.user.position.y = 0;
    // this.userPosition.add(this.user);

    this.raycaster = new Raycaster();
    this.collidableMeshList = [];

    this.mixer;
    this.mixerArray = [];

    //////////////////
    this.manager = new LoadingManager();

    this.manager.onProgress = function (item, loaded, total) {
      console.log(item, loaded, total);
    };
    var onProgress = function (xhr) {
      if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log(`${Math.round(percentComplete, 2)}% downloaded`);
      }
    };
    var onError = function (xhr) {};

    var loader = new OBJLoader(this.manager);
    var loaderJson = new ObjectLoader();

    loader.load(require(`~/webgl/meshes/Ground/plane.obj`), (object) => {
      object.traverse((child) => {
        if (child instanceof Mesh) {
          // child.material = this.scene.cube1.material;
          // child.scale.set(1, 1, 1);
          this.scene.add(child);
          this.collidableMeshList.push(child);
        }
      });
      object.position.y = 1;

    }, onProgress, onError);

    loaderJson.load(`./src/client/webgl/meshes/Player/lowpolyAnim.json`,
      (geometry, materials) => {
        this.persoFinal = geometry.children[0];
        this.persoFinalMesh = new SkinnedMesh( this.persoFinal.geometry, materials );

        this.persoFinalMesh.material = new MeshStandardMaterial({
          wireframe: true
        });

        this.persoFinalMesh.scale.set(0.015, 0.015, 0.015);
        this.persoFinalMesh.position.y = 0;
        this.persoFinalMesh.rotation.set(0, 0, 0);

        //Anim perso
        this.mixer = new AnimationMixer(this.persoFinalMesh);
        this.idle = this.mixer.clipAction(this.persoFinalMesh.geometry.animations[0]);
        this.idle.setEffectiveWeight(1);
        this.idle.play();

        this.mixerArray.push(this.mixer);

        this.scene.add(this.persoFinalMesh);
        this.userPosition.add(this.persoFinalMesh);

        console.log(this.idle);

      });

    //////////////////

    // Bind
    this._onMouseMove = _.throttle(this._onMouseMove.bind(this), 1000 / 60);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
  }

  getCameraman() {
    return this.cameraman;
  }

  getScene() {
    return this.scene;
  }

  update(time, dt) {

    const movement = this.store.get(`movement`).toJS();

    if (movement.forward) {
      this.userPosition.translateZ(-(dt * 0.01));
    } else if (movement.backward) {
      this.userPosition.translateZ((dt * 0.01));
    } else if (movement.left) {
      this.userPosition.translateX(-(dt * 0.01));
    } else if (movement.right) {
      this.userPosition.translateX((dt * 0.01));
    }

    const originPoint = 5;
    this.raycaster.ray.origin.set(this.userPosition.position.x, originPoint, this.userPosition.position.z);
    this.raycaster.ray.direction.set(0, -.5, 0);

    this.collisionResults = this.raycaster.intersectObjects(this.collidableMeshList, true);

    if (this.collisionResults.length) {
      this.userPosition.position.y = this.collisionResults[0].point.y;
    }

    this._updateCameraman();
    this.mixerFinal = this.mixerArray[0];

    if(this.mixerFinal){
      this.mixerFinal.update(time, dt);
    }

  }

  mount(time) {
    document.addEventListener(`mousemove`, this._onMouseMove, false);
    document.addEventListener(`keydown`, this._onKeyDown, false);
    document.addEventListener(`keyup`, this._onKeyUp, false);
    document.addEventListener(`mousedown`, this._onMouseDown, false);
    document.addEventListener(`mouseup`, this._onMouseUp, false);
  }

  unmount(time) {
    document.removeEventListener(`mousemove`, this._onMouseMove, false);
    document.removeEventListener(`keydown`, this._onKeyDown, false);
    document.removeEventListener(`keyup`, this._onKeyUp, false);
    document.removeEventListener(`mousedown`, this._onMouseDown, false);
    document.removeEventListener(`mouseup`, this._onMouseUp, false);
  }

  setSize(width, height) {
    this.cameraman.setSize(width, height);
  }

  _onMouseMove(e) {
    var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    this.cameramanRotation.hori -= movementX * 0.003;
    this.cameramanRotation.vert -= movementY * 0.003;

    this.cameramanRotation.vert = motion.calc.restrict(this.cameramanRotation.vert, -0.5, 0);
  }

  _onKeyDown(e) {
    switch (e.keyCode) {
    case 38: // up
    case 90: // z
      this.store.dispatch(actions.movement.setForward(true));
      break;
    case 37: //left
    case 81: //q
      this.store.dispatch(actions.movement.setLeft(true));
      break;
    case 40: //back
    case 83: //s
      this.store.dispatch(actions.movement.setBackward(true));
      break;
    case 39: //right
    case 68: //d
      this.store.dispatch(actions.movement.setRight(true));
      break;
    };
  }

  _onKeyUp(e) {
    switch (e.keyCode) {
    case 38: // up
    case 90: // w
      this.store.dispatch(actions.movement.setForward(false));
      break;
    case 37: //left
    case 81: //q
      this.store.dispatch(actions.movement.setLeft(false));
      break;
    case 40: //back
    case 83: //s
      this.store.dispatch(actions.movement.setBackward(false));
      break;
    case 39: //right
    case 68: //d
      this.store.dispatch(actions.movement.setRight(false));
      break;
    };
  }

  _onMouseDown(e) {
    this.store.dispatch(actions.movement.setForward(true));
  }

  _onMouseUp(e) {
    this.store.dispatch(actions.movement.setForward(false));
  }

  _updateCameraman() {
    // this.cameraman.setHorizontalAngle(this.cameramanRotation.hori);
    this.userPosition.rotation.y = this.cameramanRotation.hori;
    this.cameraman.setVerticalAngle(this.cameramanRotation.vert);
  }

}
