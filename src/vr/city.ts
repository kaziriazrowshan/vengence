import * as THREE from 'three';
import { Vehicle } from '../types';
import howrahPhoto from '../assets/images/howrah_bridge_2050_1788943932870.jpg';
import skymetroPhoto from '../assets/images/kolkata_skymetro_2050_1788943946427.jpg';
import spongeCityPhoto from '../assets/images/hooghly_sponge_city_1788943963962.jpg';
import forestTowersPhoto from '../assets/images/vertical_forest_towers_1788943979447.jpg';

export interface CityEnvironment {
  group: THREE.Group;
  buildings: THREE.Mesh[];
  vehicles: Vehicle[];
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
  const vehicles: Vehicle[] = [];
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

  // 10. DYNAMIC VEHICLES (Metro, Autonomous Tram, Electric Pods)
  // (a) Sky-Metro Train
  const metroTrain = new THREE.Group();
  for (let car = 0; car < 3; car++) {
    const carMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.4, 9),
      new THREE.MeshStandardMaterial({ color: 0x0c1b29, metalness: 0.8, roughness: 0.2 })
    );
    carMesh.position.set(0, 0, car * 9.8);
    // Glowing train window stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.4, 8), neonCyanMat);
    stripe.position.set(0, 0.3, car * 9.8);
    metroTrain.add(carMesh, stripe);
  }
  // Headlight
  const metroHeadlight = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.2), neonCyanMat);
  metroHeadlight.position.set(0, 0, -1);
  metroTrain.add(metroHeadlight);
  cityGroup.add(metroTrain);

  vehicles.push({
    mesh: metroTrain,
    route: 'metro',
    speed: 35,
    t: 0,
    radius: 90,
    yOffset: 17.5
  });

  // (b) Autonomous Kolkata 2050 Trams (Center Boulevard)
  for (let tIdx = 0; tIdx < 2; tIdx++) {
    const tram = new THREE.Group();
    const tramBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x142b3a, metalness: 0.6, roughness: 0.3 })
    );
    tramBody.position.y = 1.3;
    tram.add(tramBody);

    // Glowing Kolkata tram cyan accent
    const tramAccent = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.3, 11), neonAmberMat);
    tramAccent.position.y = 1.8;
    tram.add(tramAccent);

    // Tram destination sign "ESPLANADE - SALT LAKE 2050"
    const tramSignTex = createHolographicSignTexture('এসপ্ল্যানেড - সল্টলেক', 'SMART TRAM', '#ffaa00');
    const tramSign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.6),
      new THREE.MeshBasicMaterial({ map: tramSignTex, transparent: true })
    );
    tramSign.position.set(0, 2.5, -6.02);
    tram.add(tramSign);

    cityGroup.add(tram);
    vehicles.push({
      mesh: tram,
      route: 'tram',
      speed: 10 + tIdx * 4,
      t: tIdx * 0.5,
      radius: 65,
      yOffset: 0
    });
  }

  // (c) Autonomous Electric Pods & Buses
  for (let pIdx = 0; pIdx < 4; pIdx++) {
    const pod = new THREE.Group();
    const podMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.4, 3.4),
      new THREE.MeshStandardMaterial({ color: 0x1c2b3e, metalness: 0.8, roughness: 0.3 })
    );
    podMesh.position.y = 0.7;
    pod.add(podMesh);

    // Front headlights & rear taillights
    const frontLight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.1), neonCyanMat);
    frontLight.position.set(0, 0.5, -1.72);
    const rearLight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
    rearLight.position.set(0, 0.5, 1.72);
    pod.add(frontLight, rearLight);

    cityGroup.add(pod);
    vehicles.push({
      mesh: pod,
      route: 'road',
      speed: 14 + pIdx * 3,
      t: pIdx * 0.25,
      radius: 60,
      yOffset: 0
    });
  }

  // 11. STREET FURNITURE: Smart streetlights, cooling mist totems, benches
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x243342, metalness: 0.7 });
  for (let z = -70; z <= 40; z += 18) {
    [-8, 8].forEach((x) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.5, 6), poleMat);
      pole.position.set(x, 3.25, z);
      cityGroup.add(pole);

      // Downward luminaire
      const luminaire = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 1.2), neonCyanMat);
      luminaire.position.set(x + (x > 0 ? -0.5 : 0.5), 6.4, z);
      cityGroup.add(luminaire);

      // Smart air-quality sensor ring on street pole
      const aqiRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 6, 12), neonGreenMat);
      aqiRing.rotation.x = Math.PI / 2;
      aqiRing.position.set(x, 2.5, z);
      cityGroup.add(aqiRing);
    });
  }

  // 12. SCENE 11 OBSERVATION SKY-DECK PLATFORM (At Y = 78, Z = -15)
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

    // 2. Animate vehicles along routes
    vehicles.forEach((v) => {
      v.t = (v.t + (v.speed * delta) / 100) % 1.0;

      if (v.route === 'metro') {
        // Linear track along X = -22, Z from +80 to -120
        const zPos = 70 - v.t * 180;
        v.mesh.position.set(-22, v.yOffset, zPos);
      } else if (v.route === 'tram') {
        // Back and forth down central boulevard
        const cycle = Math.sin(v.t * Math.PI * 2);
        const zPos = -15 + cycle * 55;
        v.mesh.position.set(cycle > 0 ? -2.5 : 2.5, v.yOffset, zPos);
        v.mesh.rotation.y = cycle > 0 ? Math.PI : 0;
      } else if (v.route === 'road') {
        // Loop around the outer boulevard lanes
        const zPos = -15 + Math.sin(v.t * Math.PI * 2) * 50;
        const xPos = Math.cos(v.t * Math.PI * 2) > 0 ? 5.5 : -5.5;
        v.mesh.position.set(xPos, v.yOffset, zPos);
        v.mesh.rotation.y = Math.cos(v.t * Math.PI * 2) > 0 ? 0 : Math.PI;
      }
    });

    // 3. Smoothly animate flood water level towards waterTarget
    const currentY = floodWaterMesh.position.y;
    const targetY = waterTarget > 0 ? waterTarget : -0.5;
    floodWaterMesh.position.y += (targetY - currentY) * delta * 2.0;

    // 4. Animate deployable flood barriers rising when flooded
    const barrierTargetY = waterTarget > 0 ? 0.6 : -0.5;
    floodBarriers.forEach((b) => {
      b.position.y += (barrierTargetY - b.position.y) * delta * 2.5;
    });

    // 5. Animate Hooghly River subtle undulations
    riverMesh.position.y = -0.6 + Math.sin(elapsed * 1.5) * 0.08;
  };

  return {
    group: cityGroup,
    buildings,
    vehicles,
    turbines,
    floodWaterMesh,
    riverMesh,
    floodBarriers,
    energyLines,
    update
  };
}
