import * as THREE from 'three';
import { Vehicle } from '../types';
import howrahPhoto from '../assets/images/howrah_bridge_2050_1788943932870.jpg';
import skymetroPhoto from '../assets/images/kolkata_skymetro_2050_1788943946427.jpg';
import spongeCityPhoto from '../assets/images/hooghly_sponge_city_1788943963962.jpg';
import forestTowersPhoto from '../assets/images/vertical_forest_towers_1788943979447.jpg';
import {
  VehicleEntity,
  createAmbassadorTaxi,
  createCityBus,
  createElectricSedan,
  createSkylineMonorail,
  createHeritageTram2050
} from './vehicles';
import { TrafficLightSystem } from './trafficSystem';
import { buildStreetRealismDetails } from './streetDetails';
import { PedestrianCrowdSystem } from './pedestrians';

export interface CityEnvironment {
  group: THREE.Group;
  buildings: THREE.Mesh[];
  vehicles: VehicleEntity[];
  trafficLights: TrafficLightSystem;
  pedestrians: PedestrianCrowdSystem;
  turbines: { rotor: THREE.Object3D; speed: number }[];
  floodWaterMesh: THREE.Mesh;
  riverMesh: THREE.Mesh;
  floodBarriers: THREE.Object3D[];
  energyLines: { points: THREE.Vector3[]; line: THREE.Line; progress: number }[];
  update: (delta: number, elapsed: number, waterTarget: number) => void;
}

