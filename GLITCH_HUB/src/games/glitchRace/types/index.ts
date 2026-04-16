export const NEON_COLORS = [
  "#00f3ff",
  "#ff00de",
  "#39ff14",
  "#ffea00",
  "#ff4d00",
  "#bd00ff",
];

export const NEON_BRIDGE_COLORS = [
  "#FF00A2",
  "#00E5FF",
  "#70FF00",
  "#FFD700",
  "#A226FF",
  "#FF5E00",
];

export interface Bridge {
  id: string;
  floor: number; // Y축 (층수)
  fromPlayer: number; // X축 (어느 기둥에서 시작하는지)
  color: string;
  isUsed?: boolean; // 누군가 이미 건넜는지 여부
}

export interface Player {
  id: number;
  name: string;
  color: string;
}

export interface Runner {
  id: string;
  name: string;
  lane: number;
  visualLane?: number;
  x: number;
  targetX: number;
  y: number;
  speed: number;
  status: "RUNNING" | "GLITCH" | "FALLEN";
  color: string; // 필수 값
}

export type GameState = "SETUP" | "PLAYING" | "FINISHED";
