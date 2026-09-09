import * as THREE from 'three';
import { VehicleEntity } from './vehicles';

export type SignalState = 'green' | 'yellow' | 'red';

export interface TrafficLightUnit {
  group: THREE.Group;
  redMesh: THREE.Mesh;
  yellowMesh: THREE.Mesh;
  greenMesh: THREE.Mesh;
  pedWalkMesh?: THREE.Mesh;
  pedWaitMesh?: THREE.Mesh;
  direction: 'north-south' | 'east-west';
  stopZ: number;
}

export class TrafficLightSystem {
  public group: THREE.Group;
  public lights: TrafficLightUnit[] = [];
  public nsState: SignalState = 'green';
  public ewState: SignalState = 'red';
  private timer: number = 0;

  // Signal cycle timings (seconds)
  private readonly GREEN_TIME = 14;
  private readonly YELLOW_TIME = 3.5;
  private readonly RED_TIME = 15;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'TrafficLight_System';

    this.buildIntersections();
  }

  // Create realistic highway gantry traffic signal post
  private createTrafficSignalPost(
    x: number,
    z: number,
    gantryArmLength: number,
    armDirection: 1 | -1,
    facingRotationY: number,
    dir: 'north-south' | 'east-west',
    stopZ: number
  ): TrafficLightUnit {
    const postGroup = new THREE.Group();
    postGroup.position.set(x, 0, z);
    postGroup.rotation.y = facingRotationY;

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1a212d,
      metalness: 0.85,
      roughness: 0.25
    });

    const housingMat = new THREE.MeshStandardMaterial({
      color: 0x0a0e14,
      roughness: 0.5,
      metalness: 0.3
    });

    // Vertical Support Mast (height 7.2m)
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 7.2, 8), metalMat);
    mast.position.y = 3.6;
    postGroup.add(mast);

    // Flanged base with anchor bolts
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.3, 8), metalMat);
    base.position.y = 0.15;
    postGroup.add(base);

    // Horizontal Overhead Gantry Arm spanning the lanes
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(gantryArmLength, 0.2, 0.2),
      metalMat
    );
    arm.position.set((gantryArmLength / 2) * armDirection, 6.8, 0);
    postGroup.add(arm);

    // Diagonal support gusset brace
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), metalMat);
    brace.rotation.z = (Math.PI / 4) * -armDirection;
    brace.position.set(0.65 * armDirection, 6.1, 0);
    postGroup.add(brace);

    // (A) Overhead Center Traffic Light Head
    const headGroup = new THREE.Group();
    headGroup.position.set(2.8 * armDirection, 6.1, 0.2);

    // Black housing backplate with yellow/black hazard safety border
    const headBacking = new THREE.Mesh(new THREE.BoxGeometry(0.85, 2.2, 0.35), housingMat);
    headGroup.add(headBacking);

    // Visors & Lenses (Red, Yellow, Green)
    const lensRadius = 0.2;
    const lensDepth = 0.08;

    // Materials
    const redMat = new THREE.MeshStandardMaterial({
      color: 0x330005,
      emissive: 0x000000,
      roughness: 0.2
    });
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0x332200,
      emissive: 0x000000,
      roughness: 0.2
    });
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x003311,
      emissive: 0x00ff66,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });

    const lensY = [0.65, 0, -0.65];

    // Red lens
    const redMesh = new THREE.Mesh(new THREE.CylinderGeometry(lensRadius, lensRadius, lensDepth, 16), redMat);
    redMesh.rotation.x = Math.PI / 2;
    redMesh.position.set(0, lensY[0], 0.18);

    // Red sun hood visor
    const visorGeo = new THREE.CylinderGeometry(lensRadius + 0.04, lensRadius + 0.04, 0.22, 12, 1, true, 0, Math.PI);
    const visorR = new THREE.Mesh(visorGeo, housingMat);
    visorR.rotation.x = Math.PI / 2;
    visorR.position.set(0, lensY[0] + 0.05, 0.26);
    headGroup.add(redMesh, visorR);

    // Yellow lens
    const yellowMesh = new THREE.Mesh(new THREE.CylinderGeometry(lensRadius, lensRadius, lensDepth, 16), yellowMat);
    yellowMesh.rotation.x = Math.PI / 2;
    yellowMesh.position.set(0, lensY[1], 0.18);
    const visorY = new THREE.Mesh(visorGeo, housingMat);
    visorY.rotation.x = Math.PI / 2;
    visorY.position.set(0, lensY[1] + 0.05, 0.26);
    headGroup.add(yellowMesh, visorY);

    // Green lens
    const greenMesh = new THREE.Mesh(new THREE.CylinderGeometry(lensRadius, lensRadius, lensDepth, 16), greenMat);
    greenMesh.rotation.x = Math.PI / 2;
    greenMesh.position.set(0, lensY[2], 0.18);
    const visorG = new THREE.Mesh(visorGeo, housingMat);
    visorG.rotation.x = Math.PI / 2;
    visorG.position.set(0, lensY[2] + 0.05, 0.26);
    headGroup.add(greenMesh, visorG);

    postGroup.add(headGroup);

    // (B) Pedestrian Signal Box at eye level on the mast (Y = 2.4)
    const pedBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.8, 0.25), housingMat);
    pedBox.position.set(0, 2.4, 0.2);

    const pedWalkMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x00ff66 })
    );
    pedWalkMesh.position.set(0, 2.58, 0.33);

    const pedWaitMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x330005 })
    );
    pedWaitMesh.position.set(0, 2.22, 0.33);

    postGroup.add(pedBox, pedWalkMesh, pedWaitMesh);

    this.group.add(postGroup);

    const unit: TrafficLightUnit = {
      group: postGroup,
      redMesh,
      yellowMesh,
      greenMesh,
      pedWalkMesh,
      pedWaitMesh,
      direction: dir,
      stopZ
    };

    this.lights.push(unit);
    return unit;
  }

  // Set up intersections along Smart Boulevard
  private buildIntersections() {
    // 1. Intersection 1: Central Promenade Crossing (Z = 5)
    // Northbound traffic light (Facing South towards approaching traffic)
    this.createTrafficSignalPost(9.5, 6, 6.5, -1, 0, 'north-south', 8);

    // Southbound traffic light (Facing North towards approaching traffic)
    this.createTrafficSignalPost(-9.5, 4, 6.5, 1, Math.PI, 'north-south', 2);

    // 2. Intersection 2: Mid-Boulevard Tech Crossroad (Z = -42)
    this.createTrafficSignalPost(9.5, -40, 6.5, -1, 0, 'north-south', -38);
    this.createTrafficSignalPost(-9.5, -44, 6.5, 1, Math.PI, 'north-south', -46);
  }

  // Update light cycles and mesh materials
  public update(delta: number) {
    this.timer += delta;

    const cycleDuration = this.GREEN_TIME + this.YELLOW_TIME + this.RED_TIME;
    const currentPhase = this.timer % cycleDuration;

    let newNSState: SignalState = 'green';
    let newEWState: SignalState = 'red';

    if (currentPhase < this.GREEN_TIME) {
      newNSState = 'green';
      newEWState = 'red';
    } else if (currentPhase < this.GREEN_TIME + this.YELLOW_TIME) {
      newNSState = 'yellow';
      newEWState = 'red';
    } else {
      newNSState = 'red';
      newEWState = 'green';
    }

    this.nsState = newNSState;
    this.ewState = newEWState;

    // Apply glowing states to light lenses
    this.lights.forEach((light) => {
      const state = light.direction === 'north-south' ? this.nsState : this.ewState;
      const rMat = light.redMesh.material as THREE.MeshStandardMaterial;
      const yMat = light.yellowMesh.material as THREE.MeshStandardMaterial;
      const gMat = light.greenMesh.material as THREE.MeshStandardMaterial;

      if (state === 'green') {
        rMat.emissive.setHex(0x000000);
        yMat.emissive.setHex(0x000000);
        gMat.emissive.setHex(0x00ff66);
        gMat.emissiveIntensity = 2.0;

        if (light.pedWalkMesh) {
          (light.pedWalkMesh.material as THREE.MeshBasicMaterial).color.setHex(0x330005);
        }
        if (light.pedWaitMesh) {
          (light.pedWaitMesh.material as THREE.MeshBasicMaterial).color.setHex(0xff1122);
        }
      } else if (state === 'yellow') {
        rMat.emissive.setHex(0x000000);
        yMat.emissive.setHex(0xffbb00);
        yMat.emissiveIntensity = 2.0;
        gMat.emissive.setHex(0x000000);
      } else {
        // Red
        rMat.emissive.setHex(0xff0022);
        rMat.emissiveIntensity = 2.2;
        yMat.emissive.setHex(0x000000);
        gMat.emissive.setHex(0x000000);

        if (light.pedWalkMesh) {
          (light.pedWalkMesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff88);
        }
        if (light.pedWaitMesh) {
          (light.pedWaitMesh.material as THREE.MeshBasicMaterial).color.setHex(0x220000);
        }
      }
    });
  }

  // Check if a vehicle approaching an intersection should stop
  public shouldVehicleStop(zPos: number, direction: 1 | -1): boolean {
    if (this.nsState === 'green') return false;

    // Check stop lines for northbound (direction === 1) or southbound (direction === -1)
    for (const light of this.lights) {
      if (light.direction !== 'north-south') continue;

      const distToStop = (light.stopZ - zPos) * direction;
      // If within stopping zone (between 1.5m and 16m ahead of the stop line)
      if (distToStop > 1.2 && distToStop < 16.0) {
        return true;
      }
    }
    return false;
  }
}
