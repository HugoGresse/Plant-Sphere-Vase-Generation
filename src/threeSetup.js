import * as THREE from "three";
import {OrbitControls, RoomEnvironment} from "three/addons";
import {Settings} from "../settings.js";

export const threeSetup = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    scene.add( new THREE.AmbientLight( 0x222222 ) );

    const light = new THREE.DirectionalLight( 0x00ffff, Settings.lightIntensity );
    light.position.set( Settings.cylinderWidth * 20,Settings.cylinderWidth * 20,Settings.cylinderHeight * 10 );
    light.castShadow = true;
    light.shadow.camera.zoom = 4; // tighter shadow map
    scene.add( light );

    const light2 = new THREE.DirectionalLight( 0xff0000, Settings.lightIntensity );
    light2.position.set( Settings.cylinderWidth * 1,0,- Settings.cylinderHeight * 60 );
    scene.add( light2 );

    const light3 = new THREE.DirectionalLight( 0xff00ff, Settings.lightIntensity );
    light3.position.set( - Settings.cylinderWidth * 60,0,- Settings.cylinderHeight );
    scene.add( light3 );

    // const pmremGenerator = new THREE.PMREMGenerator( renderer );
    // scene.environment = pmremGenerator.fromScene( new RoomEnvironment( renderer ), 0.04 ).texture;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls( camera, renderer.domElement );
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;

    camera.position.z = Settings.cylinderHeight * 1.9;
    camera.position.y = Settings.cylinderWidth * 1.5;
    camera.rotation.x = 100

    return {
        scene,
        camera,
        renderer,
        controls,
    }
}
