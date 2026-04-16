import { NEON_BRIDGE_COLORS, type Bridge } from "../types";

export const RACE_CONFIG = {
  WARMUP_TIME: 3000,
  BASE_SPEED: 2,
  LAP_DISTANCE: 2500,
};

export const generateLadders = (
  laneCount: number,
  totalHeight: number,
): Bridge[] => {
  const bridges: Bridge[] = [];
  const spacing = 150;
  const startY = 600;

  for (let y = startY; y < totalHeight; y += spacing) {
    const occupiedLanes = new Set<number>();

    const maxPossibleBridges = Math.floor((laneCount - 1) / 2);
    const bridgeCount = Math.max(
      1,
      Math.min(Math.floor(laneCount / 3), maxPossibleBridges),
    );

    for (let i = 0; i < bridgeCount; i++) {
      const candidates = [];
      for (let l = 0; l < laneCount - 1; l++) {
        if (
          !occupiedLanes.has(l) &&
          !occupiedLanes.has(l - 1) &&
          !occupiedLanes.has(l + 1)
        ) {
          candidates.push(l);
        }
      }

      if (candidates.length === 0) break;

      const fromPlayer =
        candidates[Math.floor(Math.random() * candidates.length)];
      occupiedLanes.add(fromPlayer);

      const jitterY = Math.floor(Math.random() * 40) - 20;
      const finalY = y + jitterY;

      const randomColor =
        NEON_BRIDGE_COLORS[
          Math.floor(Math.random() * NEON_BRIDGE_COLORS.length)
        ];

      const uniqueId = `br-${finalY}-${fromPlayer}-${Math.random().toString(36).substring(2, 7)}`;

      bridges.push({
        id: uniqueId,
        floor: finalY,
        fromPlayer: fromPlayer,
        color: randomColor,
      });
    }
  }

  return bridges;
};
