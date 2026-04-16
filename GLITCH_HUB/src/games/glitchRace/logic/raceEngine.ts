import type { Runner, Bridge } from "../types";

export const updateVerticalRace = (runners: Runner[], bridges: Bridge[]) => {
  return runners.map((runner) => {
    const currentVisualLane = runner.visualLane ?? runner.lane;
    let nextLane = runner.lane;
    let nextY = runner.y;
    let nextLastBridgeId = runner.lastBridgeId;

    const isMovingHorizontally = Math.abs(nextLane - currentVisualLane) > 0.05;

    if (!isMovingHorizontally) {
      const nextYExpected = runner.y + runner.speed;

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
