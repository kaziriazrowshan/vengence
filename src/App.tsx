/**
 * KOLKATA 2050: EXPERIENCE THE CITY OF TOMORROW
 * University STEM Exhibition WebXR VR Application
 */

import { useEffect, useRef, useState } from 'react';
import { Kolkata2050Engine } from './vr/engine';
import { SCENARIOS, POINTS_OF_INTEREST } from './vr/scenarios';
import { ScenarioDefinition, ScenarioId, PreviewMode, TourWaypointInfo } from './types';
import {
  Volume2,
  VolumeX,
  Glasses,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  CloudRain,
  Sun,
  Wind,
  Zap,
  TreePine,
  Moon,
  Compass,
  Play,
  Pause,
  Maximize,
  Minimize,
  Footprints,
  Eye,
  Camera,
  X,
  HelpCircle,
  Copy,
  Check,
  Images,
  MapPin,
  ExternalLink,
  Github,
  Terminal
} from 'lucide-react';
import { EXHIBITION_PHOTOS, ExhibitionPhoto } from './vr/photos';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Kolkata2050Engine | null>(null);

  const [currentScenario, setCurrentScenario] = useState<ScenarioDefinition>(SCENARIOS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isPresentingVR, setIsPresentingVR] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);

  // Exhibition Concept Photos State
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Meta Quest & Deployment Guide State
  const [isMetaQuest, setIsMetaQuest] = useState(false);
  const [deployGuideTab, setDeployGuideTab] = useState<'quest' | 'github'>('quest');

  // VR Preview States
  const [previewMode, setPreviewMode] = useState<PreviewMode>('none');
  const [isTourPaused, setIsTourPaused] = useState(false);
  const [tourSpeed, setTourSpeedState] = useState<number>(1.0);
  const [currentWaypoint, setCurrentWaypoint] = useState<TourWaypointInfo | null>(null);
  const [showVRModeMenu, setShowVRModeMenu] = useState(false);
  const [showHeadsetGuide, setShowHeadsetGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Kolkata2050Engine(containerRef.current, {
      onScenarioChange: (scenario) => {
        setCurrentScenario(scenario);
      },
      onAudioToggle: (muted) => {
        setIsMuted(muted);
      },
      onVRStatusChange: (supported, presenting) => {
        setIsVRSupported(supported);
        setIsPresentingVR(presenting);
      },
      onPreviewModeChange: (mode) => {
        setPreviewMode(mode);
      },
      onTourWaypointChange: (info) => {
        setCurrentWaypoint(info);
      }
    });

    engineRef.current = engine;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isQuestBrowser = /OculusBrowser|Quest/i.test(navigator.userAgent);
      setIsMetaQuest(isQuestBrowser);
      if (isQuestBrowser) {
        triggerNotice('Meta Quest Headset detected! Click ENTER QUEST 3S VR for full 6DoF immersion.');
      }
    }
  }, []);

  const triggerNotice = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => {
      setStatusNotice(null);
    }, 4500);
  };

  const handleStartVROrPreview = async () => {
    if (!engineRef.current) return;

    // If already in preview mode, clicking toggles the mode menu or resumes
    if (previewMode !== 'none') {
      setShowVRModeMenu(!showVRModeMenu);
      return;
    }

    // If WebXR is supported and headset available, attempt native WebXR
    if (isVRSupported) {
      const res = await engineRef.current.enterVR();
      if (res.success) {
        triggerNotice('WebXR immersive session started successfully.');
        return;
      }
    }

    // Immediately launch Immersive VR Drone Tour Preview!
    engineRef.current.startPreview('tour');
    triggerNotice('VR Preview Mode active: Flying through Kolkata 2050.');
  };

  const handleSetPreviewMode = (mode: PreviewMode) => {
    if (!engineRef.current) return;
    if (mode === 'none') {
      engineRef.current.stopPreview();
      triggerNotice('Exited VR Preview mode.');
    } else {
      engineRef.current.startPreview(mode);
      if (mode === 'tour') {
        triggerNotice('Cinematic Drone Tour active.');
      } else if (mode === 'stereo') {
        triggerNotice('Stereoscopic 3D Split-Screen active. Ready for VR Cardboard / Mobile Viewers.');
      } else if (mode === 'walk') {
        triggerNotice('Interactive Street Walk mode active. Use WASD & Mouse to explore.');
      }
    }
    setShowVRModeMenu(false);
  };

  const handleToggleTourPause = () => {
    if (engineRef.current) {
      const paused = engineRef.current.toggleTourPause();
      setIsTourPaused(paused);
    }
  };

  const handleToggleSpeed = () => {
    if (engineRef.current) {
      const nextSpeed = tourSpeed === 1.0 ? 1.8 : 1.0;
      engineRef.current.setTourSpeed(nextSpeed);
      setTourSpeedState(nextSpeed);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleAudio = () => {
    if (engineRef.current) {
      engineRef.current.toggleAudio();
    }
  };

  const handleSelectScenario = (id: ScenarioId) => {
    if (engineRef.current) {
      engineRef.current.setScenario(id);
      setShowSceneList(false);
    }
  };

  const handlePrev = () => {
    if (engineRef.current) {
      engineRef.current.prevScenario();
    }
  };

  const handleNext = () => {
    if (engineRef.current) {
      engineRef.current.nextScenario();
    }
  };

  const handleJumpToLandmark = (index: number) => {
    if (engineRef.current) {
      engineRef.current.jumpToTourWaypoint(index);
    }
  };

  const handleJumpToPOI = (poiId: string) => {
    if (engineRef.current) {
      engineRef.current.setPreviewMode('walk');
      engineRef.current.teleportToPOI(poiId);
      triggerNotice(`Teleported to ${poiId}`);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoGallery(true);
  };

  const handleFlyToPhoto = (photo: ExhibitionPhoto) => {
    if (engineRef.current) {
      engineRef.current.flyToPhotoView(photo.cameraPosition, photo.lookAtPosition);
      setShowPhotoGallery(false);
      triggerNotice(`Viewing 3D Landmark: ${photo.title}`);
    }
  };

  const getScenarioIcon = (id: ScenarioId) => {
    switch (id) {
      case 'flooding':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'heat':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'air_quality':
        return <Wind className="w-4 h-4 text-emerald-400" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'green':
        return <TreePine className="w-4 h-4 text-emerald-400" />;
      case 'night':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div id="kolkata-2050-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebXR WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="vr-canvas-container"
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* STEREOSCOPIC VR CARDBOARD CENTRAL DIVIDER (When Stereo Mode is Active) */}
      {previewMode === 'stereo' && (
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-cyan-500/40 pointer-events-none z-20 flex flex-col items-center justify-between py-6">
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30 -translate-x-1/2">
            LEFT EYE
          </span>
          <div className="w-3 h-3 rounded-full border border-cyan-400 bg-cyan-950/80 -translate-x-1/2" />
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30 -translate-x-1/2">
            RIGHT EYE
          </span>
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      {statusNotice && (
        <div
          id="vr-status-notice"
          className="absolute top-20 left-1/2 -translate-x-1/2 bg-cyan-950/90 text-cyan-200 border border-cyan-400/50 backdrop-blur-xl px-4 py-2 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top duration-300"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* TOP FLOATING INTERFACE */}
      <header
        id="vr-top-header"
        className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30"
      >
        {/* Branding & Subtitle */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-4 py-2.5 rounded-xl pointer-events-auto shadow-2xl shadow-cyan-950/40">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-black tracking-wider text-base sm:text-lg font-['Cinzel']">
                KOLKATA <span className="text-cyan-400">2050</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                STEM XR
              </span>
            </div>
            <p className="text-[11px] text-cyan-300/80 font-medium tracking-wide">EXPERIENCE THE CITY OF TOMORROW</p>
          </div>
        </div>

        {/* Center Scenario Navigator for University Demonstrators */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl pointer-events-auto shadow-lg">
          <button
            id="prev-scenario-btn"
            onClick={handlePrev}
            aria-label="Previous Scenario"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => setShowSceneList(!showSceneList)}
            className="cursor-pointer flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            {getScenarioIcon(currentScenario.id)}
            <div className="text-left">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Scene {currentScenario.sceneNumber} of {SCENARIOS.length}
              </div>
              <div className="text-xs text-white font-semibold flex items-center gap-1.5">
                {currentScenario.title}
                <span className="text-[10px] text-slate-400 font-normal">▼</span>
              </div>
            </div>
          </div>

          <button
            id="next-scenario-btn"
            onClick={handleNext}
            aria-label="Next Scenario"
            className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Tools: VR Button with Mode Dropdown, Audio Toggle, Info */}
        <div className="flex items-center gap-2 pointer-events-auto relative">
          {/* Exhibition Photos Button */}
          <button
            id="open-photos-btn"
            onClick={() => handleOpenPhoto(0)}
            title="View Kolkata 2050 Concept Photos & Landmark Exhibits"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wider backdrop-blur-md border bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/60 text-amber-300 shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
          >
            <Images className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">EXHIBIT PHOTOS</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              4
            </span>
          </button>

          {/* Audio Synthesizer Mute Toggle */}
          <button
            id="mute-audio-btn"
            onClick={handleToggleAudio}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
              isMuted
                ? 'bg-red-950/80 border-red-500/40 text-red-300'
                : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300 hover:bg-slate-800/90'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
          </button>

          {/* Primary VR / PREVIEW Trigger Button Group */}
          <div className="flex items-center">
            <button
              id="enter-vr-btn"
              onClick={handleStartVROrPreview}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-l-xl text-xs font-bold tracking-wider backdrop-blur-md border transition-all shadow-lg ${
                isPresentingVR
                  ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                  : previewMode !== 'none'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/30'
                  : isMetaQuest
                  ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 border-cyan-200 shadow-cyan-400/50 animate-pulse font-black'
                  : isVRSupported
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-500/25'
                  : 'bg-indigo-600/95 hover:bg-indigo-500 text-white border-indigo-400/60 shadow-indigo-600/30'
              }`}
            >
              <Glasses className="w-4 h-4" />
              <span>
                {isPresentingVR
                  ? 'IN VR SESSION'
                  : previewMode === 'tour'
                  ? 'VR TOUR ACTIVE 🚁'
                  : previewMode === 'stereo'
                  ? 'STEREO VR 🥽'
                  : previewMode === 'walk'
                  ? 'WALK ACTIVE 🚶'
                  : isMetaQuest
                  ? 'ENTER QUEST 3S VR'
                  : isVRSupported
                  ? 'ENTER VR'
                  : 'START VR / PREVIEW'}
              </span>
            </button>

            {/* Quick VR Mode Picker Trigger */}
            <button
              id="vr-options-dropdown-btn"
              onClick={() => setShowVRModeMenu(!showVRModeMenu)}
              title="Select VR Experience Mode"
              className={`px-2 py-2 rounded-r-xl border-y border-r transition-all backdrop-blur-md text-xs font-bold ${
                previewMode !== 'none'
                  ? 'bg-cyan-600 text-slate-950 border-cyan-300 hover:bg-cyan-400'
                  : 'bg-indigo-700 text-white border-indigo-400/60 hover:bg-indigo-600'
              }`}
            >
              ▼
            </button>
          </div>

          {/* Quest 3S & GitHub Deploy Hub Button */}
          <button
            id="quest-deploy-hub-btn"
            onClick={() => setShowHeadsetGuide(true)}
            title="Meta Quest 3S Testing & GitHub Pages Deployment Guide"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold tracking-wider backdrop-blur-md border bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 shadow-md transition-all cursor-pointer"
          >
            <Glasses className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">QUEST 3S / GITHUB</span>
          </button>

          {/* VR Experience Mode Dropdown Menu */}
          {showVRModeMenu && (
            <div
              id="vr-mode-selector-menu"
              className="absolute top-12 right-0 w-72 bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-2.5 z-50 backdrop-blur-2xl shadow-2xl space-y-1.5"
            >
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest px-2 py-1 border-b border-slate-800">
                Choose VR Experience Mode
              </div>

              <button
                onClick={() => handleSetPreviewMode('tour')}
                className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                  previewMode === 'tour'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="p-1.5 bg-cyan-950/80 rounded-lg text-cyan-400 border border-cyan-500/30">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Cinematic Drone Tour</div>
                  <div className="text-[10px] text-slate-400">Automated scenic flight over landmarks</div>
                </div>
              </button>

              <button
                onClick={() => handleSetPreviewMode('walk')}
                className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                  previewMode === 'walk'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="p-1.5 bg-emerald-950/80 rounded-lg text-emerald-400 border border-emerald-500/30">
                  <Footprints className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Interactive Street Walk</div>
                  <div className="text-[10px] text-slate-400">WASD + 360° mouse look & beacon inspect</div>
                </div>
              </button>

              <button
                onClick={() => handleSetPreviewMode('stereo')}
                className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-colors ${
                  previewMode === 'stereo'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="p-1.5 bg-indigo-950/80 rounded-lg text-indigo-400 border border-indigo-500/30">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Stereo 3D Split-Screen</div>
                  <div className="text-[10px] text-slate-400">Side-by-side view for Google Cardboard / phone VR</div>
                </div>
              </button>

              <div className="pt-1 border-t border-slate-800 flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    setShowVRModeMenu(false);
                    setShowHeadsetGuide(true);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" /> Connect VR Headset
                </button>
                {previewMode !== 'none' && (
                  <button
                    onClick={() => handleSetPreviewMode('none')}
                    className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Stop Preview
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <button
            id="fullscreen-toggle-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl backdrop-blur-md transition-colors"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Exhibition Guide Modal Toggle */}
          <button
            id="info-modal-btn"
            onClick={() => setShowInfoModal(!showInfoModal)}
            title="Exhibition Information"
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50 rounded-xl backdrop-blur-md transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* FLOATING DRONE TOUR CONTROLS BAR (When Preview Mode is Active) */}
      {previewMode !== 'none' && (
        <div
          id="vr-preview-active-bar"
          className="absolute top-20 left-4 right-4 flex items-center justify-between pointer-events-none z-30"
        >
          {/* Active Mode Tag & Tour Controls */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 p-1.5 px-3 rounded-2xl pointer-events-auto shadow-2xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {previewMode === 'tour'
                ? 'CINEMATIC DRONE FLIGHT'
                : previewMode === 'stereo'
                ? 'STEREO CARDBOARD VR'
                : 'FREE 3D WALK'}
            </span>

            {previewMode === 'tour' && (
              <>
                <div className="w-px h-4 bg-slate-700" />
                <button
                  onClick={handleToggleTourPause}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-200 hover:text-cyan-300 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {isTourPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isTourPaused ? 'RESUME' : 'PAUSE'}</span>
                </button>
                <button
                  onClick={handleToggleSpeed}
                  className="text-[11px] font-mono font-bold text-cyan-300 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {tourSpeed}x SPEED
                </button>
              </>
            )}

            <div className="w-px h-4 bg-slate-700" />
            <button
              onClick={() => handleSetPreviewMode('none')}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 px-2 py-1 rounded-lg hover:bg-red-950/50 transition-colors"
            >
              ✕ EXIT
            </button>
          </div>

          {/* Landmark Fast-Jump Picker for Demonstrator */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 p-1.5 px-2.5 rounded-2xl pointer-events-auto shadow-xl text-[11px] text-slate-300">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mr-1">FLY TO:</span>
            <button
              onClick={() => handleJumpToLandmark(0)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              Howrah Bridge
            </button>
            <button
              onClick={() => handleJumpToLandmark(2)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              Sky-Metro
            </button>
            <button
              onClick={() => handleJumpToLandmark(3)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              Smart Boulevard
            </button>
            <button
              onClick={() => handleJumpToLandmark(4)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              Green Towers
            </button>
            <button
              onClick={() => handleJumpToLandmark(5)}
              className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
            >
              Skydeck
            </button>
          </div>
        </div>
      )}

      {/* DROPDOWN SCENE SELECTOR */}
      {showSceneList && (
        <div
          id="scene-selector-dropdown"
          className="absolute top-18 left-1/2 -translate-x-1/2 w-80 max-h-96 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-2 z-40 shadow-2xl"
        >
          <div className="text-[11px] font-bold text-cyan-400 px-3 py-1.5 uppercase tracking-wider border-b border-slate-800">
            Select Exploration Scenario
          </div>
          <div className="mt-1 space-y-1">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectScenario(s.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  s.id === currentScenario.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {getScenarioIcon(s.id)}
                  <div>
                    <div>{s.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{s.badge}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">#{s.sceneNumber}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM IMMERSIVE HUD */}
      <footer
        id="vr-bottom-hud"
        className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pointer-events-none z-30"
      >
        {/* Left: Dynamic Drone Tour Landmark Card or Key Scenario Takeaway Banner */}
        <div className="w-full sm:max-w-xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/25 p-3.5 rounded-2xl pointer-events-auto shadow-2xl">
          {previewMode === 'tour' && currentWaypoint ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500/25 text-cyan-300 border border-cyan-400/40">
                  LANDMARK IN VIEW • 360° DRONE
                </span>
                <span className="text-[10px] text-cyan-400/80 font-mono font-bold">
                  {Math.round(currentWaypoint.progress * 100)}% of city tour
                </span>
              </div>
              <h2 className="text-white font-bold text-sm sm:text-base leading-tight">
                {currentWaypoint.name} — <span className="text-cyan-300 font-medium text-xs">{currentWaypoint.bengaliName}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentWaypoint.insight}
              </p>
              {/* Tour Progress Bar */}
              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${Math.round(currentWaypoint.progress * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {currentScenario.badge}
                </span>
                {currentScenario.airQualityStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                      currentScenario.airQualityStatus.includes('Severe')
                        ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {currentScenario.airQualityStatus}
                  </span>
                )}
                {currentScenario.weather === 'storm' && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-500/40">
                    MONSOON SURGE
                  </span>
                )}
                {currentScenario.heatHaze && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                    44°C HEATWAVE
                  </span>
                )}
              </div>
              <h2 className="text-white font-bold text-sm sm:text-base leading-tight">
                {currentScenario.title} — <span className="text-cyan-300 font-medium text-xs">{currentScenario.subtitle}</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentScenario.description}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-cyan-300/90 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{currentScenario.keyTakeaway}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Controls & Navigation Guide */}
        <div className="hidden lg:flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[10px]">
              <Compass className="w-3.5 h-3.5" /> Navigation Controls
            </div>
            <div>
              <span className="font-mono text-cyan-300 font-bold">WASD / Arrow Keys</span> — Walk Street
            </div>
            <div>
              <span className="font-mono text-cyan-300 font-bold">Click + Drag</span> — 360° Panoramic Look
            </div>
            <div>
              <span className="font-mono text-cyan-300 font-bold">Click 3D Beacons</span> — Unlock STEM Insights
            </div>
            <div className="text-emerald-400 font-semibold pt-0.5 border-t border-slate-800/80">
              VR: Point + Trigger to Teleport | Stick to Snap Turn
            </div>
          </div>
        </div>
      </footer>

      {/* META QUEST 3S & GITHUB PAGES DEPLOYMENT HUB MODAL */}
      {showHeadsetGuide && (
        <div
          id="webxr-guide-modal"
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200"
          onClick={() => setShowHeadsetGuide(false)}
        >
          <div
            className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-slate-200 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Glasses className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Meta Quest 3S & GitHub Pages Hub</span>
                    {isMetaQuest && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Quest Headset Detected
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-cyan-300">
                    WebXR 6DoF Virtual Reality • Automated GitHub Pages Deployment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHeadsetGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-4 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
              <button
                onClick={() => setDeployGuideTab('quest')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  deployGuideTab === 'quest'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Glasses className="w-4 h-4" />
                <span>Meta Quest 3S Testing</span>
              </button>

              <button
                onClick={() => setDeployGuideTab('github')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  deployGuideTab === 'github'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>GitHub Pages Deploy</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto mt-4 space-y-4 pr-1 flex-1 text-xs">
              {deployGuideTab === 'quest' ? (
                /* TAB 1: META QUEST 3S TESTING */
                <div className="space-y-3.5">
                  {/* Status Bar */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isVRSupported || isMetaQuest ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                      <span className="font-semibold text-slate-200">
                        {isMetaQuest
                          ? 'Meta Quest Browser Active (Ready for WebXR)'
                          : isVRSupported
                          ? 'WebXR Display Detected & Ready'
                          : 'Desktop / Mobile Mode (Ready to test on Quest)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                      <span>HTTPS: OK</span>
                      <span>•</span>
                      <span>WebXR: Enabled</span>
                    </div>
                  </div>

                  {/* 3-Step Testing Guide */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/20 space-y-2.5">
                    <div className="font-bold text-white text-[13px] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[11px] flex items-center justify-center font-bold">
                        1
                      </span>
                      <span>Open in Meta Quest 3S Headset Browser:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Put on your Meta Quest 3S, launch the built-in <strong>Meta Quest Browser</strong>, and navigate to your deployed GitHub Pages URL:
                    </p>

                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-cyan-300 font-mono text-[11px] break-all shadow-inner">
                      <span className="truncate flex-1">{window.location.href}</span>
                      <button
                        onClick={handleCopyUrl}
                        className="shrink-0 px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 text-[11px] transition-all"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'COPIED' : 'COPY LINK'}</span>
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 italic flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Pro-tip: You can also use the Meta Quest phone app to share this link directly to your headset ("Send to Headset")!
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Click Enter VR */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/20 space-y-2">
                    <div className="font-bold text-white text-[13px] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[11px] flex items-center justify-center font-bold">
                        2
                      </span>
                      <span>Click "ENTER QUEST 3S VR" & Allow:</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Look at the top right button on the webpage in your headset. Click <strong>ENTER QUEST 3S VR</strong> with your controller laser. A system prompt will appear asking to enter an immersive WebXR session. Select <strong>Allow</strong>.
                    </p>
                  </div>

                  {/* Controller Mappings */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="font-bold text-white text-[13px] flex items-center justify-between">
                      <span>Meta Quest 3S Touch Plus Controls</span>
                      <span className="text-[10px] text-cyan-400 font-mono">6DoF Roomscale</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                        <div className="font-bold text-cyan-400">Left Thumbstick</div>
                        <div className="text-slate-300">Push to walk forward/back, tilt to strafe left/right</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                        <div className="font-bold text-cyan-400">Right Thumbstick</div>
                        <div className="text-slate-300">Flick left/right for 45° comfort snap turning</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                        <div className="font-bold text-cyan-400">Index Trigger / Grip</div>
                        <div className="text-slate-300">Point laser beam at ground to teleport or click 3D STEM beacons</div>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5">
                        <div className="font-bold text-cyan-400">A / X & B / Y Buttons</div>
                        <div className="text-slate-300">Cycle through 2050 climate scenarios (Floods, Heat, Transit)</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB 2: GITHUB PAGES DEPLOYMENT */
                <div className="space-y-3.5">
                  {/* Ready for GitHub Pages Banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-[13px]">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Project is Pre-Configured for GitHub Pages!</span>
                    </div>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                      We have already configured <code>base: './'</code> in <code>vite.config.ts</code> and added the official GitHub Actions workflow in <code>.github/workflows/deploy.yml</code>.
                    </p>
                  </div>

                  {/* Step 1: Git Push */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-[13px] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[11px] flex items-center justify-center font-bold">
                          1
                        </span>
                        <span>Push to your GitHub Repository:</span>
                      </div>
                      <Terminal className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Create a new repository on GitHub (e.g. <code>kolkata-2050-vr</code>) and run these commands in your project folder:
                    </p>
                    <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto select-all">
{`git init
git add .
git commit -m "Deploy Kolkata 2050 WebXR project"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main`}
                    </pre>
                  </div>

                  {/* Step 2: Enable GitHub Actions Source */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-[13px] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[11px] flex items-center justify-center font-bold">
                        2
                      </span>
                      <span>Enable GitHub Pages in Repository Settings:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                      <li>Go to your repository on <strong>github.com</strong></li>
                      <li>Click <strong>Settings</strong> &rarr; <strong>Pages</strong> (in left sidebar)</li>
                      <li>
                        Under <strong>Build and deployment &gt; Source</strong>, select <strong>GitHub Actions</strong>
                      </li>
                      <li>
                        GitHub will automatically build and deploy your site to <code>https://&lt;username&gt;.github.io/&lt;repo&gt;/</code>!
                      </li>
                    </ol>
                  </div>

                  {/* Step 3: Alternative Manual Deploy */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="font-bold text-white text-[13px] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-mono text-[11px] flex items-center justify-center font-bold">
                        3
                      </span>
                      <span>Alternative Manual Deploy via gh-pages:</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      If you prefer manual command-line deployment, run:
                    </p>
                    <pre className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 select-all">
                      npm run deploy
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">
                Detailed instructions also saved in <code className="text-cyan-300">DEPLOY.md</code> & <code className="text-cyan-300">README.md</code>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowHeadsetGuide(false);
                    handleStartVROrPreview();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
                >
                  {isVRSupported ? 'Enter WebXR Now' : 'Launch 3D Tour'}
                </button>
                <button
                  onClick={() => setShowHeadsetGuide(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXHIBITION & STEM PROJECT INFO MODAL */}
      {showInfoModal && (
        <div
          id="exhibition-info-modal"
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-extrabold text-white font-['Cinzel'] tracking-wide">
                  KOLKATA <span className="text-cyan-400">2050</span>
                </h3>
                <p className="text-xs text-cyan-300 font-medium">University STEM Exhibition Project</p>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>Kolkata 2050</strong> is an interactive WebXR virtual reality journey depicting how India’s cultural
                capital can transform through scientific innovation, climate-adaptive architecture, and zero-carbon mobility.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4" /> Flood & Cyclone Defense
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Subterranean sponge-city surge aquifers and deployable graphene floodgates handling 250mm/hr cloudbursts.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/20">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <Sun className="w-4 h-4" /> Urban Heat Mitigation
                  </div>
                  <p className="text-[11px] text-slate-400">
                    44°C extreme heat counterbalanced by bioclimatic tree corridors, living wall transpiration, and passive cooling.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
                  <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                    <TreePine className="w-4 h-4" /> Vertical Wetlands & Forests
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Rooftop bio-canopies and East Kolkata Wetland principles scaled into vertical sky-gardens filtering urban greywater.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-yellow-500/20">
                  <div className="font-bold text-yellow-400 mb-1 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> 100% Renewable Microgrids
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Vertical helical wind turbines, transparent photovoltaic glass, and kinetic bridge dampers powering the city.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-950/40 border border-cyan-500/30 p-3 rounded-xl text-[11px] text-cyan-200">
                <div className="font-bold mb-0.5">Live VR Exhibition Advice:</div>
                Put on any WebXR-compliant headset (e.g. Meta Quest, HTC Vive, Apple Vision Pro with WebXR, or Cardboard) and click{' '}
                <strong>[ENTER VR]</strong>. On standard laptops or mobile phones, click <strong>[START VR / PREVIEW]</strong> to launch the 360° Drone Tour, Stereo 3D, or WASD Street Walk!
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Close & Return to Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING QUICK PHOTO DOCK (When not in full VR headset mode and not modal) */}
      {!isPresentingVR && !showPhotoGallery && (
        <div
          id="quick-photo-dock"
          className="absolute bottom-16 right-4 sm:right-6 flex flex-col items-end gap-2 pointer-events-auto z-30 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/40 p-2 rounded-2xl shadow-2xl shadow-black/70 flex items-center gap-2.5 max-w-sm">
            <div className="flex items-center gap-1.5 pl-1.5 pr-1 cursor-pointer" onClick={() => handleOpenPhoto(0)}>
              <Images className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-amber-300 block">Exhibition Photos</span>
                <span className="text-[9px] text-slate-400">4 Concept Renderings</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-700/60 pl-2">
              {EXHIBITION_PHOTOS.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => handleOpenPhoto(idx)}
                  title={`View & Fly to: ${photo.title}`}
                  className="group relative w-11 h-8 sm:w-12 sm:h-9 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-all hover:scale-105 active:scale-95 shrink-0"
                >
                  <img
                    src={photo.imageSrc}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] text-center font-bold text-amber-300 truncate px-0.5">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenPhoto(0)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-colors shrink-0 shadow-md"
            >
              Gallery
            </button>
          </div>
        </div>
      )}

      {/* EXHIBITION CONCEPT PHOTOS GALLERY MODAL */}
      {showPhotoGallery && (
        <div
          id="photo-gallery-modal-overlay"
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200"
          onClick={() => setShowPhotoGallery(false)}
        >
          <div
            id="photo-gallery-dialog"
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 max-w-4xl w-full text-slate-200 shadow-2xl relative max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-wider flex items-center gap-2 font-['Cinzel']">
                    KOLKATA 2050 <span className="text-amber-400">CONCEPT EXHIBITION</span>
                  </h3>
                  <p className="text-[11px] text-amber-300/80 font-medium">
                    Photo {selectedPhotoIndex + 1} of {EXHIBITION_PHOTOS.length} // University STEM Project
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPhotoGallery(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Active Photo & STEM Data */}
            {(() => {
              const activePhoto = EXHIBITION_PHOTOS[selectedPhotoIndex];
              return (
                <div className="overflow-y-auto mt-4 space-y-4 pr-1 flex-1">
                  {/* Image Display with Previous / Next Arrows */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black aspect-video max-h-[44vh] flex items-center justify-center group">
                    <img
                      src={activePhoto.imageSrc}
                      alt={activePhoto.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Overlay */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                      {activePhoto.category}
                    </div>

                    {/* Prev Photo Arrow */}
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          prev === 0 ? EXHIBITION_PHOTOS.length - 1 : prev - 1
                        )
                      }
                      title="Previous Concept Photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Next Photo Arrow */}
                    <button
                      onClick={() =>
                        setSelectedPhotoIndex((prev) =>
                          (prev + 1) % EXHIBITION_PHOTOS.length
                        )
                      }
                      title="Next Concept Photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700 transition-all opacity-80 hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Titles & Description */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                        {activePhoto.bengaliTitle}
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        {activePhoto.title}
                      </h4>
                      <p className="text-xs text-slate-400 italic">
                        {activePhoto.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                        {activePhoto.description}
                      </p>
                    </div>

                    {/* Interactive 3D Fly-To Action */}
                    <button
                      onClick={() => handleFlyToPhoto(activePhoto)}
                      className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-950" />
                      <span>FLY TO LANDMARK IN 3D</span>
                    </button>
                  </div>

                  {/* STEM Engineering & Resilience Highlights */}
                  <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                      <span>STEM Engineering & Climate Highlights</span>
                      <span className="text-amber-400 font-mono text-[10px]">
                        {activePhoto.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activePhoto.engineeringSpecs.map((spec) => (
                        <div
                          key={spec}
                          className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 p-2 rounded-xl border border-cyan-500/20"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Switcher Bar */}
                  <div className="pt-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      ALL EXHIBITION CONCEPT PHOTOS ({EXHIBITION_PHOTOS.length}):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {EXHIBITION_PHOTOS.map((photo, idx) => (
                        <button
                          key={photo.id}
                          onClick={() => setSelectedPhotoIndex(idx)}
                          className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all text-left ${
                            idx === selectedPhotoIndex
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white'
                          }`}
                        >
                          <img
                            src={photo.imageSrc}
                            alt={photo.title}
                            className="w-12 h-9 object-cover rounded-lg shrink-0"
                          />
                          <div className="truncate">
                            <div className="text-[10px] font-bold truncate">
                              #{idx + 1} {photo.title.split('//')[0]}
                            </div>
                            <div className="text-[9px] text-amber-400/80 truncate">
                              {photo.category}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">
                Tip: Click "Fly to Landmark in 3D" to experience this exact view in the 3D VR environment.
              </span>
              <button
                onClick={() => setShowPhotoGallery(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
