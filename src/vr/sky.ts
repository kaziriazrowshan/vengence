import * as THREE from 'three';

export type SkyMode = 'real_world_blue' | 'howrah_twilight' | 'monsoon_storm';

export interface SkySystem {
  skyDome: THREE.Mesh;
  cloudGroup: THREE.Group;
  update: (delta: number, elapsed: number) => void;
  setMode: (mode: SkyMode) => void;
  currentMode: SkyMode;
}

// Generate high-resolution procedural realistic sky textures
function createRealWorldBlueSkyCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Atmosphere Gradient: Real World Daylight Blue Sky
  // Zenith (top of dome) to Horizon (middle of canvas) to Sub-horizon ground
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, '#105fb3');   // Deep azure zenith
  grad.addColorStop(0.18, '#1e7cd6');  // Pure daylight cobalt
  grad.addColorStop(0.38, '#439be8');  // Rich bright cerulean
  grad.addColorStop(0.58, '#7bb8f1');  // Atmospheric light blue
  grad.addColorStop(0.74, '#b0d6f8');  // Soft low-sky haze
  grad.addColorStop(0.85, '#d6ebfc');  // Horizon atmospheric scattering
  grad.addColorStop(0.92, '#fff6e5');  // Warm solar horizon glow
  grad.addColorStop(1.0, '#2d4459');   // Ground/sub-horizon rim

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Solar Glare / Lens Radiance in upper quadrant
  const sunX = 720;
  const sunY = 240;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 320);
  sunGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  sunGrad.addColorStop(0.1, 'rgba(255, 250, 225, 0.65)');
  sunGrad.addColorStop(0.3, 'rgba(255, 240, 200, 0.25)');
  sunGrad.addColorStop(0.6, 'rgba(230, 245, 255, 0.08)');
  sunGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 320, 0, Math.PI * 2);
  ctx.fill();

  // 3. Realistic Procedural Cumulus Cloud Clusters
  const drawCloudPuff = (cx: number, cy: number, r: number, alpha = 0.5) => {
    const puffGrad = ctx.createRadialGradient(cx, cy - r * 0.25, r * 0.1, cx, cy, r);
    puffGrad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
    puffGrad.addColorStop(0.4, `rgba(250, 252, 255, ${alpha * 0.85})`);
    puffGrad.addColorStop(0.75, `rgba(225, 238, 248, ${alpha * 0.5})`);
    puffGrad.addColorStop(1.0, 'rgba(210, 230, 245, 0)');
    ctx.fillStyle = puffGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCumulusBank = (baseX: number, baseY: number, scale: number) => {
    const puffs = [
      { x: 0, y: 0, r: 45 },
      { x: 35, y: -12, r: 52 },
      { x: 75, y: -22, r: 65 },
      { x: 120, y: -15, r: 55 },
      { x: 155, y: 5, r: 42 },
      { x: 50, y: 15, r: 38 },
      { x: 100, y: 12, r: 44 }
    ];

    // Shaded base first
    ctx.save();
    puffs.forEach((p) => {
      const cx = baseX + p.x * scale;
      const cy = baseY + (p.y + 12) * scale;
      const r = p.r * scale;
      const baseGrad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
      baseGrad.addColorStop(0.0, 'rgba(180, 202, 222, 0.45)');
      baseGrad.addColorStop(0.7, 'rgba(195, 215, 232, 0.25)');
      baseGrad.addColorStop(1.0, 'rgba(215, 230, 245, 0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sunlit bright white tops
    puffs.forEach((p) => {
      drawCloudPuff(baseX + p.x * scale, baseY + p.y * scale, p.r * scale, 0.72);
    });
    ctx.restore();
  };

  // Draw natural scattered clouds across the sky
  drawCumulusBank(120, 360, 1.4);
  drawCumulusBank(480, 310, 1.8);
  drawCumulusBank(820, 390, 1.3);
  drawCumulusBank(280, 480, 1.1);
  drawCumulusBank(650, 470, 1.2);
  drawCumulusBank(50, 520, 0.9);

  // Soft high-altitude wispy cirrus streaks near zenith
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  for (let c = 0; c < 12; c++) {
    const sx = (c * 95) % 1024;
    const sy = 80 + (c * 22) % 180;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + 90, sy - 15, sx + 180, sy + 25, sx + 260, sy + 5);
    ctx.stroke();
  }

  return canvas;
}

// Twilight Howrah Bridge Golden Hour sky (matching user's bridge photo)
function createHowrahTwilightCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, '#0c1a2f');   // Deep twilight sapphire
  grad.addColorStop(0.25, '#162e4e');
  grad.addColorStop(0.48, '#264a6d');  // Steel dusk blue
  grad.addColorStop(0.68, '#4f5e74');  // Atmospheric grey-blue transition
  grad.addColorStop(0.80, '#9e624d');  // Warm terracotta sunset
  grad.addColorStop(0.89, '#e0833a');  // Radiant orange horizon band
  grad.addColorStop(0.96, '#f7b05b');  // Golden dusk reflection
  grad.addColorStop(1.0, '#1a2636');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Dusk clouds glowing with under-lighting from the setting sun
  const drawDuskCloud = (x: number, y: number, w: number, h: number) => {
    const cloudGrad = ctx.createRadialGradient(x, y, 10, x, y, w);
    cloudGrad.addColorStop(0.0, 'rgba(242, 160, 95, 0.55)');
    cloudGrad.addColorStop(0.5, 'rgba(150, 95, 80, 0.35)');
    cloudGrad.addColorStop(0.8, 'rgba(60, 75, 95, 0.2)');
    cloudGrad.addColorStop(1.0, 'rgba(25, 45, 65, 0)');
    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  drawDuskCloud(220, 680, 180, 35);
  drawDuskCloud(620, 660, 240, 42);
  drawDuskCloud(880, 710, 160, 30);
  drawDuskCloud(420, 580, 140, 25);

  return canvas;
}

// Monsoon storm overcast sky
function createMonsoonCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, '#101720');
  grad.addColorStop(0.35, '#1e2b38');
  grad.addColorStop(0.7, '#2b3b4a');
  grad.addColorStop(0.9, '#3a4e60');
  grad.addColorStop(1.0, '#16212b');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  return canvas;
}

