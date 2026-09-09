import * as THREE from 'three';
import { POI, ScenarioDefinition } from '../types';
import { audioEngine } from './audio';

export interface InteractiveHologram {
  mesh: THREE.Mesh;
  type: 'intro_button' | 'poi' | 'scenario_card' | 'tutorial_card';
  data?: unknown;
  onHover?: (hovered: boolean) => void;
  onSelect?: () => void;
}

// Helper to create holographic card texture
export function renderHolographicCardTexture(
  title: string,
  subtitle: string,
  body: string,
  badge?: string,
  accentColor = '#00f0ff',
  width = 512,
  height = 340
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Translucent sci-fi cyber glass background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, 'rgba(8, 20, 36, 0.88)');
  bgGrad.addColorStop(1, 'rgba(4, 10, 20, 0.94)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer glowing border
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Inner subtle grid lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 1;
  for (let y = 30; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(10, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  }

  // Corner tech notches
  ctx.fillStyle = accentColor;
  ctx.fillRect(4, 4, 20, 5);
  ctx.fillRect(4, 4, 5, 20);
  ctx.fillRect(width - 24, 4, 20, 5);
  ctx.fillRect(width - 9, 4, 5, 20);
  ctx.fillRect(4, height - 9, 20, 5);
  ctx.fillRect(4, height - 24, 5, 20);
  ctx.fillRect(width - 24, height - 9, 20, 5);
  ctx.fillRect(width - 9, height - 24, 5, 20);

  let yOffset = 42;

  // Optional Badge
  if (badge) {
    ctx.fillStyle = accentColor;
    ctx.font = '700 13px "Rajdhani", sans-serif';
    const badgeWidth = ctx.measureText(badge.toUpperCase()).width + 20;
    ctx.fillRect(24, yOffset - 14, badgeWidth, 20);
    ctx.fillStyle = '#020b14';
    ctx.fillText(badge.toUpperCase(), 34, yOffset);
    yOffset += 32;
  }

  // Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.fillText(title, 24, yOffset);
  yOffset += 26;

  // Subtitle
  ctx.fillStyle = accentColor;
  ctx.font = '600 14px "Rajdhani", sans-serif';
  ctx.fillText(subtitle.toUpperCase(), 24, yOffset);
  yOffset += 28;

  // Divider line
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(24, yOffset);
  ctx.lineTo(width - 24, yOffset);
  ctx.stroke();
  yOffset += 22;

  // Body text (word wrapped)
  ctx.fillStyle = '#d0e4f5';
  ctx.font = '15px "Space Grotesk", sans-serif';
  const words = body.split(' ');
  let line = '';
  const maxWidth = width - 48;
  const lineHeight = 22;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 24, yOffset);
      line = words[n] + ' ';
      yOffset += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 24, yOffset);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Holographic Button Texture
