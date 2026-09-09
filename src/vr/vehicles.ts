import * as THREE from 'three';

export interface VehicleEntity {
  mesh: THREE.Group;
  type: 'taxi' | 'bus' | 'sedan' | 'sports' | 'tram' | 'monorail';
  route: 'road' | 'tram' | 'metro';
  speed: number;
  targetSpeed: number;
  currentSpeed: number;
  t: number;
  direction: 1 | -1;
  laneX: number;
  yOffset: number;
  length: number;
  wheels: THREE.Mesh[];
  brakeLights?: THREE.Mesh[];
  headlights?: THREE.Mesh[];
  stoppedAtLight: boolean;
}

// Procedural texture for taxi roof beacon and vehicle signs
function createTaxiSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f5b800';
  ctx.fillRect(0, 0, 256, 64);

  // Black border
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);

  ctx.fillStyle = '#0a0a0a';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAXI', 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Iconic Kolkata Taxi side blue stripe with roundel TAXI badge and registration
function createAmbassadorSideStripeTexture(flip = false): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Royal blue stripe background
  ctx.fillStyle = '#005bb5';
  ctx.fillRect(0, 0, 512, 128);

  // Top and bottom chrome accent lines
  ctx.fillStyle = '#dbe4ee';
  ctx.fillRect(0, 0, 512, 8);
  ctx.fillRect(0, 120, 512, 8);

  // Circular yellow taxi emblem (Roundel)
  const cx = flip ? 380 : 140;
  const cy = 64;
  const r = 44;

  ctx.fillStyle = '#f5b800';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#051b38';
  ctx.lineWidth = 4;
  ctx.stroke();

  // TAXI in center of circle
  ctx.fillStyle = '#000000';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('TAXI', cx, cy - 2);

  // Registration text "WB-02" and "CALCUTTA"
  const textX = flip ? 180 : 340;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WB 02 B 1947', textX, 48);

  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#ffd152';
  ctx.fillText('KOLKATA METERED CAB', textX, 86);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Iconic Kolkata Private Blue Bus (Route 30C / 30C/1) side livery with Bengali lettering
function createKolkataPrivateBusSideTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Bright Kolkata Bus Yellow Belt
  ctx.fillStyle = '#fab005';
  ctx.fillRect(0, 0, 1024, 160);

  // Red accent borders
  ctx.fillStyle = '#d91438';
  ctx.fillRect(0, 0, 1024, 10);
  ctx.fillRect(0, 150, 1024, 10);

  // Authentic hand-painted Bengali Blessing Calligraphy: "পিতৃ আশীর্বাদ" (Father's Blessing)
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('পিতৃ আশীর্বাদ', 40, 80);

  // Route Badge: 30C / 30C/1
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 52px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('30C • 30C/1', 512, 75);

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#7f1d1d';
  ctx.fillText('BABUGHAT ⇄ HOWRAH STN ⇄ ESPLANADE ⇄ ULTADANGA', 512, 125);

  // Bengali devotional slogan on the other side
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('মা তারা আশীর্বাদ', 980, 80);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createBusMatrixTexture(destination: string, bengali: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#050b14';
  ctx.fillRect(0, 0, 512, 96);

  // Amber LED Matrix effect
  ctx.fillStyle = '#ffaa00';
  ctx.font = 'bold 28px "Space Grotesk", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(destination, 256, 32);

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#00f3ff';
  ctx.fillText(bengali, 256, 68);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createMonorailMatrixTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#020914';
  ctx.fillRect(0, 0, 512, 96);

  ctx.fillStyle = '#00f3ff';
  ctx.font = 'bold 30px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MUMBAI-KOLKATA SKYLINE 2050', 256, 32);

  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('আকাশ-ট্রাম এক্সপ্রেস • RAPID TRANSIT', 256, 68);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Reusable wheel generator with rubber tire & silver alloy multi-spoke rim
function createWheelMesh(radius = 0.42, width = 0.28): THREE.Mesh {
  const wheelGroup = new THREE.Group();

  // Rubber tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x14161a,
    roughness: 0.9,
    metalness: 0.1
  });
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.rotation.z = Math.PI / 2;

  // Silver alloy rim
  const rimRadius = radius * 0.65;
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.02, 14);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xdde5ed,
    metalness: 0.85,
    roughness: 0.2
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.z = Math.PI / 2;

  // Center hub cap with cyan cyber accent
  const hubGeo = new THREE.CylinderGeometry(rimRadius * 0.35, rimRadius * 0.35, width + 0.04, 8);
  const hubMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.z = Math.PI / 2;

  const combined = new THREE.Group();
  combined.add(tire, rim, hub);

  // Return as a mesh container for easy rotation
  const container = new THREE.Mesh();
  container.add(combined);
  return container;
}

