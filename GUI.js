import {GUI} from "three/addons/libs/lil-gui.module.min.js";
import {Settings} from "./settings.js";
import {CylinderGeometry, SphereGeometry} from "three";


export const setupGUI = (cylinderBrush, sphereBrush) => {

    const gui = new GUI();
    const brush1Folder = gui.addFolder( 'sphere' );
    brush1Folder.add( Settings, 'sphereRadius', 1, 100 ).name( 'sphereRadius' ).onChange( v => {
        sphereBrush.dispose()
        console.log("sphereRadius", v)
        sphereBrush = new SphereGeometry(v, Settings.sphereSegment, Settings.sphereSegment);

        // updateBrush( brush1, params.brush1Shape, v );
        // bvhHelper1.update();
    } );

}

export const getBrushes = (target) => {


}
