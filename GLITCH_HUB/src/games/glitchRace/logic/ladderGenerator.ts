import type { Bridge } from "../types";

export const RACE_CONFIG = {
  WARMUP_TIME: 3000,
  BASE_SPEED: 5, // 아래로 내려가는 속도
  SAFE_ZONE_HEIGHT: 500, // 3초간 내려가는 거리
};

export const generateLadders = (
  laneCount: number,
  totalHeight: number,
): Bridge[] => {
  const bridges: Bridge[] = [];
  const spacing = 150;
  const startY = 600;

  for (let y = startY; y < totalHeight; y += spacing) {
    const fromPlayer = Math.floor(Math.random() * (laneCount - 1));

    bridges.push({
      id: `bridge-${y}-${fromPlayer}`,
      floor: y,
      fromPlayer: fromPlayer,
    });
  }

  return bridges;
};
