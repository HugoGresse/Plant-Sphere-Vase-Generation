import {GUI} from "three/addons/libs/lil-gui.module.min.js";
import {Settings} from "./settings.js";
import {Operation} from "three-bvh-csg";
import {generateCylinder} from "./cylinder.js";


export const setupGUI = (scene, root, holes, evaluator, Material, cylinderGeometry, generateCylinder) => {
    const refresh = () => {
        const result = evaluator.evaluateHierarchy( root );
        result.material = Material;
        scene.add( result );
    }

    const gui = new GUI();
    const cylinderFolder = gui.addFolder( 'Cylinder' );
    cylinderFolder.add( Settings, 'cylinderWidth', 1, 100 ).name( 'cylinderWidth' ).onChange( v => {
        console.log("cylinderWidth", v, root)
        const newSettings  = {...Settings, cylinderWidth: v}
        // TODO : https://github.com/josdirksen/learning-threejs/blob/master/chapter-05/06-basic-3d-geometries-cylinder.html#L65

        generateCylinder(scene, newSettings)
    } );

    const sphereFolder = gui.addFolder( 'sphere' );
    sphereFolder.add( Settings, 'sphereRadius', 1, 100 ).name( 'sphereRadius' ).onChange( v => {
        console.log("sphereRadius", v, holes)

        for(let hole of holes){
            hole.geometry.parameters.radius = v
        }
    } );

    refresh()
}
