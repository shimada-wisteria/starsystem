import * as BABYLON from '@babylonjs/core';

export class BackStars extends BABYLON.TransformNode {
    _count = 10000;
    _radius = 500;
    // private _scene: BABYLON.Scene;
    constructor(name, scene) {
        super(name, scene);
        this._scene = scene;
        this._createBackStars(this._count, this._radius);
        this._rotateSystem();
    }

    _createBackStars(count, radius) {
        // TransformNode settings
        this.infiniteDistance = true;
        // Create star source node
        const backStar = BABYLON.MeshBuilder.CreateDisc('backStar', { radius: 0.5, tessellation: 8 }, this._scene);
        const starMat = new BABYLON.StandardMaterial('starMat', this._scene);
        starMat.disableLighting = true;
        starMat.emissiveColor = BABYLON.Color3.White();
        backStar.material = starMat;
        backStar.setEnabled(false);
        backStar.setParent(this);
        backStar.registerInstancedBuffer('color', 4);
        // Set pivot vector
        const pivot = new BABYLON.Vector3(0, 0, this._radius);
        // Generate star instances
        for (let i = 0; i < this._count; i++) {
            const instance = backStar.createInstance(`backStar-${i}`);
            instance.setParent(this);
            instance.position.copyFrom(pivot);
            instance.setPivotPoint(pivot.negate());
            instance.rotation.set(Math.random() * BABYLON.Scalar.TwoPi, Math.random() * BABYLON.Scalar.TwoPi, 0);
            // instance.instancedBuffers.color = new BABYLON.Color3(
            //     Math.random(),
            //     Math.random(),
            //     Math.random()
            // );
            instance.instancedBuffers.color = new BABYLON.Color4(Math.random(), 1, 1, Math.random());
            // instance.visibility = BABYLON.Scalar.RandomRange(0.5, 1);
            instance.alwaysSelectAsActiveMesh = true;
        }
    }

    _rotateSystem() {
        this._scene.onBeforeRenderObservable.add(() => {
            // this.addRotation(0, 0.00001, 0);
            this.rotation.y += this._scene.deltaTime / 100000;
        });
    }
}