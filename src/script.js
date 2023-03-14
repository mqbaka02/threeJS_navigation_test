import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { GUI } from "lil-gui";

let camera, scene, renderer;
// let cube, sphere, torus, material;

let controls;
const loader = new GLTFLoader();

// const prmeGeneator = new THREE.PMREMGenerator(renderer);

const gui = new GUI();

// const rgbeLoader = new RGBELoader();

const textures = {
  nx: undefined,
  ny: undefined,
  px: undefined,
  py: undefined,
};

init();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResized);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 75;

  scene = new THREE.Scene();

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(DracoLoader);

  // loader.load('models/', (gltf) => {
  //   console.log(gltf.scene);
  // });

  controls = new OrbitControls(camera, renderer.domElement);
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {

  controls.update();

  renderer.render(scene, camera);

  //   stats.update();
}