export function renderHolographicButtonTexture(
  text: string,
  isHovered = false,
  width = 380,
  height = 100
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const baseCol = isHovered ? 'rgba(0, 240, 255, 0.45)' : 'rgba(0, 160, 220, 0.2)';
  const borderCol = isHovered ? '#ffffff' : '#00f0ff';

  ctx.fillStyle = baseCol;
  ctx.fillRect(4, 4, width - 8, height - 8);

  ctx.strokeStyle = borderCol;
  ctx.lineWidth = isHovered ? 4 : 2;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Chevron brackets
  ctx.fillStyle = borderCol;
  ctx.font = 'bold 24px monospace';
  ctx.fillText('[', 24, height / 2 + 8);
  ctx.fillText(']', width - 36, height / 2 + 8);

  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isHovered ? '#ffffff' : '#00f0ff';
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export class HologramSystem {
  public group = new THREE.Group();
  public interactives: InteractiveHologram[] = [];
  private animatedElements: { mesh: THREE.Object3D; update: (elapsed: number) => void }[] = [];

  // Scene 1 Cinematic Intro Panel
  private introPanel: THREE.Group | null = null;
  private introButtonMesh: THREE.Mesh | null = null;

  // Scene 3 POI Marker Meshes
  private poiCards: Map<string, THREE.Group> = new Map();

  // Floating Controller Tutorial
  private tutorialGroup: THREE.Group | null = null;

  constructor() {
    this.group.name = 'HologramSystem';
  }

  public createIntroHologram(onEnterCity: () => void): THREE.Group {
    const introGroup = new THREE.Group();
    introGroup.position.set(0, 22, 50);

    // 1. Holographic Title Card
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d')!;

    // Translucent dark glass
    ctx.fillStyle = 'rgba(5, 12, 24, 0.9)';
    ctx.fillRect(0, 0, 640, 360);

    // Glowing cyan/amber borders
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 628, 348);

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00f0ff';
    ctx.font = '700 16px "Rajdhani", sans-serif';
    ctx.fillText('UNIVERSITY STEM EXHIBITION // CLIMATE RESILIENCE SIMULATION', 320, 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Cinzel", "Space Grotesk", sans-serif';
    ctx.fillText('KOLKATA 2050', 320, 115);

    ctx.fillStyle = '#ffbb00';
    ctx.font = '700 20px "Rajdhani", sans-serif';
    ctx.fillText('EXPERIENCE THE CITY OF TOMORROW', 320, 160);

    ctx.fillStyle = '#a0c4e2';
    ctx.font = '16px "Space Grotesk", sans-serif';
    ctx.fillText('Welcome to Kolkata, 2050.', 320, 215);
    ctx.fillText('Your journey begins now.', 320, 245);

    ctx.fillStyle = '#4a7a99';
    ctx.font = '13px "Space Grotesk", sans-serif';
    ctx.fillText('WebXR Immersive VR • Procedural 3D Environment • Spatial Audio', 320, 305);

    const titleTex = new THREE.CanvasTexture(canvas);
    const titlePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 3.0),
      new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, side: THREE.DoubleSide })
    );
    titlePlane.position.set(0, 1.8, 0);
    introGroup.add(titlePlane);

    // 2. Interactive Holographic Button [ ENTER KOLKATA 2050 ]
    const btnTex = renderHolographicButtonTexture('ENTER KOLKATA 2050', false);
    const btnMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.95),
      new THREE.MeshBasicMaterial({ map: btnTex, transparent: true, side: THREE.DoubleSide })
    );
    btnMesh.position.set(0, -0.6, 0.1);
    introGroup.add(btnMesh);
    this.introButtonMesh = btnMesh;

    const interactiveBtn: InteractiveHologram = {
      mesh: btnMesh,
      type: 'intro_button',
      onHover: (hovered) => {
        btnMesh.material.map = renderHolographicButtonTexture('ENTER KOLKATA 2050', hovered);
        btnMesh.material.needsUpdate = true;
        btnMesh.scale.setScalar(hovered ? 1.05 : 1.0);
      },
      onSelect: () => {
        audioEngine.playButtonClick();
        onEnterCity();
      }
    };
    this.interactives.push(interactiveBtn);

    // Floating pulsing rings around intro frame
    const ringGeo = new THREE.RingGeometry(2.8, 2.85, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0.8, -0.1);
    introGroup.add(ring);

    this.animatedElements.push({
      mesh: ring,
      update: (elapsed) => {
        ring.rotation.z = elapsed * 0.4;
        ring.scale.setScalar(1.0 + Math.sin(elapsed * 2.0) * 0.05);
      }
    });

    this.introPanel = introGroup;
    this.group.add(introGroup);
    return introGroup;
  }

  public hideIntro() {
    if (this.introPanel) {
      this.introPanel.visible = false;
    }
  }

  public showIntro() {
    if (this.introPanel) {
      this.introPanel.visible = true;
    }
  }

  // VR Controller Floating Instructions Tutorial
  public createVRControllerTutorial(playerPos: THREE.Vector3): THREE.Group {
    if (this.tutorialGroup) {
      this.group.remove(this.tutorialGroup);
    }

    const tutGroup = new THREE.Group();
    tutGroup.position.set(playerPos.x, playerPos.y + 0.8, playerPos.z - 1.8);

    const canvas = document.createElement('canvas');
    canvas.width = 440;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(6, 18, 30, 0.92)';
    ctx.fillRect(0, 0, 440, 240);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 432, 232);

    ctx.fillStyle = '#00f0ff';
    ctx.font = '700 14px "Rajdhani", sans-serif';
    ctx.fillText('VR CONTROLLER GUIDE', 20, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Space Grotesk", sans-serif';
    ctx.fillText('• Point + Trigger  →  Teleport on Ground', 20, 72);
    ctx.fillText('• Trigger            →  Select Hologram / Button', 20, 106);
    ctx.fillText('• Thumbstick Up/Down → Smooth Walk', 20, 140);
    ctx.fillText('• Thumbstick L/R     → Snap Turn (45°)', 20, 174);

    ctx.fillStyle = '#6ab0db';
    ctx.font = '12px "Space Grotesk", sans-serif';
    ctx.fillText('[Desktop: WASD = Move | Mouse = Look | Click = Raycast]', 20, 212);

    const tex = new THREE.CanvasTexture(canvas);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.9),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
    );
    tutGroup.add(plane);

    this.tutorialGroup = tutGroup;
    this.group.add(tutGroup);

    // Auto-fade after 8 seconds
    setTimeout(() => {
      if (this.tutorialGroup) {
        this.tutorialGroup.visible = false;
      }
    }, 9000);

    return tutGroup;
  }

  // Create Interactive Points of Interest (POIs)
  public createPOIMarkers(pois: POI[]) {
    pois.forEach((poi) => {
      const poiGroup = new THREE.Group();
      poiGroup.position.set(poi.position[0], poi.position[1], poi.position[2]);

      // Pulsing beacon ring
      const ringGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      poiGroup.add(ringMesh);

      // Holographic Diamond/Icon marker
      const diamondGeo = new THREE.OctahedronGeometry(0.35, 0);
      const diamondMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.y = 0.8;
      poiGroup.add(diamond);

      // "EXPLORE" floating sign
      const tagCanvas = document.createElement('canvas');
      tagCanvas.width = 256;
      tagCanvas.height = 70;
      const tagCtx = tagCanvas.getContext('2d')!;
      tagCtx.fillStyle = 'rgba(4, 16, 28, 0.85)';
      tagCtx.fillRect(0, 0, 256, 70);
      tagCtx.strokeStyle = '#00f0ff';
      tagCtx.lineWidth = 2;
      tagCtx.strokeRect(2, 2, 252, 66);
      tagCtx.fillStyle = '#00f0ff';
      tagCtx.font = '700 18px "Rajdhani", sans-serif';
      tagCtx.textAlign = 'center';
      tagCtx.fillText('EXPLORE', 128, 28);
      tagCtx.fillStyle = '#ffffff';
      tagCtx.font = '12px "Space Grotesk", sans-serif';
      tagCtx.fillText(poi.bengaliName, 128, 52);

      const tagTex = new THREE.CanvasTexture(tagCanvas);
      const tagMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 0.45),
        new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, side: THREE.DoubleSide })
      );
      tagMesh.position.y = 1.5;
      poiGroup.add(tagMesh);

      // Expanded Detail Card (Initially hidden)
      const detailTex = renderHolographicCardTexture(
        poi.name,
        poi.bengaliName,
        `${poi.description}\n\nDid You Know?\n${poi.didYouKnow}`,
        poi.category.toUpperCase(),
        poi.category === 'nature' ? '#00ff88' : (poi.category === 'energy' ? '#ffaa00' : '#00f3ff')
      );
      const detailPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(3.0, 2.0),
        new THREE.MeshBasicMaterial({ map: detailTex, transparent: true, side: THREE.DoubleSide })
      );
      detailPlane.position.set(0, 2.8, 0);
      detailPlane.visible = false;
      poiGroup.add(detailPlane);
      this.poiCards.set(poi.id, poiGroup);

      // Interactive trigger on marker
      const hitBox = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 3.5, 2.0),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      poiGroup.add(hitBox);

      let isExpanded = false;
      const interactive: InteractiveHologram = {
        mesh: hitBox,
        type: 'poi',
        data: poi,
        onHover: (hovered) => {
          diamond.scale.setScalar(hovered ? 1.3 : 1.0);
          diamondMat.color.setHex(hovered ? 0xffffff : 0xffaa00);
        },
        onSelect: () => {
          isExpanded = !isExpanded;
          detailPlane.visible = isExpanded;
          audioEngine.playHologramOpen();
        }
      };
      this.interactives.push(interactive);

      this.animatedElements.push({
        mesh: diamond,
        update: (elapsed) => {
          diamond.rotation.y = elapsed * 1.5;
          diamond.position.y = 0.8 + Math.sin(elapsed * 2.5) * 0.12;
          ringMesh.scale.setScalar(1.0 + Math.sin(elapsed * 3.0) * 0.1);
        }
      });

      this.group.add(poiGroup);
    });
  }

  // Update Billboarding so holograms face player camera
  public update(elapsed: number, playerPos: THREE.Vector3) {
    this.animatedElements.forEach((el) => {
      el.update(elapsed);
    });

    // Make floating POI cards face the player
    this.poiCards.forEach((poiGroup) => {
      poiGroup.lookAt(playerPos.x, poiGroup.position.y, playerPos.z);
    });

    if (this.tutorialGroup && this.tutorialGroup.visible) {
      this.tutorialGroup.lookAt(playerPos.x, this.tutorialGroup.position.y, playerPos.z);
    }
  }
}
