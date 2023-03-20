import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

// import { gsap } from "gsap";

import { GUI } from "lil-gui";

import Point_and_click from "./Point_and_click/Point_and_click";

const CAMERA_KEYBOARD_SPEED = 0.3;
const LEFT_KEY = "ArrowLeft";
const RIGHT_KEY = "ArrowRight";
const UP_KEY = "ArrowUp";
const DOWN_KEY = "ArrowDown"; //kamo be za hitadidy dia ataoko anaty const ^^'
let forward_pressed = false;
let back_pressed = false;
let left_pressed = false;
let right_pressed = false;
let camera_local_movement = new THREE.Vector3(0, 0, 0);
let camera_global_movement = new THREE.Vector3(0, 0, 0);

let camera,
  scene,
  renderer;



let controls;
const loader = new GLTFLoader();

const gui = new GUI();

const CAMERA_HEIGHT = 10;

let debugCube;
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
  
  point_and_click= new Point_and_click(camera, controls, scene, plane);

  point_and_click.add_marker();

  point_and_click.track_mouse();

  point_and_click.detect_click();

  listen_to_keyboard();

  debugCube.visible= false;
  gui
    .add(debugCube, "visible")
    .name("Show camera target")
    .onChange(() => {
      // console.log(camera.rotation);
    }
  );
}

function listen_to_keyboard(){
  const key_is_down = (e) => {
    // console.log(e.keyCode);
    if (e.code === UP_KEY) {
      forward_pressed = true;
    } if (e.code === DOWN_KEY) {
      back_pressed = true;
    } if (e.code === LEFT_KEY) {
      left_pressed = true;
    } if (e.code === RIGHT_KEY) {
      right_pressed = true;
    }
  };
  window.addEventListener("keydown", key_is_down);

  window.addEventListener("keyup", (e) => {
    if (e.code === UP_KEY) {
      forward_pressed = false;
    } if (e.code === DOWN_KEY) {
      back_pressed = false;
    } if (e.code === LEFT_KEY) {
      left_pressed = false;
    } if (e.code === RIGHT_KEY) {
      right_pressed = false;
    }
  });
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

const handle_camera_keyboard= ()=>{
  if (back_pressed) {
    camera_local_movement.z = -CAMERA_KEYBOARD_SPEED;
  } else if (forward_pressed) {
    camera_local_movement.z = CAMERA_KEYBOARD_SPEED;
    // console.log(camera.position);
    // console.log(camera_global_movement);
  } else {
    camera_local_movement.z = 0;
  }

  if (left_pressed) {
    camera_local_movement.x = -CAMERA_KEYBOARD_SPEED;
    // console.log(camera.position);
  } else if (right_pressed) {
    camera_local_movement.x = CAMERA_KEYBOARD_SPEED;
  } else {
    camera_local_movement.x = 0;
  }

  camera_global_movement = camera_local_movement.applyQuaternion(
    camera.quaternion
  );

  camera.position.z += camera_global_movement.z;
  controls.target.z += camera_global_movement.z;
  camera.position.x += camera_global_movement.x;
  controls.target.x += camera_global_movement.x;
};

function animation() {
  controls.update();

  handle_camera_keyboard();

  debugCube.position.set(
    controls.target.x,
    controls.target.y,
    controls.target.z
  );

  point_and_click.update_marker();

  renderer.render(scene, camera);
}
