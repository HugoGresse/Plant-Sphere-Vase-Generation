import './style.css'
import {threeSetup} from "./threeSetup.js";
import {generateCylinder} from "./cylinder.js";
import {STLExporter, TransformControls} from "three/addons";
import {GUI} from "three/addons/libs/lil-gui.module.min.js";
import {Settings} from "./settings.js";

document.querySelector('#app').innerHTML = `
  <div>
  <div id="three"></div>
  <button id="export" style="position: absolute; right: 0; top: 0; padding: 12px; background-color: #7777FF55">export</button>
  </div>
`

const {scene, camera, renderer, controls, cylinder, sphere} = threeSetup();

generateCylinder(scene);

document.getElementById('export').addEventListener('click', () => {
    console.log("export")
    const exporter = new STLExporter();
    const options = {binary: true}
    const result = exporter.parse(scene, options);
    const blob = new Blob([result], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.stl';
    a.click();
    URL.revokeObjectURL(url);
});

function animate() {
    scene.rotation.y += 0.01;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
