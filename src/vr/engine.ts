import * as THREE from 'three';
import { SCENARIOS, POINTS_OF_INTEREST } from './scenarios';
import { ScenarioId, ScenarioDefinition, PreviewMode, TourWaypointInfo } from '../types';
import { buildKolkata2050City, CityEnvironment } from './city';
import { HologramSystem } from './hologram';
import { LocomotionManager } from './locomotion';
import { audioEngine } from './audio';

export interface EngineCallbacks {
  onScenarioChange: (scenario: ScenarioDefinition) => void;
  onAudioToggle: (isMuted: boolean) => void;
  onVRStatusChange: (isSupported: boolean, isPresenting: boolean) => void;
  onPreviewModeChange?: (mode: PreviewMode) => void;
  onTourWaypointChange?: (info: TourWaypointInfo) => void;
}

interface TourWaypoint {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  name: string;
  bengaliName: string;
  insight: string;
}

const TOUR_WAYPOINTS: TourWaypoint[] = [
  {
    pos: new THREE.Vector3(0, 24, 85),
    look: new THREE.Vector3(0, 18, -40),
    name: 'Howrah Bridge 2050 & Riverfront',
    bengaliName: 'হাওড়া সেতু ২.০ ও হুগলি নদী',
    insight: 'Iconic cantilever bridge reinforced with carbon nanotubes & acoustic tidal dampers.'
  },
  {
    pos: new THREE.Vector3(18, 14, -40),
    look: new THREE.Vector3(-10, 10, 15),
    name: 'Cantilever Arches & Floating Bio-Aqueduct',
    bengaliName: 'হাওড়া খিলান ও ভাসমান জলাভূমি',
    insight: 'Floating wetlands naturally filter urban runoff while automated water taxis glide below.'
  },
  {
    pos: new THREE.Vector3(-22, 16, -10),
    look: new THREE.Vector3(0, 10, 25),
    name: 'Elevated Sky-Metro Transit Line',
    bengaliName: 'উন্নত আকাশ-মেট্রো রুট',
    insight: 'Regenerative magnetic levitation connecting Salt Lake to Howrah in 8 minutes.'
  },
  {
    pos: new THREE.Vector3(0, 3.2, 15),
    look: new THREE.Vector3(0, 3.2, -60),
    name: 'Smart Boulevard & Eco-Trams',
    bengaliName: 'স্মার্ট সরণি ও সৌর ট্রাম',
    insight: 'Underground sponge-city surge aquifers and wireless roadway induction charging.'
  },
  {
    pos: new THREE.Vector3(26, 26, -35),
    look: new THREE.Vector3(-15, 20, -75),
    name: 'Vertical Forest Towers & Helical Microgrid',
    bengaliName: 'উল্লম্ব অরণ্য ও পরিচ্ছন্ন শক্তি হাব',
    insight: '15,000 indigenous trees absorb 120 tonnes of CO2; rooftop helical wind turbines spin continuously.'
  },
  {
    pos: new THREE.Vector3(0, 78, -12),
    look: new THREE.Vector3(0, 35, -120),
    name: 'Panoramic 2050 Observation Skydeck',
    bengaliName: '২০৫০ স্কাই-ডেক প্যানোরামা',
    insight: 'A resilient, net-zero metropolis. "The future is not a destination. It is something we design."'
  }
];

function createSkyDome(): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0.0, '#091527'); // Zenith: Deep interstellar sapphire
  grad.addColorStop(0.35, '#122644');
  grad.addColorStop(0.65, '#1e3d64');
  grad.addColorStop(0.85, '#3b6282'); // Atmospheric twilight
  grad.addColorStop(0.93, '#d87e46'); // Radiant sunset amber
  grad.addColorStop(1.0, '#152436'); // Horizon blending
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Distant stars in upper sky
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 240; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 280;
    const r = Math.random() * 1.5 + 0.4;
    ctx.globalAlpha = Math.random() * 0.85 + 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.SphereGeometry(480, 32, 16);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false
  });
  const skyMesh = new THREE.Mesh(geo, mat);
  skyMesh.name = 'KolkataSkyDome';
  return skyMesh;
}

