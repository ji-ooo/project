import type { Runner, Bridge } from "../types";

export const updateVerticalRace = (
  runners: Runner[],
  elapsed: number,
  laneWidth: number,
  bridges: Bridge[], // 생성된 사다리 목록 추가
) => {
  return runners.map((runner) => {
    let nextLane = runner.lane;
    let nextTargetX = runner.targetX;

    // 1. 가로 이동 중인지 확인 (목표 X와 현재 X의 차이가 0.5픽셀 이상일 때)
    const isMovingHorizontally = Math.abs(nextTargetX - runner.x) > 0.5;

    // 2. 가로 이동 중이 아닐 때만 사다리 충돌 체크 (이미 이동 중이면 체크 건너뜀)
    if (!isMovingHorizontally) {
      const hitBridge = bridges.find(
        (b) =>
          runner.y <= b.floor &&
          runner.y + runner.speed > b.floor &&
          (runner.lane === b.fromPlayer || runner.lane === b.fromPlayer + 1),
      );

      if (hitBridge) {
        if (runner.lane === hitBridge.fromPlayer) {
          nextLane = hitBridge.fromPlayer + 1;
        } else {
          nextLane = hitBridge.fromPlayer;
        }
        nextTargetX = (nextLane + 1) * laneWidth;
        (runner as any).tempLerp =
          0.03 + Math.abs(Math.sin(runner.y + elapsed)) * 0.03;
      }
    }

    // 3. 속도 결정
    const currentYSpeed = isMovingHorizontally ? 0 : runner.speed;

    const nextY = runner.y + currentYSpeed; // 가로 이동 시 y값은 고정됨

    const currentLerp = (runner as any).tempLerp || 0.01;
    const nextX = runner.x + (nextTargetX - runner.x) * currentLerp;
    const finalX = Math.abs(nextTargetX - nextX) < 0.1 ? nextTargetX : nextX;

    return {
      ...runner,
      lane: nextLane,
      targetX: nextTargetX,
      x: finalX,
      y: nextY,
    };
  });
};
