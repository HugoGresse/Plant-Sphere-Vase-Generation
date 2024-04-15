import {MeshStandardMaterial} from "three";

export const getMaterial = (settings) => {
    return new MeshStandardMaterial({
        color: settings.color,
        roughness: 0.4,
        metalness: 0.3,
        depthWrite: true,
        depthTest: true,
        wireframe: false,
        vertexColors: false,
        precision: 'highp',
        polygonOffset: false,
        polygonOffsetFactor: 0,
        polygonOffsetUnits: 0,
        premultipliedAlpha: false,
    })
}
