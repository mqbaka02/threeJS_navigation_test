import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { GUI } from "lil-gui";
import { CubeCamera } from "three";

let camera, scene, renderer, myH;
let cube, sphere, torus, material;

let cubeCamera, cubeRenderTarget, initial_pos;
let thing;

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

  cubeCamera = new THREE.CubeCamera(.01, 1000, cubeRenderTarget);

  //

  material = new THREE.MeshStandardMaterial({
    envMap: cubeRenderTarget.texture,
    roughness: 0.05,
    metalness: 1,
  });

  const basicMat = new THREE.MeshBasicMaterial({ color: 0xffaaaa });

  const gui = new GUI();
  gui.add(material, "roughness", 0, 1);
  gui.add(material, "metalness", 0, 1);
  gui.addColor(basicMat, "color");
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

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");

  //   const gltfLoader = new GLTFLoader();
  loader.setDRACOLoader(DracoLoader);

  //scene
  loader.load("/models/scene.glb", (glb) => {
    console.log(glb.scene.children[2]);
    for (var i = 0; i < glb.scene.children.length; i++) {
      var child = glb.scene.children[i];
      if (child.material) {
        child.material.side = THREE.FrontSide;
      }
      if (child.name === "Empty") {
        thing = child;
        thing.visible = false;
        console.log("Found : ", child);
        console.log(child.position);
        // cubeCamera.position.set(child.geometry.boundingSphere.center);

        // cubeCamera.position.x = child.position.x;
        // cubeCamera.position.y = child.position.y;
        // cubeCamera.position.z = child.position.z;

        // cubeCamera.position.x = 0;
        // cubeCamera.position.y = 0;
        // cubeCamera.position.z = 0;
        camera.position.set(
          child.position.x,
          child.position.y,
          child.position.z
        );
      }
      if(child.name=== "Miror_reflectif002"){
        child.material= material;
      }
    }
    scene.add(glb.scene);
  });
  //   const helper = new THREE.CameraHelper( cubeCamera );
  myH = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), basicMat);
  scene.add(myH);
  console.log(cubeCamera.position);
  initial_pos= new THREE.Vector3((-5.57, -0.16, 13.5));
  cubeCamera.position.set(initial_pos);
  var fold = gui.addFolder("cubeCamera");

  fold.add(cubeCamera.position, "x").min(-20).max(20).step(0.01).onChange(()=>{console.log(cubeCamera.position)});
  fold.add(cubeCamera.position, "y").min(-20).max(20).step(0.01).onChange(()=>{console.log(cubeCamera.position)});
  fold.add(cubeCamera.position, "z").min(-20).max(20).step(0.01).onChange(()=>{console.log(cubeCamera.position)});
  // cubeCamera.position.set({x: 3.28, y: -0.16, z: -8.02});
  console.log(cubeCamera);
//   fold.add(cubeCamera, "near").min(.00001).max(10).step(.00001);
  fold.add(myH, 'visible').name("show_helper");
  //   scene.add( helper );

  //suzanne
  //   loader.load("/models/suzanne.glb", (suzanne) => {
  // 	  scene.add(suzanne.scene);
  // 	  console.log(suzanne.scene.children[0].position);
  // 	// suzanne.scene.children[0].position.x= 0;
  // 	// suzanne.scene.children[0].position.z= -30;
  // 	suzanne.scene.children[0].scale.x= 8;
  // 	suzanne.scene.children[0].scale.y= 8;
  // 	suzanne.scene.children[0].scale.z= 8;
  // 	sphere.position.x= 0;
  // 	sphere.position.z= 30;
  // 	suzanne.scene.children[0].material= material;
  // 	sphere.material= new THREE.MeshStandardMaterial({
  // 		roughness: 0.2,
  // 		metalness: 1,
  // 		color: 0xffa500
  // 	});
  //   });

  //
  gui.add(cube.position, "x").min(-50).max(50).step(2);
  gui.add(cube.position, "y").min(-50).max(50).step(2);
  gui.add(cube.position, "z").min(-50).max(50).step(2);
  gui.add(torus.position, "x").min(-50).max(50).step(2);
  gui.add(torus.position, "y").min(-50).max(50).step(2);
  gui.add(torus.position, "z").min(-50).max(50).step(2);
  cube.visible= false;
  sphere.visible= false;
  torus.visible= false;
  gui.add(cube, "visible").name("cube");
  gui.add(torus, "visible").name("torus");
  gui.add(sphere, "visible").name("sphere");

  controls = new OrbitControls(camera, renderer.domElement);
  // controls.autoRotate = true;
  controls.autoRotate = false;
  gui.add(controls, "autoRotate");
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  cubeCamera.update(renderer, scene);

  myH.position.x= cubeCamera.position.x;
  myH.position.y= cubeCamera.position.y;
  myH.position.z= cubeCamera.position.z;

  // cubeCamera.rotation.y= camera.rotation.y;
  // cubeCamera.position.z= 
//   console.log(cubeCamera.position);

  if (thing) {
    thing.visible = true;
  }

  // if (controls) {
    controls.update();
  // }

  //   camera.lookAt(cubeCamera.position);

  renderer.render(scene, camera);

  //   stats.update();
}