// Reusable wheel generator for Ambassador taxi: White steel rim with polished chrome center hubcap
function createAmbassadorTaxiWheelMesh(radius = 0.38, width = 0.22): THREE.Mesh {
  const wheelGroup = new THREE.Group();

  // 1. Rubber tire
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x181a1d,
    roughness: 0.9,
    metalness: 0.05
  });
  const tire = new THREE.Mesh(tireGeo, tireMat);
  tire.rotation.z = Math.PI / 2;

  // 2. White/Cream steel pressed rim
  const rimRadius = radius * 0.7;
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.01, 16);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf4f3ec,
    roughness: 0.4,
    metalness: 0.2
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.z = Math.PI / 2;

  // 3. Polished Chrome vintage domed hubcap in center
  const hubRadius = rimRadius * 0.52;
  const hubGeo = new THREE.CylinderGeometry(hubRadius, hubRadius * 1.1, width + 0.04, 16);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0xf5f7fa,
    metalness: 0.96,
    roughness: 0.08
  });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.z = Math.PI / 2;

  wheelGroup.add(tire, rim, hub);

  const container = new THREE.Mesh();
  container.add(wheelGroup);
  return container;
}

// 1. ICONIC KOLKATA AMBASSADOR YELLOW TAXI (Classic Yellow Cab with Royal Blue Stripe)
export function createAmbassadorTaxi(): { group: THREE.Group; wheels: THREE.Mesh[]; brakeLights: THREE.Mesh[] } {
  const taxi = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const brakeLights: THREE.Mesh[] = [];

  // Authentic Kolkata Taxi Yellow paint
  const yellowPaint = new THREE.MeshStandardMaterial({
    color: 0xf7be16,
    roughness: 0.25,
    metalness: 0.25
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    metalness: 0.96,
    roughness: 0.08
  });

  const darkGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0a1420,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });

  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
  const indicatorMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });
  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0xff1122,
    emissive: 0xaa0011,
    emissiveIntensity: 0.8
  });

  // (a) Lower Main Body Chassis
  const chassisGeo = new THREE.BoxGeometry(1.92, 0.65, 4.4);
  const chassis = new THREE.Mesh(chassisGeo, yellowPaint);
  chassis.position.y = 0.55;
  taxi.add(chassis);

  // (b) Iconic Kolkata Royal Blue Mid-Waist Stripe with TAXI Roundel & Reg No (Both sides)
  const leftStripeTex = createAmbassadorSideStripeTexture(false);
  const rightStripeTex = createAmbassadorSideStripeTexture(true);

  const sideStripeGeo = new THREE.PlaneGeometry(3.6, 0.28);
  const leftStripe = new THREE.Mesh(
    sideStripeGeo,
    new THREE.MeshBasicMaterial({ map: leftStripeTex, transparent: true })
  );
  leftStripe.position.set(-0.968, 0.62, 0.1);
  leftStripe.rotation.y = -Math.PI / 2;

  const rightStripe = new THREE.Mesh(
    sideStripeGeo,
    new THREE.MeshBasicMaterial({ map: rightStripeTex, transparent: true })
  );
  rightStripe.position.set(0.968, 0.62, 0.1);
  rightStripe.rotation.y = Math.PI / 2;

  taxi.add(leftStripe, rightStripe);

  // (c) Curved Front Bonnet / Hood (Ambassador classic curved front)
  const hoodGeo = new THREE.BoxGeometry(1.82, 0.45, 1.45);
  const hood = new THREE.Mesh(hoodGeo, yellowPaint);
  hood.position.set(0, 0.72, -1.35);
  taxi.add(hood);

  // Chrome center bonnet ridge spear (Classic Ambassador hallmark)
  const spear = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.42), chromeMat);
  spear.position.set(0, 0.95, -1.35);
  taxi.add(spear);

  // Ambassador Winged Front Bonnet Mascot
  const mascot = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), chromeMat);
  mascot.rotation.x = Math.PI / 2;
  mascot.position.set(0, 0.97, -2.05);
  taxi.add(mascot);

  // (d) Authentic Vintage Ambassador Chrome Grille with Horizontal Slats
  const grilleGeo = new THREE.BoxGeometry(1.52, 0.38, 0.08);
  const grille = new THREE.Mesh(grilleGeo, chromeMat);
  grille.position.set(0, 0.64, -2.23);
  taxi.add(grille);

  // (e) Dual Round Headlamps with Chrome Bezels & Amber Indicators Below
  [-0.68, 0.68].forEach((x) => {
    // Chrome Headlamp Bezel
    const hlRing = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.08, 14), chromeMat);
    hlRing.rotation.x = Math.PI / 2;
    hlRing.position.set(x, 0.68, -2.2);

    const hlLens = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.09, 14), headlightMat);
    hlLens.rotation.x = Math.PI / 2;
    hlLens.position.set(x, 0.68, -2.21);

    // Amber Turn Indicator below headlamp
    const indLens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), indicatorMat);
    indLens.rotation.x = Math.PI / 2;
    indLens.position.set(x, 0.44, -2.22);

    taxi.add(hlRing, hlLens, indLens);
  });

  // (f) Cabin Greenhouse & Curved Roof
  const cabinGeo = new THREE.BoxGeometry(1.72, 0.76, 2.3);
  const cabin = new THREE.Mesh(cabinGeo, yellowPaint);
  cabin.position.set(0, 1.15, 0.2);
  taxi.add(cabin);

  // Front Windshield
  const windshieldGeo = new THREE.PlaneGeometry(1.62, 0.66);
  const windshield = new THREE.Mesh(windshieldGeo, darkGlassMat);
  windshield.position.set(0, 1.16, -0.96);
  windshield.rotation.x = -0.32;
  taxi.add(windshield);

  // Rear Windshield
  const rearGlass = new THREE.Mesh(windshieldGeo, darkGlassMat);
  rearGlass.position.set(0, 1.16, 1.36);
  rearGlass.rotation.x = 0.32;
  taxi.add(rearGlass);

  // Side Windows with chrome divider frames
  const sideGlassGeo = new THREE.PlaneGeometry(1.88, 0.52);
  const leftGlass = new THREE.Mesh(sideGlassGeo, darkGlassMat);
  leftGlass.position.set(-0.87, 1.16, 0.2);
  leftGlass.rotation.y = -Math.PI / 2;

  const rightGlass = new THREE.Mesh(sideGlassGeo, darkGlassMat);
  rightGlass.position.set(0.87, 1.16, 0.2);
  rightGlass.rotation.y = Math.PI / 2;
  taxi.add(leftGlass, rightGlass);

  // (g) Illuminated "TAXI" Roof Box
  const signTex = createTaxiSignTexture();
  const signGeo = new THREE.BoxGeometry(0.75, 0.24, 0.32);
  const signMat = new THREE.MeshStandardMaterial({
    map: signTex,
    color: 0xffe040,
    emissive: 0xffaa00,
    emissiveIntensity: 0.6,
    metalness: 0.1
  });
  const roofSign = new THREE.Mesh(signGeo, signMat);
  roofSign.position.set(0, 1.64, 0.1);
  taxi.add(roofSign);

  // (h) Rear Boot & Vertical Tail Lights
  const bootGeo = new THREE.BoxGeometry(1.82, 0.44, 0.95);
  const boot = new THREE.Mesh(bootGeo, yellowPaint);
  boot.position.set(0, 0.7, 1.7);
  taxi.add(boot);

  [-0.72, 0.72].forEach((x) => {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 0.06), brakeMat);
    bl.position.set(x, 0.68, 2.22);
    taxi.add(bl);
    brakeLights.push(bl);
  });

  // (i) Vintage Heavy Chrome Bumpers with Dual Overrider Horns
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 0.18), chromeMat);
  frontBumper.position.set(0, 0.36, -2.26);

  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.18, 0.18), chromeMat);
  rearBumper.position.set(0, 0.36, 2.26);

  // Vertical Overrider Bumper Guards
  [-0.45, 0.45].forEach((x) => {
    const overriderF = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.12), chromeMat);
    overriderF.position.set(x, 0.42, -2.31);
    const overriderR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.12), chromeMat);
    overriderR.position.set(x, 0.42, 2.31);
    taxi.add(overriderF, overriderR);
  });

  taxi.add(frontBumper, rearBumper);

  // (j) 4 Ambassador Steel Pressed Wheels with Chrome Hubcaps
  const wheelPositions = [
    [-0.92, 0.38, -1.25], // Front Left
    [0.92, 0.38, -1.25],  // Front Right
    [-0.92, 0.38, 1.25],  // Rear Left
    [0.92, 0.38, 1.25]    // Rear Right
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createAmbassadorTaxiWheelMesh(0.38, 0.24);
    wheel.position.set(pos[0], pos[1], pos[2]);
    taxi.add(wheel);
    wheels.push(wheel);
  });

  return { group: taxi, wheels, brakeLights };
}

