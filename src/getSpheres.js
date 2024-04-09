import {Operation, SUBTRACTION} from "three-bvh-csg";
import {Settings} from "../settings.js";
import * as THREE from "three";

export const getSpheres = (sphereGeometry, sphereMaterial, settings) => {
    const radiusOffset = settings.verticalRadiusOffset;

    const holes = []
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    for(let j = 0; j < settings.layerCount; j++){
        console.log("new ", j)

        for (let i = 0; i < settings.sphereCount; i++) {
            const angle = (i / settings.sphereCount) * 2 * Math.PI + radiusOffset * j
            sphere = sphere.clone()
            const x = settings.cylinderWidth * Math.cos(angle) * settings.sphereOffset
            const z = settings.cylinderWidth * Math.sin(angle) * settings.sphereOffset

            const y = settings.cylinderHeight / settings.layerCount * j * 2 * settings.verticalLayerOffset - settings.cylinderHeight / 2 - settings.bottomOffset;

            sphere.position.set(x, y, z);

            const hole = new Operation( sphereGeometry.clone(), sphereMaterial );
            hole.position.set(x, y, z);
            hole.operation = SUBTRACTION;

            holes.push(hole);
        }

    }

    return holes;


}