export class Kolkata2050Engine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private userRig: THREE.Group;
  private skyDome: THREE.Mesh;
  private resizeObserver: ResizeObserver | null = null;

  // City and systems
  private city: CityEnvironment;
  private hologramSystem: HologramSystem;
  private locomotion: LocomotionManager;

  // Lighting & Atmosphere
  private ambientLight: THREE.AmbientLight;
  private sunLight: THREE.DirectionalLight;
  private lightningLight: THREE.PointLight;

  // Particles
  private rainParticles: THREE.Points;
  private rainGeometry: THREE.BufferGeometry;
  private atmosphericDust: THREE.Points;

  // State
  private currentScenarioIndex: number = 0;
  private isVRSupported: boolean = false;
  private isPresentingVR: boolean = false;
  private callbacks: EngineCallbacks;

  // Preview & Tour State
  private previewMode: PreviewMode = 'none';
  private isTourPaused: boolean = false;
  private tourProgress: number = 0;
  private tourSpeed: number = 1.0;
  private tourPosCurve: THREE.CatmullRomCurve3;
  private tourLookCurve: THREE.CatmullRomCurve3;
  private dronePos = new THREE.Vector3();
  private droneLook = new THREE.Vector3();
  private lastReportedWaypointIndex: number = -1;

  // Stereoscopic split-screen camera
  private stereoCamera = new THREE.StereoCamera();

  // Clock
  private clock = new THREE.Clock();
  private lightningTimer: number = 0;

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Clear any previous canvas or elements from container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Build Catmull-Rom curves for drone tour
    this.tourPosCurve = new THREE.CatmullRomCurve3(
      TOUR_WAYPOINTS.map((w) => w.pos.clone()),
      true,
      'catmullrom',
      0.5
    );
    this.tourLookCurve = new THREE.CatmullRomCurve3(
      TOUR_WAYPOINTS.map((w) => w.look.clone()),
      true,
      'catmullrom',
      0.5
    );

    // StereoCamera setup
    this.stereoCamera.eyeSep = 0.064;

    // 1. SCENE SETUP
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x16263e);
    this.scene.fog = new THREE.FogExp2(0x16263e, 0.0012);

    this.skyDome = createSkyDome();
    this.scene.add(this.skyDome);

    // 2. CAMERA & USER RIG
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);

    this.userRig = new THREE.Group();
    this.userRig.name = 'UserRig';
    this.userRig.add(this.camera);
    this.scene.add(this.userRig);

    // 3. RENDERER SETUP
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.xr.enabled = true;
    container.appendChild(this.renderer.domElement);

    // 4. LIGHTING
    this.ambientLight = new THREE.AmbientLight(0x446699, 1.5);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    this.sunLight.position.set(80, 130, -100);
    this.scene.add(this.sunLight);

    // Lightning point light for storm simulation
    this.lightningLight = new THREE.PointLight(0xbbeeff, 0, 300);
    this.lightningLight.position.set(0, 70, -30);
    this.scene.add(this.lightningLight);

    // 5. PROCEDURAL CITY GENERATION
    this.city = buildKolkata2050City();
    this.scene.add(this.city.group);

    // 6. HOLOGRAPHIC SYSTEMS
    this.hologramSystem = new HologramSystem();
    this.scene.add(this.hologramSystem.group);

    // Setup Scene 1 Intro Hologram
    this.hologramSystem.createIntroHologram(() => {
      this.setScenario('arrival');
    });

    // Setup POI Markers
    this.hologramSystem.createPOIMarkers(POINTS_OF_INTEREST);

    // 7. LOCOMOTION & CONTROLLER INTERACTION
    this.locomotion = new LocomotionManager({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
      userRig: this.userRig,
      interactives: this.hologramSystem.interactives
    });

    // 8. PARTICLE SYSTEMS (Rain & Cyber dust)
    const { rain, rainGeo } = this.createRainSystem();
    this.rainParticles = rain;
    this.rainGeometry = rainGeo;
    this.scene.add(this.rainParticles);

    this.atmosphericDust = this.createDustSystem();
    this.scene.add(this.atmosphericDust);

    // 9. CHECK WEBXR SUPPORT
    this.checkWebXRSupport();

    // 10. INITIAL SCENARIO
    this.applyScenario(SCENARIOS[0], false);

    // 11. START ANIMATION LOOP
    this.renderer.setAnimationLoop(this.render.bind(this));

    // 12. RESIZE HANDLERS
    window.addEventListener('resize', this.onWindowResize.bind(this));
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.onWindowResize();
      });
      this.resizeObserver.observe(this.container);
    }
  }

  private createRainSystem(): { rain: THREE.Points; rainGeo: THREE.BufferGeometry } {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x88ccff,
      size: 0.25,
      transparent: true,
      opacity: 0.75
    });

    const rain = new THREE.Points(rainGeo, rainMat);
    rain.visible = false;
    return { rain, rainGeo };
  }

  private createDustSystem(): THREE.Points {
    const count = 500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 180;
      positions[i * 3 + 1] = 1 + Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.18,
      transparent: true,
      opacity: 0.55
    });

    return new THREE.Points(geo, mat);
  }

  private checkWebXRSupport() {
    if ('xr' in navigator) {
      (navigator as unknown as { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr
        ?.isSessionSupported('immersive-vr')
        .then((supported: boolean) => {
          this.isVRSupported = supported;
          this.callbacks.onVRStatusChange(this.isVRSupported, this.isPresentingVR);
        })
        .catch(() => {
          this.isVRSupported = false;
          this.callbacks.onVRStatusChange(false, false);
        });
    } else {
      this.isVRSupported = false;
      this.callbacks.onVRStatusChange(false, false);
    }

    this.renderer.xr.addEventListener('sessionstart', () => {
      this.isPresentingVR = true;
      this.callbacks.onVRStatusChange(this.isVRSupported, true);
      // Spawn floating VR instructions
      this.hologramSystem.createVRControllerTutorial(this.userRig.position);
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.isPresentingVR = false;
      this.callbacks.onVRStatusChange(this.isVRSupported, false);
    });
  }

  public async enterVR(): Promise<{ success: boolean; reason?: string }> {
    audioEngine.init();
    audioEngine.unmute();

    if (!('xr' in navigator)) {
      return {
        success: false,
        reason: 'WebXR is not supported on this browser or platform.'
      };
    }

    try {
      const xr = (navigator as unknown as { xr: { requestSession: (mode: string, options?: unknown) => Promise<XRSession> } }).xr;
      const session = await xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking']
      });
      await this.renderer.xr.setSession(session);
      return { success: true };
    } catch (err) {
      console.warn('Failed to start WebXR session:', err);
      const reason = err instanceof Error ? err.message : 'WebXR VR display not found or session rejected.';
      return { success: false, reason };
    }
  }

  public startPreview(mode: PreviewMode = 'tour') {
    audioEngine.init();
    audioEngine.unmute();
    this.previewMode = mode;
    this.isTourPaused = false;
    this.callbacks.onPreviewModeChange?.(this.previewMode);

    if (mode === 'tour') {
      const wp = TOUR_WAYPOINTS[0];
      this.callbacks.onTourWaypointChange?.({
        name: wp.name,
        bengaliName: wp.bengaliName,
        insight: wp.insight,
        progress: 0
      });
    }
  }

  public setPreviewMode(mode: PreviewMode) {
    this.previewMode = mode;
    this.callbacks.onPreviewModeChange?.(this.previewMode);
    if (mode !== 'stereo') {
      this.renderer.setScissorTest(false);
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      this.renderer.setViewport(0, 0, width, height);
    }
  }

  public stopPreview() {
    this.previewMode = 'none';
    this.isTourPaused = false;
    this.renderer.setScissorTest(false);
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setViewport(0, 0, width, height);
    this.callbacks.onPreviewModeChange?.('none');
  }

  public toggleTourPause(): boolean {
    this.isTourPaused = !this.isTourPaused;
    return this.isTourPaused;
  }

  public setTourSpeed(speed: number) {
    this.tourSpeed = Math.max(0.2, Math.min(4, speed));
  }

  public teleportToPOI(poiId: string) {
    const poi = POINTS_OF_INTEREST.find((p) => p.id === poiId);
    if (poi) {
      this.locomotion.setRigPosition(
        [poi.position[0], Math.max(2, poi.position[1] - 0.5), poi.position[2] + 5],
        poi.position
      );
      audioEngine.playTeleportSound();
    }
  }

  public jumpToTourWaypoint(index: number) {
    if (index >= 0 && index < TOUR_WAYPOINTS.length) {
      this.tourProgress = index / TOUR_WAYPOINTS.length;
      const wp = TOUR_WAYPOINTS[index];
      this.userRig.position.copy(wp.pos);
      this.camera.lookAt(wp.look);
      this.callbacks.onTourWaypointChange?.({
        name: wp.name,
        bengaliName: wp.bengaliName,
        insight: wp.insight,
        progress: this.tourProgress
      });
    }
  }

  public getTourWaypoints() {
    return TOUR_WAYPOINTS;
  }

  public setScenario(id: ScenarioId) {
    const idx = SCENARIOS.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.currentScenarioIndex = idx;
      this.applyScenario(SCENARIOS[idx], true);
    }
  }

  public nextScenario() {
    this.currentScenarioIndex = (this.currentScenarioIndex + 1) % SCENARIOS.length;
    this.applyScenario(SCENARIOS[this.currentScenarioIndex], true);
  }

  public prevScenario() {
    this.currentScenarioIndex = (this.currentScenarioIndex - 1 + SCENARIOS.length) % SCENARIOS.length;
    this.applyScenario(SCENARIOS[this.currentScenarioIndex], true);
  }

  private applyScenario(scenario: ScenarioDefinition, animateMove: boolean) {
    audioEngine.init();
    audioEngine.setWeatherMode(scenario.weather);

    // Update Lighting & Atmosphere
    this.ambientLight.color.setHex(scenario.ambientLightColor);
    this.ambientLight.intensity = scenario.ambientIntensity;

    this.sunLight.color.setHex(scenario.sunColor);
    this.sunLight.intensity = scenario.sunIntensity;
    this.sunLight.position.set(scenario.sunPosition[0], scenario.sunPosition[1], scenario.sunPosition[2]);

    this.scene.background = new THREE.Color(scenario.fogColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(scenario.fogColor);
      this.scene.fog.density = scenario.fogDensity;
    }

    // Weather Effects
    this.rainParticles.visible = scenario.rainActive;

    // Reposition player
    this.locomotion.setRigPosition(scenario.playerPosition, scenario.lookAtPosition);

    // Intro panel visibility
    if (scenario.id === 'intro') {
      this.hologramSystem.showIntro();
    } else {
      this.hologramSystem.hideIntro();
    }

    // Notify UI
    this.callbacks.onScenarioChange(scenario);
  }

  private onWindowResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.previewMode !== 'stereo') {
      this.renderer.setViewport(0, 0, width, height);
    }
  }

  private render() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();
    const currentScenario = SCENARIOS[this.currentScenarioIndex];

    // 1. Update procedural city systems & vehicles
    this.city.update(delta, elapsed, currentScenario.waterLevel);

    // 2. Update locomotion & controllers
    this.locomotion.update(delta, elapsed);

    // 3. Update holograms & billboarding
    this.hologramSystem.update(elapsed, this.userRig.position);

    // 4. Update rain particles during storm
    if (currentScenario.rainActive) {
      const positions = this.rainGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= 55 * delta;
        if (positions[i + 1] < 0) {
          positions[i + 1] = 80;
        }
      }
      this.rainGeometry.attributes.position.needsUpdate = true;

      // Intermittent lightning flashes
      if (currentScenario.lightningActive) {
        this.lightningTimer += delta;
        if (this.lightningTimer > 4.5 && Math.random() < 0.08) {
          this.lightningLight.intensity = 5.0;
          this.lightningTimer = 0;
          audioEngine.playThunder();
        } else {
          this.lightningLight.intensity = Math.max(0, this.lightningLight.intensity - 18 * delta);
        }
      }
    }

    // 5. Gentle float for cyber dust particles
    const dustPositions = this.atmosphericDust.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < dustPositions.length; i += 3) {
      dustPositions[i + 1] += Math.sin(elapsed + i) * 0.02;
    }
    this.atmosphericDust.geometry.attributes.position.needsUpdate = true;

    // 6. Drone Tour animation (when preview mode is 'tour' and not in hardware VR)
    if (this.previewMode === 'tour' && !this.isTourPaused && !this.renderer.xr.isPresenting) {
      this.tourProgress = (this.tourProgress + delta * 0.016 * this.tourSpeed) % 1.0;
      this.tourPosCurve.getPoint(this.tourProgress, this.dronePos);
      this.tourLookCurve.getPoint(this.tourProgress, this.droneLook);

      this.userRig.position.copy(this.dronePos);
      this.userRig.updateMatrixWorld(true);

      const dir = new THREE.Vector3().subVectors(this.droneLook, this.dronePos).normalize();
      const yaw = Math.atan2(-dir.x, -dir.z);
      const pitch = Math.asin(dir.y);
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = yaw;
      this.camera.rotation.x = pitch;

      const count = TOUR_WAYPOINTS.length;
      const wpIndex = Math.floor(this.tourProgress * count) % count;
      if (wpIndex !== this.lastReportedWaypointIndex) {
        this.lastReportedWaypointIndex = wpIndex;
        const wp = TOUR_WAYPOINTS[wpIndex];
        this.callbacks.onTourWaypointChange?.({
          name: wp.name,
          bengaliName: wp.bengaliName,
          insight: wp.insight,
          progress: this.tourProgress
        });
      }
    }

    // 7. Render Frame (Stereoscopic or Mono)
    if (this.previewMode === 'stereo' && !this.renderer.xr.isPresenting) {
      const size = this.renderer.getSize(new THREE.Vector2());
      const halfWidth = Math.floor(size.x / 2);
      const height = Math.floor(size.y);

      this.stereoCamera.aspect = halfWidth / height;
      this.stereoCamera.update(this.camera);

      this.renderer.setScissorTest(true);

      // Left eye
      this.renderer.setScissor(0, 0, halfWidth, height);
      this.renderer.setViewport(0, 0, halfWidth, height);
      this.renderer.render(this.scene, this.stereoCamera.cameraL);

      // Right eye
      this.renderer.setScissor(halfWidth, 0, halfWidth, height);
      this.renderer.setViewport(halfWidth, 0, halfWidth, height);
      this.renderer.render(this.scene, this.stereoCamera.cameraR);

      this.renderer.setScissorTest(false);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public flyToPhotoView(pos: [number, number, number], lookAt: [number, number, number]) {
    this.previewMode = 'none';
    this.isTourPaused = false;
    this.locomotion.setRigPosition(pos, lookAt);
    audioEngine.playTeleportSound();
  }

  public toggleAudio(): boolean {
    const muted = audioEngine.toggleMute();
    this.callbacks.onAudioToggle(muted);
    return muted;
  }

  public dispose() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    this.renderer.setAnimationLoop(null);
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