// 2. ICONIC KOLKATA PRIVATE BLUE BUS (Route 30C / 30C/1 - Bright Sky Blue & Golden Yellow Belt)
export function createKolkataRouteBus(): { group: THREE.Group; wheels: THREE.Mesh[]; brakeLights: THREE.Mesh[] } {
  const bus = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const brakeLights: THREE.Mesh[] = [];

  // Authentic Kolkata Private Bus Blue Livery
  const bluePaint = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Vibrant Sky / Royal Blue
    roughness: 0.3,
    metalness: 0.2
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    metalness: 0.9,
    roughness: 0.15
  });

  const tintedGlass = new THREE.MeshStandardMaterial({
    color: 0x0a1624,
    metalness: 0.85,
    roughness: 0.1,
    transparent: true,
    opacity: 0.84
  });

  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0xff1122,
    emissive: 0xee0011,
    emissiveIntensity: 0.9
  });

  const busLength = 10.8;
  const busWidth = 2.65;
  const busHeight = 3.25;

  // (a) Main Blue Body Chassis
  const bodyGeo = new THREE.BoxGeometry(busWidth, busHeight, busLength);
  const body = new THREE.Mesh(bodyGeo, bluePaint);
  body.position.y = busHeight / 2 + 0.45;
  bus.add(body);

  // (b) Authentic Yellow Waistband with Bengali Calligraphy "পিতৃ আশীর্বাদ" & "30C • 30C/1"
  const sideLiveryTex = createKolkataPrivateBusSideTexture();
  const sideBandGeo = new THREE.PlaneGeometry(busLength - 0.4, 0.65);
  const sideMat = new THREE.MeshBasicMaterial({ map: sideLiveryTex, transparent: true });

  const leftBand = new THREE.Mesh(sideBandGeo, sideMat);
  leftBand.position.set(-busWidth / 2 - 0.015, 1.45, 0);
  leftBand.rotation.y = -Math.PI / 2;

  const rightBand = new THREE.Mesh(sideBandGeo, sideMat);
  rightBand.position.set(busWidth / 2 + 0.015, 1.45, 0);
  rightBand.rotation.y = Math.PI / 2;

  bus.add(leftBand, rightBand);

  // (c) Front Destination Board: "30C HOWRAH STATION ⇄ ESPLANADE ⇄ BABUGHAT"
  const routeBoardTex = createBusMatrixTexture('30C HOWRAH STN ⇄ ESPLANADE', '৩০সি হাওড়া স্টেশন - ধর্মতলা - বাবুঘাট');
  const routeBoard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 0.55),
    new THREE.MeshBasicMaterial({ map: routeBoardTex })
  );
  routeBoard.position.set(0, busHeight + 0.08, -busLength / 2 - 0.02);
  bus.add(routeBoard);

  // (d) Curved Vintage Yellow Brow / Visor above windshield
  const browGeo = new THREE.BoxGeometry(busWidth, 0.22, 0.35);
  const browMat = new THREE.MeshStandardMaterial({ color: 0xfab005, roughness: 0.3 });
  const brow = new THREE.Mesh(browGeo, browMat);
  brow.position.set(0, busHeight - 0.15, -busLength / 2 - 0.1);
  bus.add(brow);

  // (e) Dual-Pane Front Windshield with Center Post
  [-0.6, 0.6].forEach((x) => {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), tintedGlass);
    pane.position.set(x, 2.25, -busLength / 2 - 0.02);
    bus.add(pane);
  });

  // (f) Classic Front Chrome Grille and Round Headlamps
  const grilleGeo = new THREE.BoxGeometry(1.65, 0.45, 0.1);
  const grille = new THREE.Mesh(grilleGeo, chromeMat);
  grille.position.set(0, 1.05, -busLength / 2 - 0.04);
  bus.add(grille);

  [-0.95, 0.95].forEach((x) => {
    const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 14), new THREE.MeshBasicMaterial({ color: 0xfffae6 }));
    hl.rotation.x = Math.PI / 2;
    hl.position.set(x, 1.08, -busLength / 2 - 0.05);

    const amberTurn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 10), new THREE.MeshBasicMaterial({ color: 0xff9900 }));
    amberTurn.rotation.x = Math.PI / 2;
    amberTurn.position.set(x, 0.82, -busLength / 2 - 0.05);

    bus.add(hl, amberTurn);
  });

  // Heavy Front Bumper with Red/White reflector markings
  const bumperGeo = new THREE.BoxGeometry(2.7, 0.25, 0.22);
  const bumper = new THREE.Mesh(bumperGeo, chromeMat);
  bumper.position.set(0, 0.55, -busLength / 2 - 0.1);
  bus.add(bumper);

  // (g) Multiple Large Passenger Windows along both sides (6 window bays)
  for (let w = -4; w <= 3.6; w += 1.5) {
    [-busWidth / 2 - 0.01, busWidth / 2 + 0.01].forEach((x) => {
      const winGeo = new THREE.PlaneGeometry(1.25, 0.85);
      const win = new THREE.Mesh(winGeo, tintedGlass);
      win.position.set(x, 2.35, w);
      win.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
      bus.add(win);
    });
  }

  // (h) Passenger Entry Door on Left Side (open doorway with grab handle)
  const doorHole = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 2.1),
    new THREE.MeshBasicMaterial({ color: 0x050d18 })
  );
  doorHole.position.set(-busWidth / 2 - 0.02, 1.55, -3.8);
  doorHole.rotation.y = -Math.PI / 2;
  bus.add(doorHole);

  // (i) Rear Tail Lights & License Plate
  [-0.95, 0.95].forEach((x) => {
    const bl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.08), brakeMat);
    bl.position.set(x, 1.35, busLength / 2 + 0.02);
    bus.add(bl);
    brakeLights.push(bl);
  });

  // (j) 6 Sturdy Bus Wheels (Dual Rear Axle)
  const busWheelPositions = [
    [-busWidth / 2 - 0.05, 0.52, -3.4], // Front Left
    [busWidth / 2 + 0.05, 0.52, -3.4],  // Front Right
    [-busWidth / 2 - 0.05, 0.52, 2.8],  // Rear Outer Left
    [-busWidth / 2 + 0.25, 0.52, 2.8],  // Rear Inner Left
    [busWidth / 2 + 0.05, 0.52, 2.8],   // Rear Outer Right
    [busWidth / 2 - 0.25, 0.52, 2.8]    // Rear Inner Right
  ];

  busWheelPositions.forEach((pos) => {
    const wheel = createWheelMesh(0.52, 0.28);
    wheel.position.set(pos[0], pos[1], pos[2]);
    bus.add(wheel);
    wheels.push(wheel);
  });

  return { group: bus, wheels, brakeLights };
}

