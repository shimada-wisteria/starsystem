import * as BABYLON from '@babylonjs/core';
import * as ProceduralTexture from '@babylonjs/procedural-textures';
import { generatePlanetTexture, getPlanetTypeName } from './planetTextureGenerator.js';

export class PlanetarySystem extends BABYLON.TransformNode {
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
        const fixedStar = BABYLON.MeshBuilder.CreateSphere('fixedStar', { segments: 32, diameter: 20, updatable: false }, this._scene);
        const fixedStarMat = new BABYLON.StandardMaterial('fixedStarMat', this._scene);
        fixedStarMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0);
        fixedStarMat.ambientColor = new BABYLON.Color3(1, 0, 0);

        const fireTexture = new ProceduralTexture.FireProceduralTexture('fire', 256, this._scene);
        fixedStarMat.diffuseTexture = fireTexture;
        fixedStarMat.opacityTexture = fireTexture;

        fixedStar.material = fixedStarMat;
        fixedStar.setParent(this);
        fixedStar.position.set(0, 0, 0);
        fixedStar.rotation.set(0, 0, 0);
        fixedStar.alwaysSelectAsActiveMesh = true;

        const fixedStarLight = new BABYLON.PointLight('fixedStarLight', new BABYLON.Vector3(0, 0, 0), this._scene);
        fixedStarLight.intensity = 0.5;
        fixedStarLight.diffuse = new BABYLON.Color3(1, 1, 1);
        fixedStarLight.specular = new BABYLON.Color3(1, 1, 1);

        const planetNum = 5;
        const radiusList = [40, 70, 100, 140, 185];

        for (let i = 0; i < planetNum; i++) {
            const typeName = getPlanetTypeName(i);
            const planet = BABYLON.MeshBuilder.CreateSphere(`planet-${i}`, { segments: 32, diameter: 5, updatable: false }, this._scene);
            planet.setParent(this);

            const mat = new BABYLON.StandardMaterial(`planet-mat-${i}`, this._scene);
            const textures = generatePlanetTexture(this._scene, i);
            mat.diffuseTexture = textures.diffuse;
            if (textures.emissive) {
                mat.emissiveTexture = textures.emissive;
            }
            planet.material = mat;

            planet.position.set(0, 0, radiusList[i]);
            planet.setPivotPoint(new BABYLON.Vector3(0, 0, -radiusList[i]));
            planet.rotation.set(0, Math.random() * BABYLON.Scalar.TwoPi, 0);
            planet.alwaysSelectAsActiveMesh = true;

            const f = new BABYLON.Vector3(radiusList[i], 0, 0);
            const s = new BABYLON.Vector3(0, 0, radiusList[i]);
            const t = new BABYLON.Vector3(-radiusList[i], 0, 0);
            const orbitArc = BABYLON.Curve3.ArcThru3Points(f, s, t, 128, true, true);
            const orbit = BABYLON.MeshBuilder.CreateLines(`orbit-planet-${i}`, { points: orbitArc.getPoints() });
            orbit.setParent(this);
            orbit.position.set(0, 0, 0);

            this.planets.push(planet);
        }
    }

    _rotateSystem() {
        this._scene.onBeforeRenderObservable.add(() => {
            const sec = this._scene.deltaTime / 1000.0;
            this.planets.forEach((planet, i) => {
                const speed = 1 / (20 + i * 15);
                planet.rotation.y = (planet.rotation.y + BABYLON.Scalar.TwoPi * sec * speed) % BABYLON.Scalar.TwoPi;
            });
        });
    }
}
