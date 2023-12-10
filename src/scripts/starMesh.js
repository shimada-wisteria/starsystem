import * as BABYLON from 'babylonjs';

/**
 * 惑星、衛星メッシュクラス
 * 公転、自転
 *
 */
export class StarMesh extends BABYLON.TransformNode {
    constructor(name, scene, parent, orbitRadius, starRadius) {
        super(name, scene);
        this._scene = scene;
        this.setParent(parent);
        this.position.copyFrom(parent.position)

        this.star = this._createStar(name, orbitRadius, starRadius);
        this._createOrbit(name, parent, orbitRadius);
        this._registerRotateProcess();
    }

    static _baseStarMesh = BABYLON.MeshBuilder.CreateSphere('star', { segments: 32, diameter: 5, updatable: false}, this._scene);
    static starMat = new BABYLON.StandardMaterial('starMat', this._scene);
    static {
        // baseStarMesh.setParent();
        _baseStarMesh.setEnabled(false);
        _baseStarMesh.registerInstancedBuffer('color', 4);
        starMat.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.4);
    }

    _createStar(name, orbitRadius, starRadius) {
        const pivot = new BABYLON.Vector3(0, 0, this._radius);
        // Generate planet instances
        const instance = star.createInstance(`${name}-star`);
        instance.setParent(this);
        instance.diameter.set(starRadius);

        // const orbitPivot = new BABYLON.Vector3(0, 0, orbitRadius);
        // instance.position.copyFrom(planetPivot);
        instance.position.set(new BABYLON.Vector3(0, 0, orbitRadius));

        // instance.setPivotPoint(planetPivot.negate());
        instance.rotation.set(0, Math.random() * BABYLON.Scalar.TwoPi, 0);
        instance.instancedBuffers.color = new BABYLON.Color4(Math.random(), 1, 1, Math.random());
        instance.alwaysSelectAsActiveMesh = true;
        return instance;
        // this.planets.push(instance);
        // }
    }

    _createOrbit(name, parent, orbitRadius) {
        const f = new BABYLON.Vector3(orbitRadius, 0, 0);
        const s = new BABYLON.Vector3(0, 0, orbitRadius);
        const t = new BABYLON.Vector3(-orbitRadius, 0, 0);
        const orbitArc = BABYLON.Curve3.ArcThru3Points(f, s, t, 128, true, true);

        const orbit = BABYLON.MeshBuilder.CreateLines(`${name}-orbit`, {points: orbitArc.getPoints()});
        orbit.setParent(parent); // 公転の回転対象外のため、親である星系に直接持たせる
        orbit.position.set(0, 0, 0);
    }

    _registerRotateProcess() {
        this._scene.onBeforeRenderObservable.add(() => {
            const sec = this._scene.deltaTime / 1000.0;
            this.rotation.y = (planet.rotation.y + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;
            this.star.rotation.y = (planet.rotation.y + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;

            // this.planets.forEach(planet => {
            //     planet.rotation.y = (planet.rotation.y + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;
            //     // planet.rotation.z = (planet.rotation.z + BABYLON.Scalar.TwoPi * (sec) / 60) % BABYLON.Scalar.TwoPi;
            // });
            // this.rotation.y += this._scene.deltaTime / 100000;
        });
    }
}