// 2. KOLKATA 2050 STATE ELECTRIC DOUBLE-DECKER & EXPRESS BUS (CSTC/WBTC 2050)
export function createCityBus(): { group: THREE.Group; wheels: THREE.Mesh[]; brakeLights: THREE.Mesh[] } {
  const bus = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const brakeLights: THREE.Mesh[] = [];

  // Livery: Kolkata Royal Blue & Sky Cyan with White Roof
  const bluePaint = new THREE.MeshStandardMaterial({
    color: 0x003b8e,
    roughness: 0.3,
    metalness: 0.4
  });

  const cyanStripeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

  const whiteRoof = new THREE.MeshStandardMaterial({
    color: 0xf0f5fa,
    roughness: 0.3,
    metalness: 0.2
  });

  const tintedGlass = new THREE.MeshStandardMaterial({
    color: 0x081524,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });

  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0xff1122,
    emissive: 0xee0011,
    emissiveIntensity: 0.9
  });

  const busLength = 10.4;
  const busWidth = 2.65;
  const busHeight = 3.65;

  // (a) Main Dual-Tier Bus Body Chassis
  const bodyGeo = new THREE.BoxGeometry(busWidth, busHeight, busLength);
  const body = new THREE.Mesh(bodyGeo, bluePaint);
  body.position.y = busHeight / 2 + 0.4;
  bus.add(body);

  // (b) Aerodynamic White Roof with Rooftop HVAC & Battery Modules
  const roofCapGeo = new THREE.BoxGeometry(busWidth - 0.1, 0.35, busLength);
  const roofCap = new THREE.Mesh(roofCapGeo, whiteRoof);
  roofCap.position.y = busHeight + 0.45;
  bus.add(roofCap);

  // Roof Solar battery pack
  const hvacGeo = new THREE.BoxGeometry(1.8, 0.4, 3.2);
  const hvac = new THREE.Mesh(hvacGeo, new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.6 }));
  hvac.position.set(0, busHeight + 0.7, 0);
  bus.add(hvac);

  // (c) Horizontal Cyan Smart Artery Stripe
  const stripeGeo = new THREE.BoxGeometry(busWidth + 0.02, 0.22, busLength - 0.2);
  const stripe = new THREE.Mesh(stripeGeo, cyanStripeMat);
  stripe.position.y = 2.1;
  bus.add(stripe);

  // (d) Digital LED Destination Matrix Boards (Front & Rear)
  const matrixTex = createBusMatrixTexture('ROUTE 2050: HOWRAH ⇄ NEW TOWN', 'হাওড়া - সল্টলেক টেক হাব');
  const matrixMat = new THREE.MeshBasicMaterial({ map: matrixTex });
  const frontMatrix = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.5), matrixMat);
  frontMatrix.position.set(0, busHeight - 0.2, -busLength / 2 - 0.02);
  bus.add(frontMatrix);

  // (e) Panoramic Front Windshields (Upper & Lower Deck)
  const lowerWindshield = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.25), tintedGlass);
  lowerWindshield.position.set(0, 1.45, -busLength / 2 - 0.02);
  const upperWindshield = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.1), tintedGlass);
  upperWindshield.position.set(0, 2.9, -busLength / 2 - 0.02);
  bus.add(lowerWindshield, upperWindshield);

  // (f) Side Window Bands (Left & Right for both decks)
  const sideWindowGeo = new THREE.PlaneGeometry(busLength - 1.2, 0.9);
  [-1, 1].forEach((side) => {
    const lowerSideGlass = new THREE.Mesh(sideWindowGeo, tintedGlass);
    lowerSideGlass.position.set(side * (busWidth / 2 + 0.02), 1.5, 0.2);
    lowerSideGlass.rotation.y = (side * Math.PI) / 2;

    const upperSideGlass = new THREE.Mesh(sideWindowGeo, tintedGlass);
    upperSideGlass.position.set(side * (busWidth / 2 + 0.02), 2.9, 0.2);
    upperSideGlass.rotation.y = (side * Math.PI) / 2;

    bus.add(lowerSideGlass, upperSideGlass);
  });

  // (g) Headlights & Daytime Running Light Strips
  [-0.95, 0.95].forEach((x) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    hl.position.set(x, 0.75, -busLength / 2 - 0.02);
    bus.add(hl);
  });

  // (h) Rear Vertical Tail Brake Light Bars
  [-1.05, 1.05].forEach((x) => {
    const rl = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.06), brakeMat);
    rl.position.set(x, 2.0, busLength / 2 + 0.02);
    bus.add(rl);
    brakeLights.push(rl);
  });

  // (i) 6 Rubber Heavy-Duty Bus Wheels (Front single, Rear dual axles)
  const wheelZPositions = [-3.4, 2.4, 3.8];
  wheelZPositions.forEach((zPos) => {
    [-1.25, 1.25].forEach((xPos) => {
      const wheel = createWheelMesh(0.48, 0.32);
      wheel.position.set(xPos, 0.48, zPos);
      bus.add(wheel);
      wheels.push(wheel);
    });
  });

  return { group: bus, wheels, brakeLights };
}