// Procedural texture generator for futuristic building windows
function createBuildingTexture(colorHex = '#1a2942', windowHex = '#66d9ef'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 128, 256);

  // Draw grid of futuristic illuminated windows
  ctx.fillStyle = windowHex;
  for (let y = 8; y < 250; y += 16) {
    for (let x = 6; x < 122; x += 14) {
      if (Math.random() > 0.35) {
        ctx.globalAlpha = 0.4 + Math.random() * 0.6;
        ctx.fillRect(x, y, 9, 8);
      }
    }
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Bengali futuristic holographic text texture
function createHolographicSignTexture(bengaliText: string, englishText: string, color = '#00f0ff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Background subtle glass
  ctx.fillStyle = 'rgba(6, 20, 36, 0.75)';
  ctx.fillRect(0, 0, 512, 160);

  // Border glow
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 148);

  // Bengali text
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bengaliText, 256, 55);

  // English subtitle
  ctx.font = '600 20px "Rajdhani", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(englishText, 256, 110);

  // Corner tech markers
  ctx.fillStyle = color;
  ctx.fillRect(10, 10, 16, 4);
  ctx.fillRect(10, 10, 4, 16);
  ctx.fillRect(486, 10, 16, 4);
  ctx.fillRect(498, 10, 4, 16);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function buildKolkata2050City(): CityEnvironment {
  const cityGroup = new THREE.Group();
  cityGroup.name = 'Kolkata2050_Environment';

  const buildings: THREE.Mesh[] = [];
  const vehicles: VehicleEntity[] = [];
  const turbines: { rotor: THREE.Object3D; speed: number }[] = [];
  const floodBarriers: THREE.Object3D[] = [];
  const energyLines: { points: THREE.Vector3[]; line: THREE.Line; progress: number }[] = [];

  // Common materials
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x111822,
    roughness: 0.7,
    metalness: 0.1
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x223042,
    roughness: 0.6,
    metalness: 0.15
  });

  const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const neonAmberMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const neonGreenMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

  // 1. GROUND & BOULEVARD INFRASTRUCTURE
  // Main Ground Plane
  const groundGeo = new THREE.PlaneGeometry(500, 500);
  const groundMesh = new THREE.Mesh(groundGeo, asphaltMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = 0;
  groundMesh.receiveShadow = true;
  cityGroup.add(groundMesh);

  // Main Central Smart Boulevard (Z from +60 to -90)
  const roadWidth = 18;
  const roadLength = 160;
  const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x0c121b,
    roughness: 0.5,
    metalness: 0.2
  });
  const mainRoad = new THREE.Mesh(roadGeo, roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.02, -15);
  cityGroup.add(mainRoad);

  // Induction magnetic tracks in street for autonomous trams & pods
  const trackGeo = new THREE.BoxGeometry(0.3, 0.05, roadLength);
  const leftTrack = new THREE.Mesh(trackGeo, neonCyanMat);
  leftTrack.position.set(-2.5, 0.03, -15);
  const rightTrack = new THREE.Mesh(trackGeo, neonCyanMat);
  rightTrack.position.set(2.5, 0.03, -15);
  cityGroup.add(leftTrack, rightTrack);

  // Sidewalks & Pedestrian promenades
  const walkGeo = new THREE.BoxGeometry(7, 0.2, roadLength);
  const leftWalk = new THREE.Mesh(walkGeo, sidewalkMat);
  leftWalk.position.set(-13, 0.1, -15);
  const rightWalk = new THREE.Mesh(walkGeo, sidewalkMat);
  rightWalk.position.set(13, 0.1, -15);
  cityGroup.add(leftWalk, rightWalk);

  // Tactile paving & glowing pathway lines
  const tactileGeo = new THREE.BoxGeometry(0.4, 0.22, roadLength);
  const tactileLeft = new THREE.Mesh(tactileGeo, neonGreenMat);
  tactileLeft.position.set(-11, 0.11, -15);
  const tactileRight = new THREE.Mesh(tactileGeo, neonGreenMat);
  tactileRight.position.set(11, 0.11, -15);
  cityGroup.add(tactileLeft, tactileRight);

  // 2. HOOGHLY RIVER (at Z = -120 to -170)
  const riverGeo = new THREE.PlaneGeometry(500, 60, 32, 32);
  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x072b42,
    roughness: 0.15,
    metalness: 0.85,
    transparent: true,
    opacity: 0.92
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.rotation.x = -Math.PI / 2;
  riverMesh.position.set(0, -0.6, -145);
  cityGroup.add(riverMesh);

  // River Embankment walls with green bioswales
  const bankGeo = new THREE.BoxGeometry(500, 3, 2);
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x1f2b38, roughness: 0.8 });
  const southBank = new THREE.Mesh(bankGeo, bankMat);
  southBank.position.set(0, 0.5, -114);
  const northBank = new THREE.Mesh(bankGeo, bankMat);
  northBank.position.set(0, 0.5, -176);
  cityGroup.add(southBank, northBank);

  // 3. FLOODING & STORM WATER MESH (Responsive to scenario)
  const floodGeo = new THREE.PlaneGeometry(160, 160);
  const floodMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a4d,
    roughness: 0.05,
    metalness: 0.9,
    transparent: true,
    opacity: 0.75
  });
  const floodWaterMesh = new THREE.Mesh(floodGeo, floodMat);
  floodWaterMesh.rotation.x = -Math.PI / 2;
  floodWaterMesh.position.set(0, -0.2, -15); // hidden by default below road
  cityGroup.add(floodWaterMesh);

  // Automated Deployable Flood Barriers
  const barrierMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    metalness: 0.7,
    roughness: 0.3
  });
  for (let z = -60; z <= 30; z += 18) {
    const barrierLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 5), barrierMat);
    barrierLeft.position.set(-9.5, -0.5, z);
    const barrierRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 5), barrierMat);
    barrierRight.position.set(9.5, -0.5, z);
    cityGroup.add(barrierLeft, barrierRight);
    floodBarriers.push(barrierLeft, barrierRight);
  }

  // 4. ICONIC HOWRAH BRIDGE 2050 (Cantilever futuristic reimagining over Hooghly River)
  const howrahGroup = new THREE.Group();
  howrahGroup.position.set(0, 0, -145);

  // Steel cantilever towers (East and West bank towers)
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x2c3b4d,
    roughness: 0.3,
    metalness: 0.8
  });
  const trussMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true });

  [-55, 55].forEach((xPos) => {
    // Main vertical pylons (72m high)
    const pylonGeo = new THREE.BoxGeometry(5, 75, 5);
    const pylon = new THREE.Mesh(pylonGeo, towerMat);
    pylon.position.set(xPos, 37.5, 0);
    howrahGroup.add(pylon);

    // Cantilever truss superstructure
    const trussGeo = new THREE.BoxGeometry(8, 40, 30);
    const truss = new THREE.Mesh(trussGeo, trussMat);
    truss.position.set(xPos, 45, 0);
    howrahGroup.add(truss);

    // Glowing fin pinnacle
    const fin = new THREE.Mesh(new THREE.ConeGeometry(2, 12, 4), neonCyanMat);
    fin.position.set(xPos, 80, 0);
    howrahGroup.add(fin);
  });

  // Cross-strut top beam spanning towers
  const crossBeamGeo = new THREE.BoxGeometry(116, 4, 4);
  const crossBeam = new THREE.Mesh(crossBeamGeo, towerMat);
  crossBeam.position.set(0, 72, 0);
  howrahGroup.add(crossBeam);

  // Road deck across the Hooghly
  const deckGeo = new THREE.BoxGeometry(22, 2.5, 70);
  const deckMat = new THREE.MeshStandardMaterial({ color: 0x182230, metalness: 0.5 });
  const deck = new THREE.Mesh(deckGeo, deckMat);
  deck.position.set(0, 14, 0);
  howrahGroup.add(deck);

  // Glowing suspended stay-cables (procedural diagonal stays)
  const cableMat = new THREE.MeshBasicMaterial({ color: 0x33e1ff });
  for (let i = -40; i <= 40; i += 10) {
    const cableGeo = new THREE.CylinderGeometry(0.12, 0.12, 60);
    const cableL = new THREE.Mesh(cableGeo, cableMat);
    cableL.position.set(-25, 42, i * 0.4);
    cableL.rotation.z = 0.5;
    const cableR = new THREE.Mesh(cableGeo, cableMat);
    cableR.position.set(25, 42, i * 0.4);
    cableR.rotation.z = -0.5;
    howrahGroup.add(cableL, cableR);
  }

  // Bengali holographic bridge emblem
  const bridgeSignTex = createHolographicSignTexture('হাওড়া সেতু ২০৫০', 'HOWRAH SMART BRIDGE 2.0', '#00f3ff');
  const bridgeSignMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 5),
    new THREE.MeshBasicMaterial({ map: bridgeSignTex, transparent: true, side: THREE.DoubleSide })
  );
  bridgeSignMesh.position.set(0, 26, 32);
  howrahGroup.add(bridgeSignMesh);

  cityGroup.add(howrahGroup);

  // 5. ELEVATED SKY-METRO (Runs overhead along east side at X = -22, Y = 16)
  const metroTrackGroup = new THREE.Group();
  const trackSpan = 220;
  const metroTrack = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, trackSpan),
    new THREE.MeshStandardMaterial({ color: 0x1f2e42, metalness: 0.7, roughness: 0.3 })
  );
  metroTrack.position.set(-22, 16, -20);
  metroTrackGroup.add(metroTrack);

  // Glowing magnetic guide ribbons
  const metroRibbon = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, trackSpan),
    new THREE.MeshBasicMaterial({ color: 0x00ffcc })
  );
  metroRibbon.position.set(-22, 16.8, -20);
  metroTrackGroup.add(metroRibbon);

  // Pylons supporting the sky-metro
  for (let z = -120; z <= 80; z += 28) {
    const pylon = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.6, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0x223348, metalness: 0.4 })
    );
    pylon.position.set(-22, 8, z);
    metroTrackGroup.add(pylon);
  }
  cityGroup.add(metroTrackGroup);

  // 6. FUTURISTIC SKYSCRAPERS & VERTICAL FORESTS (Procedural Megastructures)
  const bldgTex1 = createBuildingTexture('#101826', '#00d4ff');
  const bldgTex2 = createBuildingTexture('#131e30', '#ffaa33');
  const bldgTex3 = createBuildingTexture('#0c1b24', '#00ff88');

  interface BuildingSpec {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    tex: THREE.CanvasTexture;
    type: 'tower' | 'green' | 'energy' | 'stepped';
  }

  const buildingSpecs: BuildingSpec[] = [
    // West Avenue Towers
    { x: -38, z: 20, width: 22, depth: 24, height: 110, tex: bldgTex1, type: 'tower' },
    { x: -42, z: -25, width: 26, depth: 26, height: 160, tex: bldgTex2, type: 'stepped' },
    { x: -36, z: -68, width: 22, depth: 22, height: 135, tex: bldgTex1, type: 'energy' },
    { x: -44, z: -105, width: 28, depth: 24, height: 180, tex: bldgTex3, type: 'tower' },

    // East Avenue Towers (Green District & Biophilic Towers)
    { x: 38, z: 25, width: 22, depth: 22, height: 120, tex: bldgTex3, type: 'green' },
    { x: 44, z: -20, width: 24, depth: 28, height: 175, tex: bldgTex3, type: 'green' },
    { x: 36, z: -65, width: 26, depth: 22, height: 140, tex: bldgTex1, type: 'stepped' },
    { x: 42, z: -105, width: 28, depth: 28, height: 210, tex: bldgTex2, type: 'tower' },

    // Distant Background Skylines (Kolkata Horizon 2050)
    { x: -85, z: 40, width: 34, depth: 32, height: 220, tex: bldgTex1, type: 'tower' },
    { x: -95, z: -30, width: 38, depth: 36, height: 260, tex: bldgTex2, type: 'tower' },
    { x: -80, z: -95, width: 32, depth: 30, height: 200, tex: bldgTex3, type: 'tower' },

    { x: 85, z: 45, width: 35, depth: 35, height: 230, tex: bldgTex3, type: 'green' },
    { x: 95, z: -25, width: 40, depth: 38, height: 270, tex: bldgTex1, type: 'tower' },
    { x: 80, z: -90, width: 32, depth: 30, height: 210, tex: bldgTex2, type: 'tower' },

    // Across the River (Howrah & Foreshore Cyber District)
    { x: -50, z: -190, width: 35, depth: 35, height: 190, tex: bldgTex1, type: 'tower' },
    { x: 0, z: -205, width: 42, depth: 40, height: 240, tex: bldgTex2, type: 'stepped' },
    { x: 50, z: -190, width: 36, depth: 35, height: 200, tex: bldgTex3, type: 'green' }
  ];

  buildingSpecs.forEach((spec) => {
    const geo = new THREE.BoxGeometry(spec.width, spec.height, spec.depth);
    const mat = new THREE.MeshStandardMaterial({
      map: spec.tex,
      roughness: 0.35,
      metalness: 0.6
    });
    const bldg = new THREE.Mesh(geo, mat);
    bldg.position.set(spec.x, spec.height / 2, spec.z);
    cityGroup.add(bldg);
    buildings.push(bldg);

    // Glowing vertical architectural ribs on skyscrapers
    const ribGeo = new THREE.BoxGeometry(0.5, spec.height, 0.5);
    const ribMat = spec.type === 'green' ? neonGreenMat : (spec.type === 'energy' ? neonAmberMat : neonCyanMat);
    const rib1 = new THREE.Mesh(ribGeo, ribMat);
    rib1.position.set(spec.x + spec.width / 2 + 0.1, spec.height / 2, spec.z + spec.depth / 2 + 0.1);
    const rib2 = new THREE.Mesh(ribGeo, ribMat);
    rib2.position.set(spec.x - spec.width / 2 - 0.1, spec.height / 2, spec.z - spec.depth / 2 - 0.1);
    cityGroup.add(rib1, rib2);

    // Rooftop features: Solar arrays, antennas, helipads
    const antennaGeo = new THREE.CylinderGeometry(0.2, 0.6, 18, 6);
    const antenna = new THREE.Mesh(antennaGeo, neonCyanMat);
    antenna.position.set(spec.x, spec.height + 9, spec.z);
    cityGroup.add(antenna);

    // Green District Terraces (Biophilic foliage)
    if (spec.type === 'green') {
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x1f7a3f,
        roughness: 0.9
      });
      for (let y = 15; y < spec.height - 20; y += 18) {
        const terrace = new THREE.Mesh(new THREE.BoxGeometry(spec.width + 1.8, 1.2, spec.depth + 1.8), foliageMat);
        terrace.position.set(spec.x, y, spec.z);
        cityGroup.add(terrace);
      }
    }
  });

  // Skybridges connecting skyscrapers at high elevation
  const skybridgeGeo = new THREE.BoxGeometry(24, 4, 5);
  const skybridgeMat = new THREE.MeshStandardMaterial({
    color: 0x1c2b3e,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
    opacity: 0.95
  });
  const skybridge1 = new THREE.Mesh(skybridgeGeo, skybridgeMat);
  skybridge1.position.set(38, 55, -20);
  skybridge1.rotation.y = 0.2;
  const skybridge2 = new THREE.Mesh(skybridgeGeo, skybridgeMat);
  skybridge2.position.set(-38, 65, -25);
  cityGroup.add(skybridge1, skybridge2);

  // 7. HOLOGRAPHIC BENGALI BILLBOARDS (Floating advertising & public notices)
  const signConfigs = [
    { textB: 'কলকাতা ২০৫০', textE: 'CITY OF TOMORROW', pos: [-18, 12, -8], col: '#00f3ff' },
    { textB: 'সবুজ সরণি', textE: 'BIOPHILIC CORRIDOR', pos: [18, 10, -20], col: '#00ff88' },
    { textB: 'পরিবেশবান্ধব শক্তি', textE: '100% RENEWABLE GRID', pos: [-20, 15, -45], col: '#ffbb00' },
    { textB: 'জলবায়ু সহনশীলতা', textE: 'CLIMATE RESILIENCE HUB', pos: [19, 14, -60], col: '#00e1ff' }
  ];

  signConfigs.forEach((cfg) => {
    const tex = createHolographicSignTexture(cfg.textB, cfg.textE, cfg.col);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 2.5),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    signMesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
    signMesh.rotation.y = cfg.pos[0] > 0 ? -0.4 : 0.4;
    cityGroup.add(signMesh);
  });

  // 7.1 HOLOGRAPHIC 3D PHOTO EXHIBITION SHOWCASE BILLBOARDS
  function createPhotoDisplayBillboard(
    imgSrc: string,
    titleEng: string,
    titleBen: string,
    pos: [number, number, number],
    rotY: number
  ): THREE.Group {
    const pGroup = new THREE.Group();
    pGroup.position.set(pos[0], pos[1], pos[2]);
    pGroup.rotation.y = rotY;

    const textureLoader = new THREE.TextureLoader();
    const photoTex = textureLoader.load(imgSrc);

    // 16:9 Display Panel
    const photoGeo = new THREE.PlaneGeometry(9.6, 5.4);
    const photoMat = new THREE.MeshBasicMaterial({
      map: photoTex,
      side: THREE.DoubleSide
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMesh.position.set(0, 0, 0.06);
    pGroup.add(photoMesh);

    // Cyber Frame Housing
    const frameGeo = new THREE.BoxGeometry(10.2, 6.0, 0.25);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x07111c,
      metalness: 0.85,
      roughness: 0.25
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    pGroup.add(frameMesh);

    // Glowing Neon Edge Accent
    const glowGeo = new THREE.BoxGeometry(10.4, 6.2, 0.08);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.z = 0.1;
    pGroup.add(glowMesh);

    // Top Holographic Title Plaque
    const plaqueTex = createHolographicSignTexture(titleBen, titleEng, '#00f3ff');
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 1.8),
      new THREE.MeshBasicMaterial({ map: plaqueTex, transparent: true, side: THREE.DoubleSide })
    );
    plaqueMesh.position.set(0, 3.8, 0.1);
    pGroup.add(plaqueMesh);

    // Pedestal Support Column
    const pylonH = pos[1];
    const pylonMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, pylonH, 8),
      new THREE.MeshStandardMaterial({ color: 0x162436, metalness: 0.6 })
    );
    pylonMesh.position.set(0, -pylonH / 2, 0);
    pGroup.add(pylonMesh);

    return pGroup;
  }

  // 1. Howrah Bridge 2050 Photo Pavilion (Riverfront promenade)
  const howrahBillboard = createPhotoDisplayBillboard(
    howrahPhoto,
    'HOWRAH BRIDGE 2.0 // CANTILEVER RETROFIT',
    'হাওড়া সেতু ২০৫০ আলোকচিত্র',
    [13, 6.5, -80],
    -0.35
  );
  cityGroup.add(howrahBillboard);

  // 2. Maglev Sky-Metro & Smart Promenade Photo Pavilion (West transit sidewalk)
  const skymetroBillboard = createPhotoDisplayBillboard(
    skymetroPhoto,
    'SKY-METRO & ECO-TRAM ARTERIES',
    'ম্যাগলেভ আকাশ-মেট্রো ও স্মার্ট সরণি',
    [-13, 6.0, 10],
    0.45
  );
  cityGroup.add(skymetroBillboard);

  // 3. Hooghly Sponge-City & Flood Gate Photo Pavilion (Embankment storm node)
  const floodBillboard = createPhotoDisplayBillboard(
    spongeCityPhoto,
    'SPONGE-CITY & TIDAL AQUEDUCTS',
    'জলবায়ু সহনশীল স্পঞ্জ-সিটি',
    [-12, 6.5, -95],
    0.35
  );
  cityGroup.add(floodBillboard);

  // 4. Vertical Forest Towers & Helical Microgrid Photo Pavilion (Green district park)
  const forestBillboard = createPhotoDisplayBillboard(
    forestTowersPhoto,
    'VERTICAL FOREST LIVING TOWERS',
    'উল্লম্ব অরণ্য অট্টালিকা ২০৫০',
    [14, 6.0, -32],
    -0.45
  );
  cityGroup.add(forestBillboard);

  // 7.2 GRAND CENTRAL TIMES-SQUARE CURVED MEGA-SCREEN BILLBOARD (Elevated at X = 0, Y = 28, Z = -58)
  // Showcases the 4 Concept Photos with dynamic cycling, scanlines, Bengali marquee and telemetry
  const megaScreenGroup = new THREE.Group();
  megaScreenGroup.position.set(0, 28, -58);

  const textureLoader = new THREE.TextureLoader();
  const conceptPhotoTextures = [
    textureLoader.load(howrahPhoto),
    textureLoader.load(skymetroPhoto),
    textureLoader.load(spongeCityPhoto),
    textureLoader.load(forestTowersPhoto)
  ];

  const photoCaptions = [
    { eng: 'HOWRAH BRIDGE 2.0 // CANTILEVER RETROFIT & TIDAL DAMPERS', ben: 'হাওড়া সেতু ২.০ • টাইডাল পাওয়ার' },
    { eng: 'MUMBAI-KOLKATA SKYLINE MONORAIL & MAGLEV ECO-ARTERY', ben: 'স্কাইলাইন মনোরেল ও ম্যাগলেভ সরণি' },
    { eng: 'HOOGHLY SPONGE-CITY // 50,000 m³ TIDAL FLOOD GATE BASIN', ben: 'হুগলি স্পঞ্জ-সিটি জলবায়ু প্রাচীর' },
    { eng: 'VERTICAL FOREST DISTRICT // 15,000 CARBON ABSORBING TREES', ben: 'উল্লম্ব অরণ্য ও সৌরবায়ু হাব' }
  ];

  // 22m x 12.5m Curved Display
  const megaGeo = new THREE.PlaneGeometry(22, 12.5, 8, 1);
  const megaMat = new THREE.MeshBasicMaterial({
    map: conceptPhotoTextures[0],
    side: THREE.DoubleSide
  });
  const megaMesh = new THREE.Mesh(megaGeo, megaMat);
  megaMesh.position.z = 0.2;
  megaScreenGroup.add(megaMesh);

  // High-Tech Cyber Frame & Gold/Cyan Holographic Bezel
  const megaFrame = new THREE.Mesh(
    new THREE.BoxGeometry(23.2, 13.6, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x060b13, metalness: 0.9, roughness: 0.2 })
  );
  const megaGlowBorder = new THREE.Mesh(
    new THREE.BoxGeometry(23.4, 13.8, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true })
  );
  megaGlowBorder.position.z = 0.25;
  megaScreenGroup.add(megaFrame, megaGlowBorder);

  // Top Bengali & English Marquee Banner on Mega-Screen
  let currentPhotoIndex = 0;
  let photoCycleTimer = 0;
  const marqueeGeo = new THREE.PlaneGeometry(21, 2.2);
  const marqueeTex = createHolographicSignTexture(photoCaptions[0].ben, photoCaptions[0].eng, '#ffaa00');
  const marqueeMat = new THREE.MeshBasicMaterial({ map: marqueeTex, transparent: true, side: THREE.DoubleSide });
  const marqueeMesh = new THREE.Mesh(marqueeGeo, marqueeMat);
  marqueeMesh.position.set(0, 7.6, 0.3);
  megaScreenGroup.add(marqueeMesh);

  cityGroup.add(megaScreenGroup);

  // 8. GREEN DISTRICT PARK & TREES (East sector at X = 18 to 28)
  const parkGeo = new THREE.PlaneGeometry(35, 75);
  const parkMat = new THREE.MeshStandardMaterial({
    color: 0x163820,
    roughness: 0.85
  });
  const parkMesh = new THREE.Mesh(parkGeo, parkMat);
  parkMesh.rotation.x = -Math.PI / 2;
  parkMesh.position.set(22, 0.15, -15);
  cityGroup.add(parkMesh);

  // Procedural futuristic trees (biophilic umbrella canopies)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x332619, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x228b45, roughness: 0.8 });
  const solarCanopyMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 0.8, roughness: 0.2 });

  for (let i = 0; i < 16; i++) {
    const treeGroup = new THREE.Group();
    const x = 14 + Math.random() * 16;
    const z = -45 + Math.random() * 60;
    const trunkH = 4 + Math.random() * 3;

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, trunkH, 6), trunkMat);
    trunk.position.y = trunkH / 2;
    treeGroup.add(trunk);

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2 + Math.random() * 1.0), foliageMat);
    foliage.position.y = trunkH + 1.5;
    treeGroup.add(foliage);

    // Some trees have integrated solar collectors
    if (i % 3 === 0) {
      const solarCap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 6), solarCanopyMat);
      solarCap.position.y = trunkH + 3.2;
      treeGroup.add(solarCap);
    }

    treeGroup.position.set(x, 0.15, z);
    cityGroup.add(treeGroup);
  }

  // 9. SMART ENERGY DISTRICT: VERTICAL AXIS WIND TURBINES & SOLAR FARMS
  for (let i = 0; i < 4; i++) {
    const turbineGroup = new THREE.Group();
    const z = -20 - i * 18;
    const x = -32;

    // Mast
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.8, 28, 8),
      new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.7 })
    );
    mast.position.y = 14;
    turbineGroup.add(mast);

    // Helical vertical rotor
    const rotor = new THREE.Group();
    rotor.position.y = 26;

    const bladeGeo = new THREE.BoxGeometry(0.2, 10, 2.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.8 });
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (b * Math.PI * 2) / 3;
      blade.position.x = Math.sin((b * Math.PI * 2) / 3) * 2;
      blade.position.z = Math.cos((b * Math.PI * 2) / 3) * 2;
      rotor.add(blade);
    }

    turbineGroup.add(rotor);
    turbineGroup.position.set(x, 0, z);
    cityGroup.add(turbineGroup);

    turbines.push({ rotor, speed: 1.8 + Math.random() * 0.8 });
  }

  // Animated Energy Flow conduits (Splines from energy hub to smart boulevard)
  const energyPoints = [
    new THREE.Vector3(-32, 10, -50),
    new THREE.Vector3(-20, 8, -40),
    new THREE.Vector3(-10, 4, -20),
    new THREE.Vector3(0, 1.5, -5)
  ];
  const curve = new THREE.CatmullRomCurve3(energyPoints);
  const splineGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
  const energyLine = new THREE.Line(
    splineGeo,
    new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 })
  );
  cityGroup.add(energyLine);
  energyLines.push({ points: curve.getPoints(50), line: energyLine, progress: 0 });

  // 10. REALISTIC STREET ENVIRONMENT DETAILS, INFRASTRUCTURE & PEDESTRIANS
  const streetDetails = buildStreetRealismDetails(180);
  cityGroup.add(streetDetails);

  const trafficLights = new TrafficLightSystem();
  cityGroup.add(trafficLights.group);

  const pedestrians = new PedestrianCrowdSystem();
  cityGroup.add(pedestrians.group);

  // 11. REALISTIC VEHICLE FLEET (Skyline Monorail, Heritage Tram, Yellow Cabs, Buses, Cyber EVs)
  // (a) Mumbai-Style Skyline Monorail (Elevated Guideway Track at X = -22, Y = 17.5)
  const monorailData = createSkylineMonorail();
  cityGroup.add(monorailData.group);

  const monorailEntity: VehicleEntity = {
    mesh: monorailData.group,
    type: 'monorail',
    route: 'metro',
    speed: 34,
    targetSpeed: 34,
    currentSpeed: 34,
    t: 0,
    direction: -1,
    laneX: -22,
    yOffset: 17.5,
    length: 36,
    wheels: [],
    stoppedAtLight: false
  };
  vehicles.push(monorailEntity);

  // (b) Modernized Kolkata Heritage Tram 2.0 (Dual articulated low-floor cars with pantograph)
  const tramData = createHeritageTram2050();
  cityGroup.add(tramData.group);

  const tramEntity: VehicleEntity = {
    mesh: tramData.group,
    type: 'tram',
    route: 'tram',
    speed: 13,
    targetSpeed: 13,
    currentSpeed: 13,
    t: 0,
    direction: 1,
    laneX: 0,
    yOffset: 0.05,
    length: 16,
    wheels: tramData.wheels,
    stoppedAtLight: false
  };
  vehicles.push(tramEntity);

  // (c) Iconic Kolkata 2050 Ambassador Yellow Cabs (4 Taxis with roof signs & rotating alloy wheels)
  const taxiConfigs = [
    { laneX: 5.2, dir: 1 as const, startZ: -70, speed: 18 },
    { laneX: 5.2, dir: 1 as const, startZ: 10, speed: 19 },
    { laneX: -5.2, dir: -1 as const, startZ: 45, speed: 18.5 },
    { laneX: -5.2, dir: -1 as const, startZ: -35, speed: 19.5 }
  ];

  taxiConfigs.forEach((cfg) => {
    const taxiData = createAmbassadorTaxi();
    taxiData.group.position.set(cfg.laneX, 0, cfg.startZ);
    taxiData.group.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
    cityGroup.add(taxiData.group);

    const taxiEntity: VehicleEntity = {
      mesh: taxiData.group,
      type: 'taxi',
      route: 'road',
      speed: cfg.speed,
      targetSpeed: cfg.speed,
      currentSpeed: cfg.speed,
      t: 0,
      direction: cfg.dir,
      laneX: cfg.laneX,
      yOffset: 0,
      length: 4.6,
      wheels: taxiData.wheels,
      brakeLights: taxiData.brakeLights,
      stoppedAtLight: false
    };
    vehicles.push(taxiEntity);
  });

  // (d) Kolkata State CSTC 2050 Electric Double-Decker & Long Express Buses
  const busConfigs = [
    { laneX: 5.8, dir: 1 as const, startZ: -40, speed: 15 },
    { laneX: -5.8, dir: -1 as const, startZ: 25, speed: 15 }
  ];

  busConfigs.forEach((cfg) => {
    const busData = createCityBus();
    busData.group.position.set(cfg.laneX, 0, cfg.startZ);
    busData.group.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
    cityGroup.add(busData.group);

    const busEntity: VehicleEntity = {
      mesh: busData.group,
      type: 'bus',
      route: 'road',
      speed: cfg.speed,
      targetSpeed: cfg.speed,
      currentSpeed: cfg.speed,
      t: 0,
      direction: cfg.dir,
      laneX: cfg.laneX,
      yOffset: 0,
      length: 10.6,
      wheels: busData.wheels,
      brakeLights: busData.brakeLights,
      stoppedAtLight: false
    };
    vehicles.push(busEntity);
  });

  // (e) Modern Cyber Sports Sedans (Metallic Crimson, Pearl White, Titanium Grey, Emerald)
  const sedanConfigs = [
    { color: 0xd91438, laneX: 3.6, dir: 1 as const, startZ: -85, speed: 22 },
    { color: 0xf4f7fa, laneX: 3.6, dir: 1 as const, startZ: -10, speed: 21 },
    { color: 0x334155, laneX: -3.6, dir: -1 as const, startZ: 55, speed: 22 },
    { color: 0x059669, laneX: -3.6, dir: -1 as const, startZ: -15, speed: 21.5 }
  ];

  sedanConfigs.forEach((cfg) => {
    const sedanData = createElectricSedan(cfg.color);
    sedanData.group.position.set(cfg.laneX, 0, cfg.startZ);
    sedanData.group.rotation.y = cfg.dir === 1 ? 0 : Math.PI;
    cityGroup.add(sedanData.group);

    const sedanEntity: VehicleEntity = {
      mesh: sedanData.group,
      type: 'sedan',
      route: 'road',
      speed: cfg.speed,
      targetSpeed: cfg.speed,
      currentSpeed: cfg.speed,
      t: 0,
      direction: cfg.dir,
      laneX: cfg.laneX,
      yOffset: 0,
      length: 4.4,
      wheels: sedanData.wheels,
      brakeLights: sedanData.brakeLights,
      stoppedAtLight: false
    };
    vehicles.push(sedanEntity);
  });

  // 12. STREET LIGHTS ALONG BOULEVARD (Curved Swan-Neck Fixtures)
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x243342, metalness: 0.7 });
  for (let z = -70; z <= 40; z += 18) {
    [-8.5, 8.5].forEach((x) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.5, 6), poleMat);
      pole.position.y = 3.25;

      const swanArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.8), poleMat);
      swanArm.rotation.z = (Math.PI / 3) * (x > 0 ? -1 : 1);
      swanArm.position.set(x > 0 ? -0.7 : 0.7, 6.4, 0);

      const lampHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.12, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x111620, metalness: 0.9 })
      );
      lampHead.position.set(x > 0 ? -1.3 : 1.3, 6.7, 0);

      const lampLens = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.28),
        new THREE.MeshBasicMaterial({ color: 0xfffae0 })
      );
      lampLens.rotation.x = Math.PI / 2;
      lampLens.position.set(x > 0 ? -1.3 : 1.3, 6.63, 0);

      poleGroup.add(pole, swanArm, lampHead, lampLens);
      cityGroup.add(poleGroup);
    });
  }

  // 13. SCENE 11 OBSERVATION SKY-DECK PLATFORM (At Y = 78, Z = -15)
  const deckGroup = new THREE.Group();
  deckGroup.position.set(0, 76, -15);

  const obsFloorGeo = new THREE.CylinderGeometry(14, 15, 2, 24);
  const obsFloorMat = new THREE.MeshStandardMaterial({
    color: 0x0b1522,
    metalness: 0.8,
    roughness: 0.2
  });
  const obsFloor = new THREE.Mesh(obsFloorGeo, obsFloorMat);
  deckGroup.add(obsFloor);

  // Glass safety railing
  const railGeo = new THREE.CylinderGeometry(14.2, 14.2, 1.4, 24, 1, true);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const railing = new THREE.Mesh(railGeo, railMat);
  railing.position.y = 1.4;
  deckGroup.add(railing);

  // Holographic quote pedestal on sky-deck
  const visionTex = createHolographicSignTexture('ভবিষ্যত আমরাই গড়ে তুলি', 'THE FUTURE IS SOMETHING WE DESIGN', '#ffaa00');
  const visionSign = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 2.8),
    new THREE.MeshBasicMaterial({ map: visionTex, transparent: true, side: THREE.DoubleSide })
  );
  visionSign.position.set(0, 2.4, -9);
  deckGroup.add(visionSign);

  cityGroup.add(deckGroup);

  // UPDATE TICK FUNCTION
  const update = (delta: number, elapsed: number, waterTarget: number) => {
    // 1. Rotate wind turbines
    turbines.forEach((t) => {
      t.rotor.rotation.y += t.speed * delta;
    });

    // 2. Dynamic Mega-Screen Concept Photo Showcase Slide Cycle
    photoCycleTimer += delta;
    if (photoCycleTimer > 6.5) {
      photoCycleTimer = 0;
      currentPhotoIndex = (currentPhotoIndex + 1) % conceptPhotoTextures.length;
      megaMat.map = conceptPhotoTextures[currentPhotoIndex];
      megaMat.needsUpdate = true;

      // Update Top Bengali/English Marquee Banner
      const updatedMarqueeTex = createHolographicSignTexture(
        photoCaptions[currentPhotoIndex].ben,
        photoCaptions[currentPhotoIndex].eng,
        '#ffaa00'
      );
      marqueeMat.map = updatedMarqueeTex;
      marqueeMat.needsUpdate = true;
    }

    // 3. Update Traffic Light Cycle
    trafficLights.update(delta);

    // 4. Update Pedestrian Crowd Movement & Crosswalk AI
    pedestrians.update(delta, trafficLights.nsState === 'green');

    // 5. Update Vehicles & Intelligent Traffic AI
    const roadBounds = { minZ: -95, maxZ: 65 };

    vehicles.forEach((v) => {
      if (v.route === 'metro') {
        // High-Speed Skyline Monorail (Linear transit glide from Z = +75 to Z = -135)
        v.mesh.position.z += v.speed * delta * v.direction;
        if (v.mesh.position.z < -135) {
          v.mesh.position.z = 75;
        }
        v.mesh.position.x = -22;
        v.mesh.position.y = v.yOffset;
        return;
      }

      if (v.route === 'tram') {
        // Modernized Heritage Tram down central tracks
        v.mesh.position.z += v.speed * delta * v.direction;
        if (v.mesh.position.z > 55) {
          v.direction = -1;
          v.mesh.rotation.y = Math.PI;
        } else if (v.mesh.position.z < -85) {
          v.direction = 1;
          v.mesh.rotation.y = 0;
        }

        // Tram wheels rotate
        const tramSpin = (v.speed * delta) / 0.36;
        v.wheels.forEach((w) => {
          w.rotation.x += tramSpin * v.direction;
        });
        return;
      }

      if (v.route === 'road') {
        // (A) Check traffic light ahead
        const lightStopRequired = trafficLights.shouldVehicleStop(v.mesh.position.z, v.direction);

        // (B) Check distance to vehicle ahead in the same lane (anti-collision following AI)
        let vehicleAheadDistance = 999;
        for (const other of vehicles) {
          if (other === v || other.route !== 'road') continue;
          if (Math.abs(other.laneX - v.laneX) < 1.0) {
            const dz = (other.mesh.position.z - v.mesh.position.z) * v.direction;
            if (dz > 0 && dz < vehicleAheadDistance) {
              vehicleAheadDistance = dz;
            }
          }
        }

        // Determine if vehicle needs to brake
        const mustStop = lightStopRequired || vehicleAheadDistance < 8.5;

        if (mustStop) {
          v.targetSpeed = 0;
          // Smooth deceleration
          v.currentSpeed = Math.max(0, v.currentSpeed - 14 * delta);
          v.stoppedAtLight = true;

          // Intensify brake lights
          if (v.brakeLights) {
            v.brakeLights.forEach((bl) => {
              (bl.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.5;
            });
          }
        } else {
          v.targetSpeed = v.speed;
          // Smooth acceleration
          v.currentSpeed = Math.min(v.targetSpeed, v.currentSpeed + 7.5 * delta);
          v.stoppedAtLight = false;

          // Normal running brake lights
          if (v.brakeLights) {
            v.brakeLights.forEach((bl) => {
              (bl.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7;
            });
          }
        }

        // Update physical position
        v.mesh.position.z += v.currentSpeed * delta * v.direction;

        // Wrap around boulevard boundaries
        if (v.direction === 1 && v.mesh.position.z > roadBounds.maxZ) {
          v.mesh.position.z = roadBounds.minZ;
        } else if (v.direction === -1 && v.mesh.position.z < roadBounds.minZ) {
          v.mesh.position.z = roadBounds.maxZ;
        }

        // Realistic wheel spinning matching linear speed (omega = v / r)
        const spinAngle = (v.currentSpeed * delta) / 0.4;
        v.wheels.forEach((w) => {
          w.rotation.x += spinAngle * v.direction;
        });
      }
    });

    // 6. Smoothly animate flood water level towards waterTarget
    const currentY = floodWaterMesh.position.y;
    const targetY = waterTarget > 0 ? waterTarget : -0.5;
    floodWaterMesh.position.y += (targetY - currentY) * delta * 2.0;

    // 7. Animate deployable flood barriers rising when flooded
    const barrierTargetY = waterTarget > 0 ? 0.6 : -0.5;
    floodBarriers.forEach((b) => {
      b.position.y += (barrierTargetY - b.position.y) * delta * 2.5;
    });

    // 8. Animate Hooghly River subtle undulations
    riverMesh.position.y = -0.6 + Math.sin(elapsed * 1.5) * 0.08;
  };

  return {
    group: cityGroup,
    buildings,
    vehicles,
    trafficLights,
    pedestrians,
    turbines,
    floodWaterMesh,
    riverMesh,
    floodBarriers,
    energyLines,
    update
  };
}
