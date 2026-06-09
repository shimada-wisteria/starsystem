import * as BABYLON from '@babylonjs/core';
import * as ProceduralTexture from '@babylonjs/procedural-textures';
import { generatePlanetTexture, getPlanetTypeName } from './planetTextureGenerator.js';

export class PlanetarySystem extends BABYLON.TransformNode {
    _radius = 500;

    constructor(name, scene) {
        super(name, scene);
        this._scene = scene;
        this.position.set(0, 0, 0);
        this._createPlanetarySystem(this._radius);
        this._rotateSystem();
    }

    planets = []

    _createPlanetarySystem(radius) {
        this._createFixedStar();

        const planetNum = 5;
        const radiusList = [40, 70, 100, 140, 185];
        const orbitPalette = [
            new BABYLON.Color3(0.0, 0.9, 1.0),
            new BABYLON.Color3(0.3, 0.5, 1.0),
            new BABYLON.Color3(0.6, 0.3, 1.0),
            new BABYLON.Color3(0.8, 0.1, 0.9),
            new BABYLON.Color3(1.0, 0.1, 0.7),
        ];
        // [rotX, rotZ] in radians — per-orbit inclination
        const inclinations = [
            [0,     0    ],
            [0.21,  0    ],
            [0,     0    ],
            [0,     0.35 ],
            [0.14, -0.10 ],
        ];

        for (let i = 0; i < planetNum; i++) {
            const orbitPivot = new BABYLON.TransformNode(`orbit-pivot-${i}`, this._scene);
            orbitPivot.setParent(this);
            orbitPivot.rotation.x = inclinations[i][0];
            orbitPivot.rotation.z = inclinations[i][1];

            const typeName = getPlanetTypeName(i);
            const planet = BABYLON.MeshBuilder.CreateSphere(`planet-${i}`, { segments: 32, diameter: 5, updatable: false }, this._scene);
            planet.setParent(orbitPivot);

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
            const orbitPoints = orbitArc.getPoints();

            // SF colored orbit ring
            const orbit = BABYLON.MeshBuilder.CreateLines(`orbit-planet-${i}`, { points: orbitPoints });
            orbit.color = orbitPalette[i];
            orbit.setParent(orbitPivot);
            orbit.position.set(0, 0, 0);
            orbit.rotation.set(0, 0, 0);
            orbit.alwaysSelectAsActiveMesh = true;


            this.planets.push(planet);
        }
    }

    _createFixedStar() {
        // Fire surface — opaque sphere; emissiveColor provides a constant orange base
        // so dark phases of the fire texture never go fully black.
        // No separate core sphere: eliminates the hard circular-edge artifact.
        const fixedStar = BABYLON.MeshBuilder.CreateSphere('fixedStar', { segments: 32, diameter: 20, updatable: false }, this._scene);
        const fixedStarMat = new BABYLON.StandardMaterial('fixedStarMat', this._scene);
        fixedStarMat.disableLighting = true;
        fixedStarMat.emissiveColor = new BABYLON.Color3(0.7, 0.35, 0.0);
        const fireTexture = new ProceduralTexture.FireProceduralTexture('fire', 256, this._scene);
        fixedStarMat.emissiveTexture = fireTexture;
        fixedStar.material = fixedStarMat;
        fixedStar.setParent(this);
        fixedStar.alwaysSelectAsActiveMesh = true;

        // Particle texture — soft radial gradient, created on a DynamicTexture
        const ptex = new BABYLON.DynamicTexture('coronaParticleTex', { width: 64, height: 64 }, this._scene, false);
        const ctx = ptex.getContext();
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0,   'rgba(255, 230, 150, 1)');
        grad.addColorStop(0.3, 'rgba(255, 140,  20, 0.8)');
        grad.addColorStop(0.7, 'rgba(200,  50,   0, 0.3)');
        grad.addColorStop(1,   'rgba(150,  10,   0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        ptex.update();

        // Corona particle system — irregular solar flares from star surface
        const coronaPS = new BABYLON.ParticleSystem('coronaPS', 600, this._scene);
        coronaPS.particleTexture = ptex;
        coronaPS.emitter = fixedStar;
        coronaPS.particleEmitterType = new BABYLON.SphereParticleEmitter(10.5, 0.2, 0.4);
        coronaPS.addColorGradient(0,   new BABYLON.Color4(1,    0.9,  0.4,  0.9));
        coronaPS.addColorGradient(0.5, new BABYLON.Color4(1,    0.35, 0.05, 0.5));
        coronaPS.addColorGradient(1,   new BABYLON.Color4(0.5,  0.08, 0,    0));
        coronaPS.addSizeGradient(0,   2, 5);
        coronaPS.addSizeGradient(0.5, 1.5, 4);
        coronaPS.addSizeGradient(1,   0.2, 1);
        coronaPS.minLifeTime = 2;
        coronaPS.maxLifeTime = 5;
        coronaPS.emitRate = 180;
        coronaPS.minEmitPower = 0.05;
        coronaPS.maxEmitPower = 0.9;
        coronaPS.updateSpeed = 0.01;
        coronaPS.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
        coronaPS.start();

        const fixedStarLight = new BABYLON.PointLight('fixedStarLight', BABYLON.Vector3.Zero(), this._scene);
        fixedStarLight.intensity = 1.5;
        fixedStarLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7);
        fixedStarLight.specular = new BABYLON.Color3(1, 1, 0.8);
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