// 3. SLEEK MODERN CYBER ELECTRIC SEDANS (Sports EVs)
export function createElectricSedan(colorHex: number): {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  brakeLights: THREE.Mesh[];
} {
  const car = new THREE.Group();
  const wheels: THREE.Mesh[] = [];
  const brakeLights: THREE.Mesh[] = [];

  const bodyPaint = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.7,
    roughness: 0.2
  });

  const blackTrim = new THREE.MeshStandardMaterial({
    color: 0x0a0f16,
    metalness: 0.8,
    roughness: 0.3
  });

  const tintedCanopy = new THREE.MeshStandardMaterial({
    color: 0x050e18,
    metalness: 0.95,
    roughness: 0.05,
    transparent: true,
    opacity: 0.9
  });

  const headlightMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const brakeMat = new THREE.MeshStandardMaterial({
    color: 0xff0022,
    emissive: 0xff0022,
    emissiveIntensity: 0.9
  });

  // Sleek Aerodynamic Wedge Lower Body
  const bodyGeo = new THREE.BoxGeometry(1.9, 0.5, 4.3);
  const body = new THREE.Mesh(bodyGeo, bodyPaint);
  body.position.y = 0.5;
  car.add(body);

  // Sloping Aerodynamic Fastback Glass Canopy
  const canopyGeo = new THREE.BoxGeometry(1.5, 0.55, 2.4);
  const canopy = new THREE.Mesh(canopyGeo, tintedCanopy);
  canopy.position.set(0, 0.95, 0.1);
  car.add(canopy);

  // Lower Side Skirts
  const skirtGeo = new THREE.BoxGeometry(1.95, 0.14, 4.0);
  const skirt = new THREE.Mesh(skirtGeo, blackTrim);
  skirt.position.y = 0.25;
  car.add(skirt);

  // Continuous Full-Width LED Headlight Strip
  const frontLight = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.06), headlightMat);
  frontLight.position.set(0, 0.56, -2.16);
  car.add(frontLight);

  // Continuous Full-Width Rear LED Brake Bar
  const rearLight = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.06), brakeMat);
  rearLight.position.set(0, 0.56, 2.16);
  car.add(rearLight);
  brakeLights.push(rearLight);

  // 4 Low-Profile Sports Alloy Wheels
  const wheelPositions = [
    [-0.92, 0.36, -1.3],
    [0.92, 0.36, -1.3],
    [-0.92, 0.36, 1.3],
    [0.92, 0.36, 1.3]
  ];

  wheelPositions.forEach((pos) => {
    const wheel = createWheelMesh(0.36, 0.26);
    wheel.position.set(pos[0], pos[1], pos[2]);
    car.add(wheel);
    wheels.push(wheel);
  });

  return { group: car, wheels, brakeLights };
}

