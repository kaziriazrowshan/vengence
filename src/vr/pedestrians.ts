import * as THREE from 'three';

export interface PedestrianEntity {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  speed: number;
  direction: 1 | -1;
  zMin: number;
  zMax: number;
  stridePhase: number;
  isWaitingAtCrosswalk: boolean;
  waitingZ: number;
}

export class PedestrianCrowdSystem {
  public group: THREE.Group;
  public pedestrians: PedestrianEntity[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Pedestrian_Crowd';

    this.spawnPedestrians();
  }

  private createPersonMesh(shirtColorHex: number, pantsColorHex: number, isFemale = false): {
    group: THREE.Group;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
  } {
    const person = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x8d5524,
      roughness: 0.8
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColorHex,
      roughness: 0.7
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: pantsColorHex,
      roughness: 0.7
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9
    });

    // Torso (Kurtas / Shirts / Modern Cyber Tops)
    const torsoHeight = isFemale ? 0.58 : 0.64;
    const torsoWidth = isFemale ? 0.38 : 0.44;
    const torsoGeo = new THREE.BoxGeometry(torsoWidth, torsoHeight, 0.24);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.05;
    person.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.52;
    person.add(head);

    // Hair
    const hairGeo = new THREE.SphereGeometry(0.15, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 1.54;
    person.add(hair);

    // Legs (Pivot at hip Y = 0.75)
    const legGeo = new THREE.BoxGeometry(0.13, 0.72, 0.14);
    legGeo.translate(0, -0.36, 0); // Move origin to hip pivot

    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.11, 0.75, 0);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.11, 0.75, 0);

    person.add(leftLeg, rightLeg);

    // Arms (Pivot at shoulder Y = 1.32)
    const armGeo = new THREE.BoxGeometry(0.1, 0.58, 0.1);
    armGeo.translate(0, -0.29, 0); // Move origin to shoulder pivot

    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.set(-torsoWidth / 2 - 0.06, 1.32, 0);

    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.set(torsoWidth / 2 + 0.06, 1.32, 0);

    person.add(leftArm, rightArm);

    return { group: person, leftLeg, rightLeg, leftArm, rightArm };
  }

  private spawnPedestrians() {
    const colors = [
      { shirt: 0xd97706, pants: 0x1e293b }, // Amber Kurta & dark trousers
      { shirt: 0x0284c7, pants: 0xf1f5f9 }, // Kolkata sky blue & cream
      { shirt: 0x16a34a, pants: 0x334155 }, // Emerald green & grey
      { shirt: 0xe11d48, pants: 0x0f172a }, // Crimson red & black
      { shirt: 0x9333ea, pants: 0x475569 }, // Royal violet
      { shirt: 0x0d9488, pants: 0x1e293b }, // Teal cyber jacket
      { shirt: 0xfacc15, pants: 0x0f172a }, // Bright yellow
      { shirt: 0xffffff, pants: 0x334155 }  // Clean white linen
    ];

    // Spawn walking citizens on sidewalks (West sidewalk X = -10 to -12, East sidewalk X = 10 to 12)
    const paths = [
      { x: -11.0, zMin: -70, zMax: 40, dir: 1 },
      { x: -11.8, zMin: -65, zMax: 45, dir: -1 },
      { x: -10.5, zMin: -35, zMax: 15, dir: 1 },
      { x: 11.0, zMin: -75, zMax: 35, dir: -1 },
      { x: 11.8, zMin: -60, zMax: 40, dir: 1 },
      { x: 10.5, zMin: -40, zMax: 20, dir: -1 },
      { x: 12.2, zMin: -25, zMax: 35, dir: 1 },
      { x: -12.4, zMin: -50, zMax: 10, dir: -1 }
    ];

    paths.forEach((p, idx) => {
      const col = colors[idx % colors.length];
      const personData = this.createPersonMesh(col.shirt, col.pants, idx % 2 === 0);

      const zStart = p.zMin + Math.random() * (p.zMax - p.zMin);
      personData.group.position.set(p.x, 0.2, zStart);
      personData.group.rotation.y = p.dir === 1 ? 0 : Math.PI;

      this.group.add(personData.group);

      this.pedestrians.push({
        group: personData.group,
        leftLeg: personData.leftLeg,
        rightLeg: personData.rightLeg,
        leftArm: personData.leftArm,
        rightArm: personData.rightArm,
        speed: 1.4 + Math.random() * 0.7,
        direction: p.dir as 1 | -1,
        zMin: p.zMin,
        zMax: p.zMax,
        stridePhase: Math.random() * Math.PI * 2,
        isWaitingAtCrosswalk: false,
        waitingZ: 4.0
      });
    });

    // Spawn 2 standing citizens at bus stop (East sidewalk X = 11.5, Z = -10)
    const busWaiting = this.createPersonMesh(0x0284c7, 0x1e293b, false);
    busWaiting.group.position.set(11.2, 0.2, -9.5);
    busWaiting.group.rotation.y = -Math.PI / 2;
    this.group.add(busWaiting.group);

    const busWaiting2 = this.createPersonMesh(0xd97706, 0x334155, true);
    busWaiting2.group.position.set(11.8, 0.2, -10.2);
    busWaiting2.group.rotation.y = -Math.PI / 2 + 0.3;
    this.group.add(busWaiting2.group);
  }

  public update(delta: number, nsTrafficGreen: boolean) {
    this.pedestrians.forEach((ped) => {
      // Pedestrian crosswalk waiting behavior:
      // If near intersection (Z near 5 or -42) and vehicular traffic is moving (nsTrafficGreen is true), wait!
      const isNearCrosswalk = Math.abs(ped.group.position.z - 5) < 2.5 || Math.abs(ped.group.position.z - (-42)) < 2.5;

      if (isNearCrosswalk && nsTrafficGreen && Math.random() < 0.05) {
        ped.isWaitingAtCrosswalk = true;
      } else if (!nsTrafficGreen) {
        ped.isWaitingAtCrosswalk = false;
      }

      if (ped.isWaitingAtCrosswalk) {
        // Idle breathing stance
        ped.leftLeg.rotation.x = 0;
        ped.rightLeg.rotation.x = 0;
        ped.leftArm.rotation.x = 0;
        ped.rightArm.rotation.x = 0;
        return;
      }

      // Walking movement
      const step = ped.speed * delta * ped.direction;
      ped.group.position.z += step;

      // Wrap around bounds
      if (ped.group.position.z > ped.zMax) {
        ped.direction = -1;
        ped.group.rotation.y = Math.PI;
      } else if (ped.group.position.z < ped.zMin) {
        ped.direction = 1;
        ped.group.rotation.y = 0;
      }

      // Animate walking stride (legs and arms swing oppositely)
      ped.stridePhase += ped.speed * delta * 5.0;
      const swing = Math.sin(ped.stridePhase) * 0.65;

      ped.leftLeg.rotation.x = swing;
      ped.rightLeg.rotation.x = -swing;
      ped.leftArm.rotation.x = -swing * 0.75;
      ped.rightArm.rotation.x = swing * 0.75;
    });
  }
}
