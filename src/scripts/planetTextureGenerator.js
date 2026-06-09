import * as BABYLON from '@babylonjs/core';
import * as ProceduralTexture from '@babylonjs/procedural-textures';

const PLANET_TYPES = ['rocky', 'gas', 'ocean', 'lava', 'ice'];

/**
 * 惑星インデックスに対応する手続き的テクスチャを生成する。
 * 各タイプは異なるノイズアルゴリズムを使用し、AI生成ライクな惑星表面を実現する。
 * @param {BABYLON.Scene} scene
 * @param {number} planetIndex
 * @returns {{ diffuse: BABYLON.Texture, emissive?: BABYLON.Texture }}
 */
export function generatePlanetTexture(scene, planetIndex) {
    const type = PLANET_TYPES[planetIndex % PLANET_TYPES.length];
    switch (type) {
        case 'rocky': return createRockyTexture(scene, planetIndex);
        case 'gas':   return createGasTexture(scene, planetIndex);
        case 'ocean': return createOceanTexture(scene, planetIndex);
        case 'lava':  return createLavaTexture(scene, planetIndex);
        case 'ice':   return createIceTexture(scene, planetIndex);
        default:      return createRockyTexture(scene, planetIndex);
    }
}

/**
 * 惑星タイプ名を返す（デバッグ・UI表示用）
 */
export function getPlanetTypeName(planetIndex) {
    return PLANET_TYPES[planetIndex % PLANET_TYPES.length];
}

function createRockyTexture(scene, index) {
    const tex = new ProceduralTexture.MarbleProceduralTexture(`rocky-tex-${index}`, 512, scene);
    tex.numberOfTilesHeight = 3;
    tex.numberOfTilesWidth = 3;
    tex.amplitude = 9.0;
    tex.jointColor = new BABYLON.Color3(0.55, 0.2, 0.05);
    return { diffuse: tex };
}

function createGasTexture(scene, index) {
    const tex = new ProceduralTexture.CloudProceduralTexture(`gas-tex-${index}`, 512, scene);
    tex.cloudColor = new BABYLON.Color4(0.95, 0.75, 0.35, 1.0);
    tex.skyColor = new BABYLON.Color4(0.7, 0.4, 0.1, 1.0);
    tex.numOctaves = 6;
    return { diffuse: tex };
}

function createOceanTexture(scene, index) {
    const tex = new ProceduralTexture.CloudProceduralTexture(`ocean-tex-${index}`, 512, scene);
    tex.cloudColor = new BABYLON.Color4(0.9, 0.95, 1.0, 1.0);
    tex.skyColor = new BABYLON.Color4(0.05, 0.25, 0.75, 1.0);
    tex.numOctaves = 4;
    return { diffuse: tex };
}

function createLavaTexture(scene, index) {
    const tex = new ProceduralTexture.FireProceduralTexture(`lava-tex-${index}`, 512, scene);
    tex.fireColors = [
        new BABYLON.Color3(0.1, 0.0, 0.0),
        new BABYLON.Color3(0.5, 0.0, 0.0),
        new BABYLON.Color3(0.9, 0.2, 0.0),
        new BABYLON.Color3(1.0, 0.5, 0.0),
        new BABYLON.Color3(1.0, 0.8, 0.1),
        new BABYLON.Color3(1.0, 1.0, 0.6),
    ];
    return { diffuse: tex, emissive: tex };
}

function createIceTexture(scene, index) {
    const tex = new ProceduralTexture.CloudProceduralTexture(`ice-tex-${index}`, 512, scene);
    tex.cloudColor = new BABYLON.Color4(0.95, 0.97, 1.0, 1.0);
    tex.skyColor = new BABYLON.Color4(0.6, 0.75, 0.9, 1.0);
    tex.numOctaves = 3;
    tex.amplitude = 0.5;
    return { diffuse: tex };
}
