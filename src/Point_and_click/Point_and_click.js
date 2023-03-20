import * as THREE from "three";
import { gsap } from "gsap";
import { Vector3 } from "three";

const LEFT_KEY = "ArrowLeft";
const RIGHT_KEY = "ArrowRight";
const UP_KEY = "ArrowUp";
const DOWN_KEY = "ArrowDown"; //kamo be za hitadidy dia ataoko anaty const ^^'
const CAMERA_KEYBOARD_SPEED = 0.3;

class Point_and_click {
  constructor(camera, controls, scene, plane) {
    this.camera = camera;
    this.controls = controls;
    this.scene = scene;
    this.plane = plane;

    this.marker = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.intersection = new THREE.Vector3();
    this.camera_travel_duration = 1;
    this.camera_is_moving = false;
    this.mouse_is_dragging = false;
    this.clicked_in_gui = false;

    this.forward_pressed = false;
    this.backwards_pressed = false;
    this.right_pressed = false;
    this.left_pressed = false;
    this.camera_local_movement = new THREE.Vector3(0, 0, 0);
    this.camera_global_movement = new THREE.Vector3(0, 0, 0);
  }

  move_cam = () => {
    this.camera_is_moving = true;
    this.controls.enabled = false;
    // marker.visible= false;
    const offset = {
      //I'll use this to locate the target of the camera
      x: this.controls.target.x - this.camera.position.x,
      y: this.controls.target.y - this.camera.position.y,
      z: this.controls.target.z - this.camera.position.z,
    };

    // console.log("Offset is :");
    // console.log(offset);

    const new_pos = { ...this.marker.position }; //we'll gonna move the camera to this location, we're copying the object because marker.position is going to be constantly changing
    new_pos.y = this.camera.position.y;
    // console.log(new_pos);

    gsap.to(this.camera.position, {
      duration: this.camera_travel_duration,
      x: new_pos.x,
      y: new_pos.y,
      z: new_pos.z,

      onComplete: () => {
        offset.x = this.controls.target.x - this.camera.position.x;
        offset.y = this.controls.target.y - this.camera.position.y;
        offset.z = this.controls.target.z - this.camera.position.z;

        this.camera_is_moving = false;
        this.controls.enabled = true;

        // console.log(this.camera.position);
        // marker.visible= true;
      },
    });
    gsap.to(this.controls.target, {
      duration: this.camera_travel_duration,
      x: offset.x + new_pos.x,
      z: offset.z + new_pos.z,
    });
  };

  detect_click() {
    this.mouse_is_dragging = false; //I'll leave it there just for safety :D

    //the following is to make sure that the camera changes position only when the user clicks and not when he is dragging his mouse down
    const mouse_is_moving = () => {
      this.mouse_is_dragging = true;
    };

    window.addEventListener("mousedown", (e) => {
      const gui_UI = document.querySelector(
        ".lil-gui.allow-touch-styles.root.autoPlace"
      ); //Ilay selecto ity mety mila ovaina fa sao miova ilay class arakaraky ny zavatra..

      if (gui_UI && gui_UI.contains(e.target)) {
        //if the user clicks in lil-gui's UI then don't move that camera !!!
        this.clicked_in_gui = true;
      } else {
        this.clicked_in_gui = false;
        this.mouse_is_dragging = false;
        window.addEventListener("mousemove", mouse_is_moving); //as soon as the mouse moves
      }
    });

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", mouse_is_moving); //to avoid calling the function when the mouse button is up

      if (!this.mouse_is_dragging && !this.clicked_in_gui) {
        //if user lifts mouse button without moving the mouse
        this.move_cam();
      }
      this.mouse_is_dragging = false;
      this.clicked_in_gui = false;
    });
  }

  add_marker() {
    this.scene.add(this.marker);
  }

  update_marker() {
    this.marker.visible = !this.mouse_is_dragging && !this.camera_is_moving;

    /**
     * cast ray
     */
    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.plane) {
      this.raycaster.ray.intersectPlane(this.plane, this.intersection);
      this.marker.position.x = this.intersection.x;
      this.marker.position.z = this.intersection.z;
    }
  }

  track_mouse = () => {
    window.addEventListener("pointermove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  };

  listen_to_keyboard() {
    const key_is_down = (e) => {
      // console.log(e.keyCode);
      if (e.code === UP_KEY) {
        this.forward_pressed = true;
      }
      if (e.code === DOWN_KEY) {
        this.back_pressed = true;
      }
      if (e.code === LEFT_KEY) {
        this.left_pressed = true;
      }
      if (e.code === RIGHT_KEY) {
        this.right_pressed = true;
      }
    };
    window.addEventListener("keydown", key_is_down);

    window.addEventListener("keyup", (e) => {
      if (e.code === UP_KEY) {
        this.forward_pressed = false;
      }
      if (e.code === DOWN_KEY) {
        this.back_pressed = false;
      }
      if (e.code === LEFT_KEY) {
        this.left_pressed = false;
      }
      if (e.code === RIGHT_KEY) {
        this.right_pressed = false;
      }
    });
  }

  handle_camera_keyboard = () => {
    if (this.back_pressed) {
      this.camera_local_movement.z = CAMERA_KEYBOARD_SPEED;
    } else if (this.forward_pressed) {
      this.camera_local_movement.z = -CAMERA_KEYBOARD_SPEED;
    } else {
      this.camera_local_movement.z = 0;
    }

    if (this.left_pressed) {
      this.camera_local_movement.x = -CAMERA_KEYBOARD_SPEED;
    } else if (this.right_pressed) {
      this.camera_local_movement.x = CAMERA_KEYBOARD_SPEED;
    } else {
      this.camera_local_movement.x = 0;
    }

    // this.camera_global_movement = this.camera_local_movement.applyQuaternion(
    //   this.camera.quaternion
    // );
    // this.camera_global_movement.set(this.camera_local_movement);
    this.camera_global_movement.x= this.camera_local_movement.x;
    this.camera_global_movement.y= this.camera_local_movement.y;
    this.camera_global_movement.z= this.camera_local_movement.z;
    this.camera_global_movement.applyAxisAngle(new Vector3(0, 1, 0), this.camera.rotation.y);

    this.camera.position.z += this.camera_global_movement.z;
    this.controls.target.z += this.camera_global_movement.z;

    this.camera.position.x += this.camera_global_movement.x;
    this.controls.target.x += this.camera_global_movement.x;
  };

  ato_daholo_ilay_zavatra() {
    this.add_marker();
    this.track_mouse();
    this.detect_click();
    this.listen_to_keyboard();
  }

  update_everything(){
    this.update_marker();
    this.handle_camera_keyboard();
  }
}

export default Point_and_click;
