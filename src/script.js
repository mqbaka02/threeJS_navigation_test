import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { gsap } from "gsap";

import { GUI } from "lil-gui";

let camera,
  scene,
  renderer,
  drag = false;//indicating if the user is draging his mouse down

let controls,
  camera_is_moving = false;
const loader = new GLTFLoader();

const gui = new GUI();

const CAMERA_HEIGHT = 10;

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const intersection = new THREE.Vector3();
let marker;

let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);//collider for the raycast, it will make sense further down

init();//everything is here

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


  // let cam_rot = gui.addFolder("camera rot");
  // cam_rot
  //   .add(camera.rotation, "x")
  //   .min(0)
  //   .max(2 * Math.PI)
  //   .step(0.1);
  // cam_rot
  //   .add(camera.rotation, "z")
  //   .min(0)
  //   .max(2 * Math.PI)
  //   .step(0.1);
  // cam_rot
  //   .add(camera.rotation, "y")
  //   .min(0)
  //   .max(2 * Math.PI)
  //   .step(0.1);
  // let cam_pos = gui.addFolder("camera pos");
  // cam_pos.add(camera.position, "x").min(-50).max(50).step(0.1);
  // cam_pos.add(camera.position, "z").min(-50).max(50).step(0.1);
  // cam_pos.add(camera.position, "y").min(-50).max(50).step(0.1);

  scene = new THREE.Scene();

  const DracoLoader = new DRACOLoader();
  DracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(DracoLoader);

  loader.load("checker.glb", (gltf) => {
    console.log(gltf.scene);
    scene.add(gltf.scene);
  });



  /**
   * Marker
   */
  //a red cube used as cursor for moving the camera
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
  drag = false;//I'll leave it there just for safety :D
  const move_cam = () => {

    // console.log(`Before: `);
    // console.log(camera.rotation);

    camera_is_moving = true;
    const offset = {//I'll use this to locate the target of the camera
      x: controls.target.x - camera.position.x,
      y: controls.target.y - camera.position.y,
      z: controls.target.z - camera.position.z,
    };

    // console.log("Offset is :");
    // console.log(offset);

    const new_pos = { ...marker.position };//we'll gonna move the camera to this location, we're copying the object because marker.position is going to be constantly changing
    new_pos.y = CAMERA_HEIGHT;
    gsap.to(camera.position, {
      duration: 2,
      x: new_pos.x,
      y: new_pos.y,
      z: new_pos.z,

      onComplete: () => {
        controls.target.x = offset.x + camera.position.x;
        // controls.target.y= offset.x + camera.position.y;
        controls.target.z = offset.x + camera.position.z;

        // console.log(`After :`);
        // console.log(camera.rotation);
        // console.log("Offset is :");

        offset.x = controls.target.x - camera.position.x;
        offset.y = controls.target.y - camera.position.y;
        offset.z = controls.target.z - camera.position.z;
        // console.log(offset);
        camera_is_moving = false;
      }

    });
  };

  //the following is to make sure that the camera changes position only when the user clicks and not when he is dragging his mouse down
  const mouse_is_moving = () => {
    drag = true;
  };
  window.addEventListener("mousedown", () => {
    drag = false;
    window.addEventListener("mousemove", mouse_is_moving);//as soon as the mouse moves
  });
  window.addEventListener("mouseup", () => {

    window.removeEventListener("mousemove", mouse_is_moving);//to avoid calling the function when the mouse button is up

    if (!drag) {//if user lifts mouse button without moving the mouse
      move_cam();
    }
    drag = false;
  });
  /**
   * move the camera END
   */

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  if (!camera_is_moving) {
    controls.update();
  }

  marker.visible = !drag;

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
