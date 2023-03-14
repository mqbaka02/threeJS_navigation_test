import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { GUI } from "lil-gui";

let camera, scene, renderer;
// let cube, sphere, torus, material;
let sphere;
let cubeCamera, cubeRenderTarget;

let controls;
const loader = new GLTFLoader();

const debugObj = {
  material_used: "cubeCamera",
  cam_orient: "py",
};

const prmeGeneator = new THREE.PMREMGenerator(renderer);

const gui = new GUI();

const rgbeLoader = new RGBELoader();

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

  rgbeLoader.setPath("/models/");
  textures["nx"] = rgbeLoader.load("nx.hdr");
  textures["nx"].mapping = THREE.EquirectangularReflectionMapping;
  textures["ny"] = rgbeLoader.load("ny.hdr");
  textures["ny"].mapping = THREE.EquirectangularReflectionMapping;
  textures["px"] = rgbeLoader.load("px.hdr");
  textures["px"].mapping = THREE.EquirectangularReflectionMapping;
  textures["py"] = rgbeLoader.load("py.hdr");
  textures["py"].mapping = THREE.EquirectangularReflectionMapping;

  window.addEventListener("resize", onWindowResized);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.z = 75;
  // camera.position.set(0, 0, 0);

  scene = new THREE.Scene();
  // new RGBELoader().setPath("/").load("nx.hdr", function (texture) {
  //   texture.mapping = THREE.EquirectangularReflectionMapping;

  //   scene.background = texture;
  //   scene.environment = texture;
  // });

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(DracoLoader);

  loader.load("/models/CUBE.glb", (gltf) => {
    scene.add(gltf.scene);
    gltf.scene.scale.set(10, 10, 10);
  });

  const material = new THREE.MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0,
  });

  sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(8, 56),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  sphere.material = material;
  scene.add(sphere);

  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;
  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  // cubeCamera.renderTarget= cubeRenderTarget;
  // material.envMap= cubeRenderTarget.texture;
  const render_target = prmeGeneator.fromEquirectangular(textures["px"]);
  material.envMap = render_target;

  gui
    .add(debugObj, "material_used", ["cubeCamera", "hdr"])
    .onChange((value) => {
      console.log(debugObj.material_used);
      material.envMap =
        value === "cubeCamera"
          ? cubeRenderTarget.texture
          : textures[debugObj.cam_orient];
    });
  gui
    .add(debugObj, "cam_orient", ["nx", "ny", "px", "py"])
    .onChange((value) => {
      console.log(debugObj.cam_orient);
      const render_target = prmeGeneator.fromEquirectangular(textures[value]);
      material.envMap = render_target;
    });

  controls = new OrbitControls(camera, renderer.domElement);
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
