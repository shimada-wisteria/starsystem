import * as BABYLON from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { BackStars } from "./backgroundStars.js";
import { PlanetarySystem } from "./planetarySystem.js";

var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

window.engine = null;
window.scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
    const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
    return engine;
};

class Playground {
    static CreateScene(engine, canvas) {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(engine);
        // scene.clearColor = new BABYLON.Color4(0.2, 0.2, 0.2, 1);
        scene.clearColor = new BABYLON.Color4(0, 0, 0.05, 1);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 0, -10), scene);
        // camera.addBehavior(WASD_KEYS);
        camera.inertia = 0.7;
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        camera.position.set(0, 0, -150);

        const environmentLight = new BABYLON.HemisphericLight('environmentLight', new BABYLON.Vector3(0, 1, 0), scene);
        environmentLight.intensity = 0.5;
        environmentLight.diffuse = new BABYLON.Color3(1, 1, 1);
        environmentLight.specular = new BABYLON.Color3(1, 1, 1);
        environmentLight.groundColor = new BABYLON.Color3(1, 1, 1);

        const backStars = new BackStars('backStars', scene);
        const planetarySystem = new PlanetarySystem('planetarySystem', scene);

        // const glow = new BABYLON.GlowLayer('glow', scene, {
        //     blurKernelSize: 32
        // });
        // glow.intensity = 1;
        // glow.isEnabled = false;
        scene.freezeActiveMeshes();
        // scene.freezeMaterials();

        // Inspector.Show(scene, {});

        return scene;
    }
}

// const WASD_KEYS = {
//     name: 'WASD_KEYS',
//     init() { },
//     attach(self) {
//         self.keysUp.push('W'.charCodeAt(0));
//         self.keysLeft.push('A'.charCodeAt(0));
//         self.keysDown.push('S'.charCodeAt(0));
//         self.keysRight.push('D'.charCodeAt(0));
//     },
//     detach() { }
// };

const createScene = function () {
    return Playground.CreateScene(engine, engine.getRenderingCanvas());
}

window.initFunction = async function () {
    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!window.engine) throw 'engine should not be null.';
    startRenderLoop(window.engine, canvas);
    window.scene = createScene();
};

initFunction().then(() => {
    sceneToRender = window.scene
});

// Resize
window.addEventListener("resize", function () {
    window.engine.resize();
});