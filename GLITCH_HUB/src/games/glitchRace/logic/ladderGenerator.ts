import type { Runner } from "../types";

export const RACE_CONFIG = {
  WARMUP_TIME: 3000,
  BASE_SPEED: 5, // 아래로 내려가는 속도
  SAFE_ZONE_HEIGHT: 500, // 3초간 내려가는 거리
};

export const updateVerticalRace = (
  runners: Runner[],
  elapsed: number,
  laneWidth: number,
) => {
  const isGlitchMode = elapsed > RACE_CONFIG.WARMUP_TIME;

  return runners.map((runner) => {
    // 1. 아래로 전진
    const nextY = runner.y + runner.speed;

    // 2. 가로 이동 (레인 변경 시 부드럽게)
    const xDiff = runner.targetX - runner.x;
    const nextX = runner.x + xDiff * 0.15;

    // 3. 3초 후 이벤트 발생
    if (isGlitchMode) {
      // TODO: 가로줄(사다리)을 만나면 runner.targetX를 옆 레인으로 변경
    }

    return { ...runner, x: nextX, y: nextY };
  });
};
