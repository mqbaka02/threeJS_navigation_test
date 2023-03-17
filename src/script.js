import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GlTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/dracoloader.js";

import { gsap } from "gsap";

import { GUI } from "lil-gui";

const CAMERA_KEYBOARD_SPEED = 0.3;
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const UP_KEY = 38;
const DOWN_KEY = 40; //kamo be za hitadidy dia ataoko anaty const ^^'
let forward_pressed = false;
let back_pressed = false;
let left_pressed = false;
let right_pressed = false;
let camera_local_movement_angle = 0;
let camera_global_movement_angle = 0;
let camera_local_movement = new THREE.Vector3(0, 0, 0);
let camera_global_movement = new THREE.Vector3(0, 0, 0);

let camera,
  scene,
  renderer,
  drag = false; //indicating if the user is draging his mouse down

let clicked_in_gui;

let controls,
  camera_is_moving = false;
const loader = new GLTFLoader();

const gui = new GUI();

const CAMERA_HEIGHT = 10;

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const intersection = new THREE.Vector3();
let marker, debugCube;

debugCube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);

let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); //collider for the raycast, it will make sense further down

init(); //everything is here

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

  scene.add(debugCube);

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
   * move the camera with mouse
   */
  drag = false; //I'll leave it there just for safety :D
  const move_cam = () => {
    camera_is_moving = true;
    controls.enabled = false;
    const offset = {
      //I'll use this to locate the target of the camera
      x: controls.target.x - camera.position.x,
      y: controls.target.y - camera.position.y,
      z: controls.target.z - camera.position.z,
    };

    const current_rot = new THREE.Euler().copy(camera.rotation);

    // console.log("Offset is :");
    // console.log(offset);

    const new_pos = { ...marker.position }; //we'll gonna move the camera to this location, we're copying the object because marker.position is going to be constantly changing
    new_pos.y = camera.position.y;
    gsap.to(camera.position, {
      duration: 2,
      x: new_pos.x,
      y: new_pos.y,
      z: new_pos.z,

      onComplete: () => {
        offset.x = controls.target.x - camera.position.x;
        offset.y = controls.target.y - camera.position.y;
        offset.z = controls.target.z - camera.position.z;

        camera_is_moving = false;
        controls.enabled = true;
      },
    });
    gsap.to(controls.target, {
      duration: 2,
      x: offset.x + new_pos.x,
      z: offset.z + new_pos.z,
    });
  };

  //the following is to make sure that the camera changes position only when the user clicks and not when he is dragging his mouse down
  const mouse_is_moving = () => {
    drag = true;
  };
  window.addEventListener("mousedown", (e) => {
    const gui_UI = document.querySelector(
      ".lil-gui.allow-touch-styles.root.autoPlace"
    );
    if (gui_UI.contains(e.target)) {
      //if the user clicks in lil-gui's UI then don't move that camera !!!
      clicked_in_gui = true;
    } else {
      clicked_in_gui = false;
      drag = false;
      window.addEventListener("mousemove", mouse_is_moving); //as soon as the mouse moves
    }
  });
  window.addEventListener("mouseup", () => {
    window.removeEventListener("mousemove", mouse_is_moving); //to avoid calling the function when the mouse button is up

    if (!drag && !clicked_in_gui) {
      //if user lifts mouse button without moving the mouse
      move_cam();
    }
    drag = false;
    clicked_in_gui = false;
  });
  /**
   * move the camera with mouse END
   */

  /**
   * move cam with keyboard
   */
  const key_is_down = (e) => {
    // console.log(e.keyCode);
    if (e.keyCode === UP_KEY) {
      forward_pressed = true;
    } else if (e.keyCode === DOWN_KEY) {
      back_pressed = true;
    } else if (e.keyCode === LEFT_KEY) {
      left_pressed = true;
    } else if (e.keyCode === RIGHT_KEY) {
      right_pressed = true;
    }
  };
  window.addEventListener("keydown", key_is_down);

  window.addEventListener("keyup", (e) => {
    if (e.keyCode === UP_KEY) {
      forward_pressed = false;
    } else if (e.keyCode === DOWN_KEY) {
      back_pressed = false;
    } else if (e.keyCode === LEFT_KEY) {
      left_pressed = false;
    } else if (e.keyCode === RIGHT_KEY) {
      right_pressed = false;
    }
  });

  /**
   * move camera with keyboard END
   */

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  // debugCube.visible= false;
  gui
    .add(debugCube, "visible")
    .name("Show camera target")
    .onChange(() => {
      console.log(camera.rotation);
    });
}

function onWindowResized() {
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  controls.update();

  if (forward_pressed) {
    camera_local_movement.z = CAMERA_KEYBOARD_SPEED;
  } else if (back_pressed) {
    camera_local_movement.z = -CAMERA_KEYBOARD_SPEED;
    console.log(camera.position);
    console.log(camera_global_movement);
  } else {
    camera_local_movement.z = 0;
  }

  if (left_pressed) {
    camera_local_movement.x = -CAMERA_KEYBOARD_SPEED;
  } else if (right_pressed) {
    camera_local_movement.x = CAMERA_KEYBOARD_SPEED;
  } else {
    camera_local_movement.x = 0;
  }

  camera_global_movement = camera_local_movement.applyQuaternion(
    camera.quaternion
  );

  camera.position.x += camera_global_movement.x;
  controls.target.x += camera_global_movement.x;
  camera.position.z += camera_global_movement.z;
  controls.target.z += camera_global_movement.z;

  debugCube.position.set(
    controls.target.x,
    controls.target.y,
    controls.target.z
  );

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
