import type { Runner, Bridge } from "../types";

/**
 * 원형 트랙용 레이스 엔진
 * x 좌표를 직접 수정하는 대신 visualLane을 부드럽게 이동시켜
 * getTrackPos가 트랙 곡선에 맞는 좌표를 계산하도록 합니다.
 */
export const updateVerticalRace = (
  runners: Runner[],
  _elapsed: number, // 필요 시 사용
  _unusedLaneWidth: number, // 원형 트랙에서는 더 이상 사용 안 함
  bridges: Bridge[],
) => {
  return runners.map((runner) => {
    const leaderY = Math.max(...runners.map((r) => r.y));

    if (runner.visualLane === undefined) {
      runner.visualLane = runner.lane;
    }

    let nextLane = runner.lane;
    const isMovingHorizontally = Math.abs(nextLane - runner.visualLane) > 0.01;

    if (!isMovingHorizontally) {
      const hitBridge = bridges.find(
        (b) =>
          runner.y <= b.floor &&
          runner.y + runner.speed > b.floor &&
          (runner.lane === b.fromPlayer || runner.lane === b.fromPlayer + 1) &&
          leaderY <= b.floor + 10,
      );

      if (hitBridge) {
        nextLane =
          runner.lane === hitBridge.fromPlayer
            ? hitBridge.fromPlayer + 1
            : hitBridge.fromPlayer;
      }
    }

    // 4. 속도 결정: 가로 이동(다리 건너기) 중에는 전진(y) 속도를 0으로 하여 멈춤 효과
    const currentYSpeed = isMovingHorizontally ? 0 : runner.speed;
    const nextY = runner.y + currentYSpeed;

    const lerpFactor = 0.1;
    let nextVisualLane =
      runner.visualLane + (nextLane - runner.visualLane) * lerpFactor;

    // 목표 레인에 거의 도착했다면 값 고정
    if (Math.abs(nextLane - nextVisualLane) < 0.005) {
      nextVisualLane = nextLane;
    }

    return {
      ...runner,
      lane: nextLane, // 로직상의 레인
      visualLane: nextVisualLane, // 화면에 그려질 실제 곡선상의 레인 위치
      y: nextY, // 주행 거리
    };
  });
};
