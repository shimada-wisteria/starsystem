import * as BABYLON from '@babylonjs/core';
import * as ProceduralTexture from '@babylonjs/procedural-textures';
//import * as ProceduralTexture from "../../node_modules/@babylonjs/procedural-textures/index.js";

export class PlanetarySystem extends BABYLON.TransformNode {
    // private _scene: BABYLON.Scene;
    _radius = 500;
    constructor(name, scene) {
        super(name, scene);
        this._scene = scene;
        this.position.set(0, -10, 0);
        this._createPlanetarySystem(this._radius);
        this._rotateSystem();
    }

    planets = []

    _createPlanetarySystem(radius) {
        // TransformNode settings
        // this.infiniteDistance = true;
        // Create star source node

        const fixedStar = BABYLON.MeshBuilder.CreateSphere('fixedStar', { segments: 32, diameter: 20, updatable: false}, this._scene);
        const fixedStarMat = new BABYLON.StandardMaterial('fixedStarMat', this._scene);
        fixedStarMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0);
        fixedStarMat.ambientColor = new BABYLON.Color3(1, 0, 0);

        const fireTexture = new ProceduralTexture.FireProceduralTexture("fire", 256, scene);
        // const fireTexture = new BABYLON.ProceduralTexture.fire.fireTexture("fire", 256, scene);
        // const fireTexture = new ProceduralTexture.BABYLON.FireProceduralTexture("fire", 256, scene);
        fixedStarMat.diffuseTexture = fireTexture;
        fixedStarMat.opacityTexture = fireTexture;

        fixedStar.material = fixedStarMat;
        // fixedStar.setEnabled(false);
        fixedStar.setParent(this);
        // star.registerInstancedBuffer('color', 4); // use instancedBuffer
        // Set pivot vector

        const pivot = new BABYLON.Vector3(0, 0, this._radius);

        // const instance = fixedStar.createInstance(`fixedStar`);
        fixedStar.setParent(this);
        fixedStar.position.set(0, 0, 0);
        fixedStar.rotation.set(0, 0, 0);
        fixedStar.alwaysSelectAsActiveMesh = true;

        const fixedStarLight = new BABYLON.PointLight('fixedStarLight', new BABYLON.Vector3(0, 0, 0), this._scene);
        fixedStarLight.intensity = 0.5;
        fixedStarLight.diffuse = new BABYLON.Color3(1, 1, 1);
        fixedStarLight.specular = new BABYLON.Color3(1, 1, 1);
        fixedStarLight.groundColor = new BABYLON.Color3(1, 1, 1);

        const star = BABYLON.MeshBuilder.CreateSphere('star', { segments: 32, diameter: 5, updatable: false}, this._scene);
        star.setParent(this);
        star.setEnabled(false);
        star.registerInstancedBuffer('color', 4);
        const starMat = new BABYLON.StandardMaterial('starMat', this._scene);
        starMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.4);

        // Generate planet instances
        const planetNum = 2;
        const radiusList = [50, 100];
        for (let i = 0; i < planetNum; i++) {
            const instance = star.createInstance(`planet-${i}`);
            instance.setParent(this);

            const planetPivot = new BABYLON.Vector3(0, 0, radiusList[i]);
            instance.position.copyFrom(planetPivot);
            instance.setPivotPoint(planetPivot.negate());
            instance.rotation.set(0, Math.random() * BABYLON.Scalar.TwoPi, 0);
            instance.instancedBuffers.color = new BABYLON.Color4(Math.random(), 1, 1, Math.random());
            instance.alwaysSelectAsActiveMesh = true;

            const f = new BABYLON.Vector3(radiusList[i], 0, 0);
            const s = new BABYLON.Vector3(0, 0, radiusList[i]);
            const t = new BABYLON.Vector3(-radiusList[i], 0, 0);
            const orbitArc = BABYLON.Curve3.ArcThru3Points(f, s, t, 128, true, true);
            const orbit = BABYLON.MeshBuilder.CreateLines(`orbit-planet-${i}`, {points: orbitArc.getPoints()});
            orbit.setParent(this);
            orbit.position.set(0, 0, 0);

            this.planets.push(instance);
        }
    }

    _rotateSystem() {
        this._scene.onBeforeRenderObservable.add(() => {
            const sec = this._scene.deltaTime / 1000.0;
            this.planets.forEach(planet => {
                planet.rotation.y = (planet.rotation.y + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;
                // planet.rotation.z = (planet.rotation.z + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;
            });
            // this.rotation.y += this._scene.deltaTime / 100000;
        });
    }
}