import * as THREE from 'three';

export type ScenarioId =
  | 'intro'
  | 'arrival'
  | 'exploration'
  | 'flooding'
  | 'heat'
  | 'traffic'
  | 'air_quality'
  | 'green'
  | 'energy'
  | 'night'
  | 'vision';

export interface ScenarioDefinition {
  id: ScenarioId;
  sceneNumber: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  ambientLightColor: number;
  ambientIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  fogColor: number;
  fogDensity: number;
  weather: 'clear' | 'storm' | 'heatwave' | 'smog' | 'night' | 'sunset';
  rainActive: boolean;
  lightningActive: boolean;
  waterLevel: number;
  heatHaze: boolean;
  airQualityStatus?: 'Good (AQI 35)' | 'Moderate (AQI 110)' | 'Severe (AQI 340)';
  playerPosition: [number, number, number];
  lookAtPosition: [number, number, number];
  keyTakeaway: string;
}

export interface POI {
  id: string;
  name: string;
  bengaliName: string;
  category: 'landmark' | 'mobility' | 'climate' | 'energy' | 'nature';
  position: [number, number, number];
  description: string;
  didYouKnow: string;
}

export interface Vehicle {
  mesh: THREE.Object3D;
  route: 'road' | 'tram' | 'metro';
  speed: number;
  t: number;
  radius: number;
  yOffset: number;
}

export type PreviewMode = 'none' | 'tour' | 'walk' | 'stereo';

export interface TourWaypointInfo {
  name: string;
  bengaliName: string;
  insight: string;
  progress: number;
}