// 4. MUMBAI-STYLE SKYLINE MONORAIL / ELEVATED TRANSIT TRAIN
export function createSkylineMonorail(): { group: THREE.Group } {
  const monorail = new THREE.Group();

  // Silver pearl & Mumbai Monorail turquoise teal livery
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xecf0f5,
    metalness: 0.85,
    roughness: 0.2
  });

  const tealStripeMat = new THREE.MeshBasicMaterial({ color: 0x00c8b3 });
  const neonBlueMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });

  const darkGlass = new THREE.MeshStandardMaterial({
    color: 0x071524,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });

  const undercarriageMat = new THREE.MeshStandardMaterial({
    color: 0x16202c,
    metalness: 0.9,
    roughness: 0.4
  });

  const matrixTex = createMonorailMatrixTexture();
  const matrixMat = new THREE.MeshBasicMaterial({ map: matrixTex });

  const numCars = 4;
  const carLength = 8.5;
  const carWidth = 3.1;
  const carHeight = 2.8;

  for (let c = 0; c < numCars; c++) {
    const carGroup = new THREE.Group();
    const zOffset = (c - (numCars - 1) / 2) * (carLength + 0.6);
    carGroup.position.z = zOffset;

    const isLeadCar = c === 0;
    const isTailCar = c === numCars - 1;

    // (a) Main Car Aerodynamic Shell
    const carMesh = new THREE.Mesh(new THREE.BoxGeometry(carWidth, carHeight, carLength), shellMat);
    carMesh.position.y = 1.4;
    carGroup.add(carMesh);

    // (b) Aerodynamic Bullet Nose on Lead & Tail Cars (Like Mumbai Monorail / Shinkansen nose)
    if (isLeadCar) {
      const noseGeo = new THREE.ConeGeometry(1.6, 2.2, 4);
      const nose = new THREE.Mesh(noseGeo, shellMat);
      nose.rotation.x = Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 1.3, -carLength / 2 - 0.9);
      carGroup.add(nose);

      // Wrap-around Pilot Windshield
      const pilotGlass = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.2), darkGlass);
      pilotGlass.position.set(0, 1.7, -carLength / 2 - 0.4);
      carGroup.add(pilotGlass);

      // High-Beam Projector Headlights
      const headlight = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.1), neonBlueMat);
      headlight.position.set(0, 0.8, -carLength / 2 - 1.2);
      carGroup.add(headlight);
    } else if (isTailCar) {
      const tailGeo = new THREE.ConeGeometry(1.6, 2.0, 4);
      const tail = new THREE.Mesh(tailGeo, shellMat);
      tail.rotation.x = -Math.PI / 2;
      tail.rotation.y = Math.PI / 4;
      tail.position.set(0, 1.3, carLength / 2 + 0.8);
      carGroup.add(tail);

      // Red Tail Marker
      const tailLight = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.25, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0022 })
      );
      tailLight.position.set(0, 0.8, carLength / 2 + 1.1);
      carGroup.add(tailLight);
    }

    // (c) Horizontal Teal & Cyan Skyline Stripe
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(carWidth + 0.04, 0.4, carLength), tealStripeMat);
    stripe.position.y = 1.1;
    carGroup.add(stripe);

    // (d) Panoramic Passenger Window Bands on both sides
    [-1, 1].forEach((side) => {
      const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(carLength - 1.2, 0.8), darkGlass);
      sideGlass.position.set(side * (carWidth / 2 + 0.02), 1.7, 0);
      sideGlass.rotation.y = (side * Math.PI) / 2;
      carGroup.add(sideGlass);
    });

    // (e) Digital Route Display Screen on Side of Lead & Mid cars
    if (c === 1) {
      const displayScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), matrixMat);
      displayScreen.position.set(carWidth / 2 + 0.03, 1.1, 0);
      displayScreen.rotation.y = Math.PI / 2;
      carGroup.add(displayScreen);
    }

    // (f) Monorail Bogies Straddling the Concrete Central Guideway Beam
    const bogieGeo = new THREE.BoxGeometry(carWidth - 0.4, 0.9, 3.2);
    const bogie = new THREE.Mesh(bogieGeo, undercarriageMat);
    bogie.position.y = -0.3;
    carGroup.add(bogie);

    // Glowing blue magnetic levitation / induction skirts
    const maglevSkirt = new THREE.Mesh(new THREE.BoxGeometry(carWidth - 0.2, 0.12, 3.4), neonBlueMat);
    maglevSkirt.position.y = -0.65;
    carGroup.add(maglevSkirt);

    // (g) Accordion Inter-Car Bellows Joint between coaches
    if (c < numCars - 1) {
      const bellowGeo = new THREE.BoxGeometry(2.7, 2.5, 0.65);
      const bellowMat = new THREE.MeshStandardMaterial({ color: 0x111620, roughness: 0.9 });
      const bellow = new THREE.Mesh(bellowGeo, bellowMat);
      bellow.position.set(0, 1.4, carLength / 2 + 0.32);
      carGroup.add(bellow);
    }

    monorail.add(carGroup);
  }

  return { group: monorail };
}

