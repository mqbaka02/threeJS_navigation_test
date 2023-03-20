import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { GUI } from "lil-gui";

import Point_and_click from "./Point_and_click/Point_and_click";

let camera, scene, renderer;

let controls;
const loader = new GLTFLoader();

const gui = new GUI();

const CAMERA_HEIGHT = 10;

let debugCube; //If you want to see the camera's target.
debugCube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);

let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); //collider for the raycast, it will make sense further down

let point_and_click;

init(); //everything is here
function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 10;
  camera.position.y = CAMERA_HEIGHT;

  window.addEventListener("resize", onWindowResized);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = true;

  scene = new THREE.Scene();

  scene.add(debugCube);

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(DracoLoader);

  loader.load("checker.glb", (gltf) => {
    // console.log(gltf.scene);
    scene.add(gltf.scene);
  });

  point_and_click = new Point_and_click(camera, controls, scene, plane);
  point_and_click.ato_daholo_ilay_zavatra();

  debugCube.visible = false;
  gui
    .add(debugCube, "visible")
    .name("Show camera target")
    .onChange(() => {
      // console.log(camera.rotation);
    });
    // point_and_click.marker.visible= false;
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  controls.update();

  debugCube.position.set(
    //just for debugging..
    controls.target.x,
    controls.target.y,
    controls.target.z
  );

  point_and_click.update_everything();

  renderer.render(scene, camera);
}