export function buildSkySystem(): SkySystem {
  // Pre-generate textures
  const blueSkyCanvas = createRealWorldBlueSkyCanvas();
  const twilightCanvas = createHowrahTwilightCanvas();
  const monsoonCanvas = createMonsoonCanvas();

  const blueSkyTexture = new THREE.CanvasTexture(blueSkyCanvas);
  const twilightTexture = new THREE.CanvasTexture(twilightCanvas);
  const monsoonTexture = new THREE.CanvasTexture(monsoonCanvas);

  blueSkyTexture.wrapS = THREE.RepeatWrapping;
  blueSkyTexture.wrapT = THREE.ClampToEdgeWrapping;

  const skyGeo = new THREE.SphereGeometry(600, 48, 24);
  const skyMat = new THREE.MeshBasicMaterial({
    map: blueSkyTexture,
    side: THREE.BackSide,
    depthWrite: false
  });

  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.name = 'KolkataRealWorldSkyDome';

  // 3D Procedural Drifting Clouds Layer (floating high above the city)
  const cloudGroup = new THREE.Group();
  cloudGroup.name = 'DriftingCumulusClouds';

  // Generate 24 soft volumetric cloud puffs across the city expanse
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    metalness: 0.05,
    transparent: true,
    opacity: 0.78,
    depthWrite: false
  });

  const cloudPuffs: { mesh: THREE.Mesh; basePos: THREE.Vector3; speed: number }[] = [];

  for (let i = 0; i < 28; i++) {
    const cloudCluster = new THREE.Group();
    const clusterSize = 3 + Math.floor(Math.random() * 4);

    for (let p = 0; p < clusterSize; p++) {
      const radius = 12 + Math.random() * 16;
      const puffGeo = new THREE.DodecahedronGeometry(radius, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 32
      );
      puff.scale.set(1.4, 0.45, 1.2);
      clusterClusterPuff(puff);
      cloudCluster.add(puff);
    }

    const x = (Math.random() - 0.5) * 480;
    const y = 135 + Math.random() * 35;
    const z = (Math.random() - 0.5) * 480;
    cloudCluster.position.set(x, y, z);
    cloudGroup.add(cloudCluster);

    cloudPuffs.push({
      mesh: cloudCluster as unknown as THREE.Mesh,
      basePos: new THREE.Vector3(x, y, z),
      speed: 1.2 + Math.random() * 1.5
    });
  }

  function clusterClusterPuff(mesh: THREE.Mesh) {
    mesh.rotation.y = Math.random() * Math.PI;
  }

  let currentMode: SkyMode = 'real_world_blue';

  const setMode = (mode: SkyMode) => {
    currentMode = mode;
    if (mode === 'real_world_blue') {
      skyMat.map = blueSkyTexture;
      cloudMat.color.setHex(0xffffff);
      cloudMat.opacity = 0.8;
      cloudGroup.visible = true;
    } else if (mode === 'howrah_twilight') {
      skyMat.map = twilightTexture;
      cloudMat.color.setHex(0xf2a468);
      cloudMat.opacity = 0.55;
      cloudGroup.visible = true;
    } else {
      skyMat.map = monsoonTexture;
      cloudMat.color.setHex(0x405060);
      cloudMat.opacity = 0.9;
      cloudGroup.visible = true;
    }
    skyMat.needsUpdate = true;
  };

  const update = (delta: number, _elapsed: number) => {
    // Slowly drift clouds across the sky
    cloudPuffs.forEach((cp) => {
      cp.mesh.position.x += cp.speed * delta;
      if (cp.mesh.position.x > 260) {
        cp.mesh.position.x = -260;
      }
    });

    // Very gentle slow rotation of sky dome for infinite sky life
    skyDome.rotation.y += delta * 0.0012;
  };

  return {
    skyDome,
    cloudGroup,
    update,
    setMode,
    currentMode
  };
}
