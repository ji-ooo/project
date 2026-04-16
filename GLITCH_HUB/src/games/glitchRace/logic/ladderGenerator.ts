import { NEON_BRIDGE_COLORS, type Bridge } from "../types";

export const RACE_CONFIG = {
  WARMUP_TIME: 3000,
  BASE_SPEED: 4, // 아래로 내려가는 속도
  LAP_DISTANCE: 2500,
};

export const generateLadders = (
  laneCount: number,
  totalHeight: number,
): Bridge[] => {
  const bridges: Bridge[] = [];
  const spacing = 150; // 기본 층 간격
  const startY = 600;

  for (let y = startY; y < totalHeight; y += spacing) {
    // 1. 해당 층에서 사다리가 놓인 레인을 추적
    const occupiedLanes = new Set<number>();

    // 2. 인원수에 비례한 사다리 개수 (최대 레인수의 절반까지만 생성하여 겹침 방지)
    const maxPossibleBridges = Math.floor((laneCount - 1) / 2);
    const bridgeCount = Math.max(
      1,
      Math.min(Math.floor(laneCount / 3), maxPossibleBridges),
    );

    for (let i = 0; i < bridgeCount; i++) {
      // 3. 사용 가능한 레인 후보 필터링 (옆 칸이 비어있는 곳만)
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

      if (candidates.length === 0) break; // 더 이상 놓을 자리가 없으면 종료

      const fromPlayer =
        candidates[Math.floor(Math.random() * candidates.length)];
      occupiedLanes.add(fromPlayer);

      // 4. [핵심] 같은 spacing 안에 있더라도 미세하게 높이를 다르게 줌 (Jitter)
      // 이렇게 하면 시각적으로나 로직상으로나 '완벽히 같은 높이'에서 만나는 일이 없습니다.
      const jitterY = Math.floor(Math.random() * 40) - 20; // -20px ~ 20px 사이 랜덤
      const finalY = y + jitterY;

      const randomColor =
        NEON_BRIDGE_COLORS[
          Math.floor(Math.random() * NEON_BRIDGE_COLORS.length)
        ];

      bridges.push({
        id: `bridge-${y}-${fromPlayer}-${i}`,
        floor: finalY,
        fromPlayer: fromPlayer,
        color: randomColor,
      });
    }
  }

  return bridges;
};
