import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GlTFLoader.js";

import { GUI } from "lil-gui";

let camera, scene, renderer;
let cube, sphere, torus, material;

let cubeCamera, cubeRenderTarget;

let controls;
const loader = new GLTFLoader();

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
  scene.rotation.y = 0.5; // avoid flying objects occluding the sun

  new RGBELoader().setPath("textures/").load("scene.hdr", function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = texture;
    scene.environment = texture;
  });

  //

  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;

  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

  //

  material = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1,
  });

  const gui = new GUI();
  gui.add(material, "roughness", 0, 1);
  gui.add(material, "metalness", 0, 1);
  gui.add(renderer, "toneMappingExposure", 0, 2).name("exposure");

  sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(15, 8), material);
  scene.add(sphere);

  const material2 = new THREE.MeshStandardMaterial({
    roughness: 0.1,
    metalness: 1,
    color: 0xff9999,
  });

  cube = new THREE.Mesh(new THREE.BoxGeometry(15, 15, 15), material2);
  cube.position.x = 30;
  scene.add(cube);

  torus = new THREE.Mesh(new THREE.TorusKnotGeometry(8, 3, 128, 16), material2);
  torus.position.x = -30;
  scene.add(torus);

  //suzanne
  loader.load("/models/suzanne.glb", (suzanne) => {
	  scene.add(suzanne.scene);
	  console.log(suzanne.scene.children[0].position);
	// suzanne.scene.children[0].position.x= 0;
	// suzanne.scene.children[0].position.z= -30;
	suzanne.scene.children[0].scale.x= 8;
	suzanne.scene.children[0].scale.y= 8;
	suzanne.scene.children[0].scale.z= 8;
	sphere.position.x= 0;
	sphere.position.z= 30;
	suzanne.scene.children[0].material= material;
	sphere.material= new THREE.MeshStandardMaterial({
		roughness: 0.2,
		metalness: 1,
		color: 0xffa500
	});
  });

  //
  gui.add(cube.position, "x").min(-50).max(50).step(2);
  gui.add(cube.position, "y").min(-50).max(50).step(2);
  gui.add(cube.position, "z").min(-50).max(50).step(2);
  gui.add(torus.position, "x").min(-50).max(50).step(2);
  gui.add(torus.position, "y").min(-50).max(50).step(2);
  gui.add(torus.position, "z").min(-50).max(50).step(2);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  cubeCamera.update(renderer, scene);

  controls.update();

  renderer.render(scene, camera);

  //   stats.update();
}
