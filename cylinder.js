import {SUBTRACTION, Brush, Evaluator, Operation, OperationGroup} from 'three-bvh-csg';
import {BufferGeometry, CylinderGeometry, Mesh, MeshStandardMaterial, SphereGeometry} from "three";
import {Settings} from "./settings.js";
import { setupGUI} from "./GUI.js";
import {getSpheres} from "./src/getSpheres.js";

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

export const generateCylinder = (scene, settings = Settings) => {
    evaluator.attributes = [ 'position', 'normal' ];
    evaluator.useGroups = true;

    console.log("render, settings", settings)
    const cylinderGeometry = new CylinderGeometry(settings.cylinderWidth, settings.cylinderWidth, settings.cylinderHeight, settings.cylinderSegment);

    const sphereGeometry = new SphereGeometry(settings.sphereRadius, settings.sphereSegment, settings.sphereSegment);

    const root = new Operation(cylinderGeometry, Material);

    const holes = getSpheres(sphereGeometry, Material, settings);
    const operationGroup = new OperationGroup()
    operationGroup.add(...holes);

    root.add(operationGroup);


    setupGUI(scene, root, holes, evaluator, Material, cylinderGeometry, generateCylinder)
}
