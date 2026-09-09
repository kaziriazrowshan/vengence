import * as THREE from 'three';
import { InteractiveHologram } from './hologram';
import { audioEngine } from './audio';

export interface LocomotionOptions {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  userRig: THREE.Group;
  interactives: InteractiveHologram[];
}

export class LocomotionManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private userRig: THREE.Group;
  private interactives: InteractiveHologram[];

  // Controllers
  public controller1: THREE.XRTargetRaySpace | null = null;
  public controller2: THREE.XRTargetRaySpace | null = null;
  public controllerGrip1: THREE.XRGripSpace | null = null;
  public controllerGrip2: THREE.XRGripSpace | null = null;

  // Visual Rays
  private ray1: THREE.Line | null = null;
  private ray2: THREE.Line | null = null;

  // Teleportation
  private teleportMarker: THREE.Mesh;
  private teleportTarget: THREE.Vector3 | null = null;
  private isTeleportActive: boolean = false;

  // Hover state
  private currentHovered: InteractiveHologram | null = null;

  // Desktop Controls
  private keysPressed: Record<string, boolean> = {};
  private isMouseDown: boolean = false;
  private mousePrevX: number = 0;
  private mousePrevY: number = 0;
  private cameraPitch: number = 0;
  private cameraYaw: number = 0;

  // Smooth walk / Snap turn state for VR
  private lastSnapTurnTime: number = 0;

  // Ground plane for teleport raycasting
  private floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private raycaster = new THREE.Raycaster();

  constructor(opts: LocomotionOptions) {
    this.scene = opts.scene;
    this.camera = opts.camera;
    this.renderer = opts.renderer;
    this.userRig = opts.userRig;
    this.interactives = opts.interactives;

    // Create Teleport Reticle
    const markerGeo = new THREE.RingGeometry(0.5, 0.75, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.teleportMarker = new THREE.Mesh(markerGeo, markerMat);
    this.teleportMarker.rotation.x = -Math.PI / 2;
    this.teleportMarker.visible = false;
    this.scene.add(this.teleportMarker);

    this.setupControllers();
    this.setupDesktopInputs();
  }

  private setupControllers() {
    // Controller 0 (Right)
    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', () => this.onSelectStart(this.controller1!));
    this.controller1.addEventListener('selectend', () => this.onSelectEnd(this.controller1!));
    this.controller1.addEventListener('squeezestart', () => this.startTeleport(this.controller1!));
    this.controller1.addEventListener('squeezeend', () => this.executeTeleport());
    this.userRig.add(this.controller1);

    // Controller 1 (Left)
    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', () => this.onSelectStart(this.controller2!));
    this.controller2.addEventListener('selectend', () => this.onSelectEnd(this.controller2!));
    this.controller2.addEventListener('squeezestart', () => this.startTeleport(this.controller2!));
    this.controller2.addEventListener('squeezeend', () => this.executeTeleport());
    this.userRig.add(this.controller2);

    // Visual Laser Beams
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });

    this.ray1 = new THREE.Line(laserGeo.clone(), laserMat);
    this.ray1.name = 'controller1_ray';
    this.controller1.add(this.ray1);

    this.ray2 = new THREE.Line(laserGeo.clone(), laserMat);
    this.ray2.name = 'controller2_ray';
    this.controller2.add(this.ray2);

    // Controller visual grips
    const gripGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.15, 8);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x223344, metalness: 0.8 });
    const c1Mesh = new THREE.Mesh(gripGeo, gripMat);
    c1Mesh.rotation.x = Math.PI / 4;
    this.controller1.add(c1Mesh);

    const c2Mesh = new THREE.Mesh(gripGeo, gripMat);
    c2Mesh.rotation.x = Math.PI / 4;
    this.controller2.add(c2Mesh);
  }

  private onSelectStart(controller: THREE.XRTargetRaySpace) {
    audioEngine.init();

    // Check if pointing at an interactive hologram
    const hit = this.raycastInteractives(controller);
    if (hit) {
      if (hit.onSelect) {
        hit.onSelect();
      }
      return;
    }

    // Otherwise initiate teleport on trigger if not already active
    this.startTeleport(controller);
  }

  private onSelectEnd(controller: THREE.XRTargetRaySpace) {
    if (this.isTeleportActive) {
      this.executeTeleport();
    }
  }

  private startTeleport(controller: THREE.XRTargetRaySpace) {
    this.isTeleportActive = true;
    this.teleportMarker.visible = true;
  }

  private executeTeleport() {
    if (this.isTeleportActive && this.teleportTarget) {
      // Teleport rig position to target
      this.userRig.position.x = this.teleportTarget.x;
      this.userRig.position.z = this.teleportTarget.z;
      // Preserve current height or adapt to platform
      audioEngine.playTeleportSound();
    }
    this.isTeleportActive = false;
    this.teleportMarker.visible = false;
    this.teleportTarget = null;
  }

  private raycastInteractives(source: THREE.Object3D): InteractiveHologram | null {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(source.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(source.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).normalize();

    const meshes = this.interactives.map((i) => i.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const found = this.interactives.find((i) => i.mesh === hitMesh || i.mesh.children.includes(hitMesh));
      return found || null;
    }
    return null;
  }

  private setupDesktopInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.code] = false;
    });

    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      if (this.renderer.xr.isPresenting) return;
      audioEngine.init();
      this.isMouseDown = true;
      this.mousePrevX = e.clientX;
      this.mousePrevY = e.clientY;

      // Mouse raycast click
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      this.raycaster.setFromCamera(mouse, this.camera);
      const meshes = this.interactives.map((i) => i.mesh);
      const intersects = this.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hit = this.interactives.find(
          (i) => i.mesh === intersects[0].object || i.mesh.children.includes(intersects[0].object)
        );
        if (hit && hit.onSelect) {
          hit.onSelect();
        }
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.renderer.xr.isPresenting) return;

      if (this.isMouseDown) {
        const deltaX = e.clientX - this.mousePrevX;
        const deltaY = e.clientY - this.mousePrevY;
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;

        this.cameraYaw -= deltaX * 0.003;
        this.cameraPitch -= deltaY * 0.003;
        this.cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.cameraPitch));

        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.cameraYaw;
        this.camera.rotation.x = this.cameraPitch;
      }

      // Mouse Hover check for interactive holograms
      const rect = dom.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(mouse, this.camera);
      const meshes = this.interactives.map((i) => i.mesh);
      const intersects = this.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const found = this.interactives.find(
          (i) => i.mesh === intersects[0].object || i.mesh.children.includes(intersects[0].object)
        );
        if (found && found !== this.currentHovered) {
          if (this.currentHovered && this.currentHovered.onHover) {
            this.currentHovered.onHover(false);
          }
          this.currentHovered = found;
          if (found.onHover) found.onHover(true);
        }
      } else if (this.currentHovered) {
        if (this.currentHovered.onHover) {
          this.currentHovered.onHover(false);
        }
        this.currentHovered = null;
      }
    });
  }

  // Update loop for VR controllers and Desktop navigation
  public update(delta: number, elapsed: number) {
    if (this.renderer.xr.isPresenting) {
      this.updateVR(delta, elapsed);
    } else {
      this.updateDesktop(delta);
    }
  }

  private updateVR(delta: number, elapsed: number) {
    const session = this.renderer.xr.getSession();
    if (!session) return;

    // Check VR controller rays and teleport targeting
    const activeController = this.controller1 || this.controller2;
    if (activeController) {
      // 1. Hover check
      const hovered = this.raycastInteractives(activeController);
      if (hovered !== this.currentHovered) {
        if (this.currentHovered && this.currentHovered.onHover) {
          this.currentHovered.onHover(false);
        }
        this.currentHovered = hovered;
        if (hovered && hovered.onHover) {
          hovered.onHover(true);
        }
      }

      // 2. Teleport Ground Raycast
      if (this.isTeleportActive) {
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(activeController.matrixWorld);

        this.raycaster.ray.origin.setFromMatrixPosition(activeController.matrixWorld);
        this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).normalize();

        const hitPoint = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(this.floorPlane, hitPoint)) {
          // Limit teleport distance to 35 meters
          const dist = this.userRig.position.distanceTo(hitPoint);
          if (dist < 35) {
            this.teleportTarget = hitPoint;
            this.teleportMarker.position.copy(hitPoint);
            this.teleportMarker.position.y += 0.05;
            this.teleportMarker.rotation.z = elapsed * 3.0;
            this.teleportMarker.visible = true;
          } else {
            this.teleportMarker.visible = false;
          }
        }
      }
    }

    // 3. Gamepad Thumbstick Locomotion & Snap Turn
    const inputSources = session.inputSources;
    for (let i = 0; i < inputSources.length; i++) {
      const source = inputSources[i];
      if (source.gamepad && source.gamepad.axes) {
        const axes = source.gamepad.axes;
        // axes[2] is X (thumbstick), axes[3] is Y
        const stickX = axes.length >= 4 ? axes[2] : axes[0];
        const stickY = axes.length >= 4 ? axes[3] : axes[1];

        // Smooth locomotion forward/backward
        if (Math.abs(stickY) > 0.15) {
          const moveSpeed = 4.5 * delta;
          const forward = new THREE.Vector3();
          this.camera.getWorldDirection(forward);
          forward.y = 0;
          forward.normalize();
          this.userRig.position.addScaledVector(forward, -stickY * moveSpeed);
        }

        // Snap Turn (30 degrees step with debounce)
        const now = performance.now();
        if (Math.abs(stickX) > 0.65 && now - this.lastSnapTurnTime > 300) {
          const turnAngle = stickX > 0 ? -Math.PI / 6 : Math.PI / 6;
          this.userRig.rotation.y += turnAngle;
          this.lastSnapTurnTime = now;
        }
      }
    }
  }

  private updateDesktop(delta: number) {
    const moveSpeed = 8.0 * delta;
    const moveVec = new THREE.Vector3();

    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) {
      moveVec.z -= 1;
    }
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) {
      moveVec.z += 1;
    }
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) {
      moveVec.x -= 1;
    }
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) {
      moveVec.x += 1;
    }

    if (moveVec.lengthSq() > 0) {
      moveVec.normalize();
      // Rotate by camera yaw
      moveVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.cameraYaw);
      this.userRig.position.addScaledVector(moveVec, moveSpeed);
    }
  }

  public setRigPosition(pos: [number, number, number], lookAt: [number, number, number]) {
    this.userRig.position.set(pos[0], pos[1], pos[2]);
    this.userRig.updateMatrixWorld(true);
    const target = new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]);

    // Synchronize yaw/pitch for desktop
    const dir = new THREE.Vector3().subVectors(target, this.userRig.position).normalize();
    this.cameraYaw = Math.atan2(-dir.x, -dir.z);
    this.cameraPitch = Math.asin(dir.y);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.cameraYaw;
    this.camera.rotation.x = this.cameraPitch;
  }

  public registerInteractive(hologram: InteractiveHologram) {
    if (!this.interactives.includes(hologram)) {
      this.interactives.push(hologram);
    }
  }
}
