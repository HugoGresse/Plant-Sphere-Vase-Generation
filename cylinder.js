import * as THREE from "three";
import {SUBTRACTION, Brush, Evaluator} from 'three-bvh-csg';
import {BufferGeometry, Mesh, MeshStandardMaterial} from "three";
import {Settings} from "./settings.js";
import {setupGUI} from "./GUI.js";

const MaterialConstructor = () => new MeshStandardMaterial({
    color: Settings.color,
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

const Material = MaterialConstructor();
const evaluator = new Evaluator();

export const removeSphereFromCylinder = (cylinder, sphere) => {
    const cylinderBrush = new Brush(cylinder.geometry, Material);
    const sphereBrush = new Brush(sphere.geometry, Material);
    sphereBrush.position.set(sphere.position.x, sphere.position.y, sphere.position.z);

    cylinderBrush.updateMatrixWorld();
    sphereBrush.updateMatrixWorld();

    const resultObject = new Mesh(new BufferGeometry(), Material);

    evaluator.evaluate(cylinderBrush, sphereBrush, SUBTRACTION, resultObject);

    return resultObject;
}

export const generateCylinder = (scene) => {
    const cylinderGeometry = new THREE.CylinderGeometry(Settings.cylinderWidth, Settings.cylinderWidth, Settings.cylinderHeight, Settings.cylinderSegment);
    const cylinderMaterial = Material;
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

    const sphereGeometry = new THREE.SphereGeometry(Settings.sphereRadius, Settings.sphereSegment, Settings.sphereSegment);
    const sphereMaterial = Material;

    let object = cylinder;

    const radiusOffset = Settings.verticalRadiusOffset;

    for(let j = 0; j < Settings.layerCount; j++){
        console.log("new ", j)

        for (let i = 0; i < Settings.sphereCount; i++) {
            const angle = (i / Settings.sphereCount) * 2 * Math.PI + radiusOffset * j
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            const x = Settings.cylinderWidth * Math.cos(angle) * Settings.sphereOffset
            const z = Settings.cylinderWidth * Math.sin(angle) * Settings.sphereOffset

            const y = Settings.cylinderHeight / Settings.layerCount * j * 2 * Settings.verticalLayerOffset - Settings.cylinderHeight / 2 - Settings.bottomOffset;

            sphere.position.set(x, y, z);
            object = removeSphereFromCylinder(object, sphere);
        }

    }

    scene.add(object);

    setupGUI(cylinder, sphereGeometry)
}
