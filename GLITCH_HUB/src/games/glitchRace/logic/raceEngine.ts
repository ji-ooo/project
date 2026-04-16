import { TRACK_SETTING } from "../components/RunnerCanvas";
import type { Runner, Bridge } from "../types";

export const updateVerticalRace = (
  runners: Runner[],
  bridges: Bridge[],
  canvasWidth: number,
) => {
  const { BASE_RADIUS, LANE_WIDTH, STRAIGHT_RATIO } = TRACK_SETTING;

  const STRAIGHT_LEN = canvasWidth * STRAIGHT_RATIO;
  const SEMI_CIRCLE_LEN = Math.PI * BASE_RADIUS;
  const TOTAL_LAP = STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN * 2;

  return runners.map((runner) => {
    const currentVisualLane = runner.visualLane ?? runner.lane;
    let nextLane = runner.lane;
    let nextY = runner.y;
    let nextLastBridgeId = runner.lastBridgeId;

    const d = runner.y % TOTAL_LAP;
    const isCurve =
      (d >= STRAIGHT_LEN && d < STRAIGHT_LEN + SEMI_CIRCLE_LEN) ||
      d >= STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN;

    let effectiveSpeed = runner.speed;
    if (isCurve) {
      const myRadius = BASE_RADIUS + currentVisualLane * LANE_WIDTH;
      effectiveSpeed *= BASE_RADIUS / myRadius;
    }

    const isMovingHorizontally = Math.abs(nextLane - currentVisualLane) > 0.05;

    if (!isMovingHorizontally) {
      const nextYExpected = runner.y + effectiveSpeed;

      const hitBridge = bridges.find((b) => {
        return (
          runner.lastBridgeId !== b.id &&
          runner.y <= b.floor &&
          nextYExpected >= b.floor &&
          (runner.lane === b.fromPlayer || runner.lane === b.fromPlayer + 1)
        );
      });

      if (hitBridge) {
        nextLane =
          runner.lane === hitBridge.fromPlayer
            ? hitBridge.fromPlayer + 1
            : hitBridge.fromPlayer;
        nextY = hitBridge.floor;
        runner.lastBridgeId = hitBridge.id;
      } else {
        nextY = nextYExpected;

        if (nextLastBridgeId) {
          const lb = bridges.find((b) => b.id === nextLastBridgeId);
          if (lb && runner.y > lb.floor + 20) {
            nextLastBridgeId = null;
          }
        }
      }
    } else {
      nextY = runner.y;
    }

    const lerpFactor = 0.12;
    let nextVisualLane =
      currentVisualLane + (nextLane - currentVisualLane) * lerpFactor;

    if (Math.abs(nextLane - nextVisualLane) < 0.01) {
      nextVisualLane = nextLane;
    }

    return {
      ...runner,
      lane: nextLane,
      visualLane: nextVisualLane,
      y: nextY,
      lastBridgeId: runner.lastBridgeId,
    };
  });
};