// 5. MODERNIZED KOLKATA HERITAGE TRAM 2.0 (Dual-Car Low Floor Light Rail)
export function createHeritageTram2050(): { group: THREE.Group; wheels: THREE.Mesh[] } {
  const tram = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  // Kolkata Tram Heritage White & Sky Blue
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf6f9fd,
    roughness: 0.3,
    metalness: 0.3
  });

  const skyBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0099e6,
    roughness: 0.3,
    metalness: 0.4
  });

  const darkGlass = new THREE.MeshStandardMaterial({
    color: 0x0a1420,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85
  });

  const matrixTex = createBusMatrixTexture('KOLKATA SMART TRAMWAY 2050', 'ঐতিহ্যবাহী পরিবেশ-বান্ধব ট্রাম');
  const matrixMat = new THREE.MeshBasicMaterial({ map: matrixTex });

  // 2 Articulated Cars
  for (let c = 0; c < 2; c++) {
    const car = new THREE.Group();
    const zPos = (c === 0 ? -4.2 : 4.2);
    car.position.z = zPos;

    // (a) Lower Body (Sky Blue)
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.1, 7.8), skyBlueMat);
    lowerBody.position.y = 0.75;
    car.add(lowerBody);

    // (b) Upper Cabin & Roof (Heritage White)
    const upperRoof = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.3, 7.6), whiteMat);
    upperRoof.position.y = 1.95;
    car.add(upperRoof);

    // (c) Panoramic Tram Windows
    [-1, 1].forEach((side) => {
      const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 0.9), darkGlass);
      sideGlass.position.set(side * (2.35 / 2 + 0.02), 1.8, 0);
      sideGlass.rotation.y = (side * Math.PI) / 2;
      car.add(sideGlass);
    });

    // Destination Sign on front of Car 0 and rear of Car 1
    if (c === 0) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), matrixMat);
      sign.position.set(0, 2.3, -4.0);
      car.add(sign);

      // Headlights
      const hl = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0xfffae6 }));
      hl.position.set(0, 0.65, -4.01);
      car.add(hl);
    }

    // Rooftop Pantograph assembly on Car 0
    if (c === 0) {
      const pantoGroup = new THREE.Group();
      pantoGroup.position.set(0, 2.7, -1.0);
      const pantoMat = new THREE.MeshStandardMaterial({ color: 0xccd4dd, metalness: 0.9 });

      const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), pantoMat);
      arm1.rotation.x = -0.6;
      arm1.position.set(0, 0.5, 0.3);

      const arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4), pantoMat);
      arm2.rotation.x = 0.6;
      arm2.position.set(0, 1.2, 0.7);

      const collector = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.2), pantoMat);
      collector.position.set(0, 1.7, 1.0);

      pantoGroup.add(arm1, arm2, collector);
      car.add(pantoGroup);
    }

    // Tram Wheels (Steel Rail Bogie)
    [-2.2, 2.2].forEach((wz) => {
      [-1.05, 1.05].forEach((wx) => {
        const wheel = createWheelMesh(0.36, 0.22);
        wheel.position.set(wx, 0.36, wz);
        car.add(wheel);
        wheels.push(wheel);
      });
    });

    tram.add(car);
  }

  // Inter-car articulation joint
  const jointGeo = new THREE.BoxGeometry(2.1, 2.2, 0.8);
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 0.9 });
  const joint = new THREE.Mesh(jointGeo, jointMat);
  joint.position.set(0, 1.3, 0);
  tram.add(joint);

  return { group: tram, wheels };
}
