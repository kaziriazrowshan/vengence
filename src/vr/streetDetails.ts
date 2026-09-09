import * as THREE from 'three';

// Procedural texture for road markings: Zebra crosswalks, arrows, manhole covers
function createZebraCrosswalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e1520';
  ctx.fillRect(0, 0, 512, 128);

  ctx.fillStyle = '#f2f6fa';
  const stripeWidth = 32;
  const gap = 24;
  for (let x = 12; x < 500; x += stripeWidth + gap) {
    ctx.fillRect(x, 8, stripeWidth, 112);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createManholeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e242d';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a4452';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(128, 128, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Waffle tread pattern
  ctx.strokeStyle = '#2d3744';
  ctx.lineWidth = 3;
  for (let i = 40; i < 220; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 40);
    ctx.lineTo(i, 216);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, i);
    ctx.lineTo(216, i);
    ctx.stroke();
  }

  // Text
  ctx.fillStyle = '#7a889b';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KMC SMART DRAIN 2050', 128, 132);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createStorefrontSignTexture(bengali: string, english: string, color = '#ffaa00'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#060f1b';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = color;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bengali, 256, 44);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 22px "Rajdhani", sans-serif';
  ctx.fillText(english, 256, 92);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function buildStreetRealismDetails(roadLength: number): THREE.Group {
  const streetGroup = new THREE.Group();
  streetGroup.name = 'Realistic_Street_Details';

  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf0f5fc });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xffbb00 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2630, metalness: 0.8, roughness: 0.3 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x242e3b, roughness: 0.7 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.35,
    metalness: 0.9,
    roughness: 0.1
  });

  // 1. HIGHWAY ASPHALT LANE MARKINGS
  // (a) Solid curb edge boundary lines (Left and Right)
  [-7.2, 7.2].forEach((x) => {
    const edgeLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, roadLength), whiteLineMat);
    edgeLine.rotation.x = -Math.PI / 2;
    edgeLine.position.set(x, 0.025, -15);
    streetGroup.add(edgeLine);
  });

  // (b) Dashed lane dividers down each direction
  [-4.0, 4.0].forEach((x) => {
    for (let z = -85; z <= 55; z += 5.5) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.0), whiteLineMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.025, z);
      streetGroup.add(dash);
    }
  });

  // (c) Double solid yellow center tram-corridor boundary lines
  [-1.6, 1.6].forEach((x) => {
    const yellowLine = new THREE.Mesh(new THREE.PlaneGeometry(0.14, roadLength), yellowLineMat);
    yellowLine.rotation.x = -Math.PI / 2;
    yellowLine.position.set(x, 0.025, -15);
    streetGroup.add(yellowLine);
  });

  // (d) Bold Zebra Crossings at Intersections (Z = 5 and Z = -42)
  const zebraTex = createZebraCrosswalkTexture();
  const zebraMat = new THREE.MeshBasicMaterial({ map: zebraTex });

  [5, -42].forEach((zPos) => {
    const crosswalk = new THREE.Mesh(new THREE.PlaneGeometry(15, 3.6), zebraMat);
    crosswalk.rotation.x = -Math.PI / 2;
    crosswalk.position.set(0, 0.028, zPos);
    streetGroup.add(crosswalk);

    // Thick solid white stop lines before the crosswalk
    [-7.8, 7.8].forEach((zOffset) => {
      const stopLine = new THREE.Mesh(new THREE.PlaneGeometry(14.6, 0.5), whiteLineMat);
      stopLine.rotation.x = -Math.PI / 2;
      stopLine.position.set(0, 0.028, zPos + (zOffset > 0 ? 3.0 : -3.0));
      streetGroup.add(stopLine);
    });
  });

  // (e) Cast-Iron Manhole Covers & Storm Drain Grates along gutters
  const manholeTex = createManholeTexture();
  const manholeMat = new THREE.MeshStandardMaterial({
    map: manholeTex,
    roughness: 0.6,
    metalness: 0.7
  });

  const manholePositions = [
    [-5.5, -20],
    [5.5, -60],
    [-5.5, 30],
    [5.5, 0]
  ];

  manholePositions.forEach(([mx, mz]) => {
    const manhole = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), manholeMat);
    manhole.rotation.x = -Math.PI / 2;
    manhole.position.set(mx, 0.026, mz);
    streetGroup.add(manhole);
  });

  // Storm drain grates along both curbs
  for (let z = -80; z <= 50; z += 22) {
    [-7.0, 7.0].forEach((x) => {
      const grate = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), metalMat);
      grate.rotation.x = -Math.PI / 2;
      grate.position.set(x, 0.026, z);
      streetGroup.add(grate);
    });
  }

  // 2. CONCRETE CURBS WITH RAISED BEVEL (Height 0.22m)
  [-8.8, 8.8].forEach((x) => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, roadLength), concreteMat);
    curb.position.set(x, 0.11, -15);
    streetGroup.add(curb);
  });

  // 3. MODERN BUS TRANSIT SHELTER WITH DIGITAL TIMETABLE & BENCH (East Sidewalk at X = 11, Z = -10)
  const shelterGroup = new THREE.Group();
  shelterGroup.position.set(11.5, 0.2, -10);

  // Black steel frame
  const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), metalMat);
  post1.position.set(-2.2, 1.6, -1.0);
  const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), metalMat);
  post2.position.set(2.2, 1.6, -1.0);
  shelterGroup.add(post1, post2);

  // Glass Canopy Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 2.4), glassMat);
  roof.position.set(0, 3.2, 0);
  shelterGroup.add(roof);

  // Glass Rear Windscreen
  const rearScreen = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 0.06), glassMat);
  rearScreen.position.set(0, 1.6, -1.0);
  shelterGroup.add(rearScreen);

  // Wooden Passenger Seating Bench
  const benchMat = new THREE.MeshStandardMaterial({ color: 0x6e4726, roughness: 0.8 });
  const bench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.5), benchMat);
  bench.position.set(0, 0.6, -0.6);
  const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.45), metalMat);
  benchLeg1.position.set(-1.4, 0.3, -0.6);
  const benchLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.45), metalMat);
  benchLeg2.position.set(1.4, 0.3, -0.6);
  shelterGroup.add(bench, benchLeg1, benchLeg2);

  // Live Digital Bus Timetable Screen
  const screenTex = createStorefrontSignTexture('বাস আগমন সূচি', 'BUS TIMETABLE // NEXT: 2 MIN', '#00f3ff');
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.7),
    new THREE.MeshBasicMaterial({ map: screenTex })
  );
  screenMesh.position.set(-1.8, 2.2, -0.95);
  shelterGroup.add(screenMesh);

  streetGroup.add(shelterGroup);

  // 4. SMART SOLAR RECYCLING COMPACTORS & TRASH RECEPTACLES
  const binMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.6 });
  const greenBinMat = new THREE.MeshStandardMaterial({ color: 0x1f7a3f });
  const yellowBinMat = new THREE.MeshStandardMaterial({ color: 0xd9822b });

  const binLocations = [
    [-11, -8],
    [11, -25],
    [-11, 22],
    [11, 14]
  ];

  binLocations.forEach(([bx, bz]) => {
    const binCluster = new THREE.Group();
    binCluster.position.set(bx, 0.2, bz);

    // 3 color-coded modern bins
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.45), binMat);
    b1.position.set(-0.55, 0.55, 0);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.45), greenBinMat);
    b2.position.set(0, 0.55, 0);
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.45), yellowBinMat);
    b3.position.set(0.55, 0.55, 0);

    // Solar panel top on the cluster
    const solarTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.05, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.9 })
    );
    solarTop.position.set(0, 1.12, 0);

    binCluster.add(b1, b2, b3, solarTop);
    streetGroup.add(binCluster);
  });

  // 5. MODERN RED FIRE HYDRANTS
  const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xdd1122, metalness: 0.7, roughness: 0.3 });
  [
    [-8.2, -18],
    [8.2, 18],
    [-8.2, -55]
  ].forEach(([hx, hz]) => {
    const hydrant = new THREE.Group();
    hydrant.position.set(hx, 0.2, hz);

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.75, 8), hydrantMat);
    body.position.y = 0.38;
    const topCap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), hydrantMat);
    topCap.position.y = 0.75;
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8), hydrantMat);
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.y = 0.45;

    hydrant.add(body, topCap, nozzle);
    streetGroup.add(hydrant);
  });

  // 6. ELECTRIC COMMUTER BIKE DOCKING STATION (West Sidewalk at X = -11.5, Z = -15)
  const bikeDock = new THREE.Group();
  bikeDock.position.set(-11.5, 0.2, -15);

  const dockBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 6.0), metalMat);
  dockBase.position.y = 0.08;
  bikeDock.add(dockBase);

  // 4 Electric Commuter Bikes
  const bikeFrameMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.8 });
  const bikeWheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });

  for (let i = 0; i < 4; i++) {
    const bZ = -2.2 + i * 1.4;
    const bike = new THREE.Group();
    bike.position.set(0, 0.15, bZ);

    // Frame tubes
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), bikeFrameMat);
    tube.rotation.x = 0.4;
    tube.position.set(0, 0.5, 0);

    // Front & rear wheels
    const w1 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 6, 12), bikeWheelMat);
    w1.rotation.y = Math.PI / 2;
    w1.position.set(0, 0.3, -0.55);

    const w2 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 6, 12), bikeWheelMat);
    w2.rotation.y = Math.PI / 2;
    w2.position.set(0, 0.3, 0.55);

    bike.add(tube, w1, w2);
    bikeDock.add(bike);
  }
  streetGroup.add(bikeDock);

  // 7. GROUND-FLOOR STREET LEVEL ILLUMINATED STOREFRONTS & CAFES
  // (Realistic GTA 5 urban life facade signs along building bases)
  const storefronts = [
    { textB: 'কলকাতা চা কোং ২০৫০', textE: 'KOLKATA CHAI & BISTRO', x: -26, z: 12, col: '#ffaa00' },
    { textB: 'ফ্লুরিজ স্মার্ট ক্যাফে', textE: 'FLURYS PATISSERIE 2050', x: 26, z: 15, col: '#ff3388' },
    { textB: 'রসগোল্লা ল্যাব', textE: 'BENGAL SWEET LAB & ROOFTOP', x: -26, z: -35, col: '#00f3ff' },
    { textB: 'সাইবার কেয়ার ও ড্রাগস', textE: 'METRO HEALTH 2050', x: 26, z: -40, col: '#00ff88' }
  ];

  storefronts.forEach((sf) => {
    const tex = createStorefrontSignTexture(sf.textB, sf.textE, sf.col);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8.5, 2.2),
      new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })
    );
    sign.position.set(sf.x, 3.8, sf.z);
    sign.rotation.y = sf.x > 0 ? -Math.PI / 2 : Math.PI / 2;

    // Awning over the shopfront
    const awningMat = new THREE.MeshStandardMaterial({
      color: sf.col === '#ff3388' ? 0x991133 : 0x113355,
      roughness: 0.6
    });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 8.8), awningMat);
    awning.position.set(sf.x + (sf.x > 0 ? -0.8 : 0.8), 2.8, sf.z);
    awning.rotation.z = sf.x > 0 ? 0.2 : -0.2;

    streetGroup.add(sign, awning);
  });

  return streetGroup;
}
