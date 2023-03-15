import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { gsap } from "gsap";

import { GUI } from "lil-gui";

let camera, scene, renderer;

let controls;
const loader = new GLTFLoader();

const gui = new GUI();

const CAMERA_HEIGHT = 10;

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const intersection = new THREE.Vector3();
let marker;

let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

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
  camera.position.z = 10;
  camera.position.y = CAMERA_HEIGHT;
  // camera.rotation.x = 2;
  let cam_rot= gui.addFolder("camera rot");
  cam_rot.add(camera.rotation, 'x').min(0).max(2*Math.PI).step(.1);
  cam_rot.add(camera.rotation, 'z').min(0).max(2*Math.PI).step(.1);
  cam_rot.add(camera.rotation, 'y').min(0).max(2*Math.PI).step(.1);
  let cam_pos= gui.addFolder("camera pos");
  cam_pos.add(camera.position, 'x').min(-50).max(50).step(.1);
  cam_pos.add(camera.position, 'z').min(-50).max(50).step(.1);
  cam_pos.add(camera.position, 'y').min(-50).max(50).step(.1);

  scene = new THREE.Scene();

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(DracoLoader);

  loader.load("checker.glb", (gltf) => {
    console.log(gltf.scene);
    scene.add(gltf.scene);
    // plane = gltf.scene.children[0];
    // gsap.to(plane.rotation, {duration: 10, y: 36});
  });

  /**
   * Marker
   */
  marker = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  scene.add(marker);

  /**
   * Marker END
   */

  /**
   * mouse tracking
   */
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  /**
   * mouse tracking END
   */
  /**
   * move the camera
   */
  let drag= false;
  const move_cam = () => {
    const new_pos = { ...marker.position };
    new_pos.y = CAMERA_HEIGHT;
    // var thing= {...camera.rotation};
    gsap.to(camera.position, { duration: 2, x: new_pos.x, z: new_pos.z, onComplete: ()=>{/*controls.enabled= true*/} });
  };
  window.addEventListener('mousedown', () => drag= false);
  window.addEventListener('mousemove', () => drag= true);
  window.addEventListener('mouseup', () => {
    if(!drag){
      move_cam();
    }
    drag= false;
  });
  /**
   * move the camera END
   */

  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.enabled= false;
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  // controls.update();

  /**
   * cast ray
   */
  raycaster.setFromCamera(pointer, camera);
  if (plane) {
    raycaster.ray.intersectPlane(plane, intersection);
    marker.position.x = intersection.x;
    marker.position.z = intersection.z;
    // console.log(intersection);
  }

  // console.log(camera.rotation);

  renderer.render(scene, camera);
}
