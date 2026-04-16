import React, { useEffect, useRef, useState } from "react";
import type { Player, Runner, Bridge } from "../../../games/glitchRace/types";
import {
  generateLadders,
  RACE_CONFIG,
} from "../../../games/glitchRace/logic/ladderGenerator";
import { updateVerticalRace } from "../../../games/glitchRace/logic/raceEngine";
import styles from "./RunnerCanvas.module.scss";
import { alpha } from "@mui/material";

interface Props {
  players: Player[];
  isRunning: boolean;
}

export const TRACK_SETTING = {
  BASE_RADIUS: 150,
  LANE_WIDTH: 40,
  STRAIGHT_RATIO: 0.5,
  STROKE_WIDTH: 2,
};

const RunnerCanvas: React.FC<Props> = ({ players, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const cameraYRef = useRef<number>(-100);
  const { LANE_WIDTH } = TRACK_SETTING;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const laneWidth = canvas.width / (players.length + 1);
      setRunners((prev) =>
        prev.map((r, i) => ({
          ...r,
          x: (r.lane + 1) * laneWidth,
          targetX: (r.lane + 1) * laneWidth,
        })),
      );
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(canvas.parentElement!);

    return () => resizeObserver.disconnect();
  }, [players.length]); // 플레이어 수가 바뀔 때도 재계산

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialRunners: Runner[] = players.map((p, i) => ({
      ...p,
      id: String(p.id),
      lane: i,
      x: (i + 1) * LANE_WIDTH,
      targetX: (i + 1) * LANE_WIDTH,
      y: 0,
      speed: RACE_CONFIG.BASE_SPEED + Math.random() * 0.23,
      status: "RUNNING",
    }));
    setRunners(initialRunners);

    const newLadders = generateLadders(players.length, 5000);
    setBridges(newLadders);
    startTimeRef.current = null;
  }, [players]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frameId: number;

    const render = (time: number) => {
      if (isRunning) {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;

        setRunners((prev) =>
          updateVerticalRace(prev, elapsed, LANE_WIDTH, bridges),
        );
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (runners.length > 0) {
        const maxY = Math.max(...runners.map((r) => r.y));
        const minY = Math.min(...runners.map((r) => r.y));
        const distance = maxY - minY; // 주자 간 간격

        const targetOffset = Math.min(250 + distance * 0.5, 400);
        const targetCameraY = isRunning ? maxY - targetOffset : -100;

        const lerpFactor = 0.1;
        cameraYRef.current += (targetCameraY - cameraYRef.current) * lerpFactor;
      }

      // const currentCameraY = cameraYRef.current;

      drawTracks(ctx, canvas, players.length);
      drawBridges(ctx, bridges, players.length, canvas, runners);

      runners.forEach((r) => {
        drawRunner(ctx, r);
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, players.length, runners, bridges]);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        className={styles.raceCanvas}
      />
    </div>
  );
};

const drawTracks = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  count: number,
) => {
  const { BASE_RADIUS, LANE_WIDTH, STRAIGHT_RATIO } = TRACK_SETTING;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const STRAIGHT_LEN = canvas.width * STRAIGHT_RATIO;

  ctx.strokeStyle = "rgba(162, 38, 255, 0.3)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#A226FF";

  for (let i = 0; i < count; i++) {
    const landRadius = BASE_RADIUS + i * LANE_WIDTH;
    const startX = centerX - STRAIGHT_LEN / 2;
    const endX = centerX + STRAIGHT_LEN / 2;

    ctx.beginPath();

    ctx.moveTo(startX, centerY - landRadius);
    ctx.lineTo(endX, centerY - landRadius);

    ctx.arc(endX, centerY, landRadius, -Math.PI / 2, Math.PI / 2, false);

    ctx.lineTo(startX, centerY + landRadius);

    ctx.arc(startX, centerY, landRadius, Math.PI / 2, -Math.PI / 2, false);

    ctx.closePath();
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const getTrackPos = (
  dist: number,
  lane: number,
  laneCount: number,
  canvas: HTMLCanvasElement,
) => {
  const { BASE_RADIUS, LANE_WIDTH, STRAIGHT_RATIO } = TRACK_SETTING;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const STRAIGHT_LEN = canvas.width * STRAIGHT_RATIO;

  // ★ 핵심: 모든 레인이 동일한 '각도'와 '진행도'를 갖도록 기준 길이를 고정합니다.
  // 실제 반지름은 lane마다 다르지만, 거리 계산용 반지름은 하나로 통일합니다.
  const REFERENCE_RADIUS = BASE_RADIUS;
  const laneRadius = BASE_RADIUS + lane * LANE_WIDTH; // 실제 그릴 위치의 반지름

  const SEMI_CIRCLE_LEN = Math.PI * REFERENCE_RADIUS;
  const TOTAL_LAP = STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN * 2;

  const d = dist % TOTAL_LAP;
  const startX = centerX - STRAIGHT_LEN / 2;
  const endX = centerX + STRAIGHT_LEN / 2;

  // 1. 상단 직선
  if (d < STRAIGHT_LEN) {
    return { x: startX + d, y: centerY - laneRadius };
  }
  // 2. 우측 곡선
  else if (d < STRAIGHT_LEN + SEMI_CIRCLE_LEN) {
    // 거리를 REFERENCE_RADIUS로 나누어 '각도'를 먼저 구합니다.
    const angle = (d - STRAIGHT_LEN) / REFERENCE_RADIUS - Math.PI / 2;
    // 그 각도에 '실제 laneRadius'를 곱해서 좌표를 찍습니다.
    return {
      x: endX + Math.cos(angle) * laneRadius,
      y: centerY + Math.sin(angle) * laneRadius,
    };
  }
  // 3. 하단 직선
  else if (d < STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN) {
    const dOnBottom = d - STRAIGHT_LEN - SEMI_CIRCLE_LEN;
    return { x: endX - dOnBottom, y: centerY + laneRadius };
  }
  // 4. 좌측 곡선
  else {
    const angle =
      (d - STRAIGHT_LEN * 2 - SEMI_CIRCLE_LEN) / REFERENCE_RADIUS + Math.PI / 2;
    return {
      x: startX + Math.cos(angle) * laneRadius,
      y: centerY + Math.sin(angle) * laneRadius,
    };
  }
};

const drawRunner = (ctx: CanvasRenderingContext2D, r: Runner) => {
  const displayLane = r.visualLane !== undefined ? r.visualLane : r.lane;
  const { x, y } = getTrackPos(r.y, displayLane, 0, ctx.canvas);

  ctx.fillStyle = r.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = r.color;
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.font = "bold 15px Pretendard, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textMetrics = ctx.measureText(r.name);
  const paddingH = 10;
  const rectWidth = textMetrics.width + paddingH * 2;
  const rectHeight = 22;
  const rectX = x - rectWidth / 2;
  const rectY = y - 33 - rectHeight / 2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();

  if (ctx.roundRect) {
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 6);
  } else {
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
  }
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(r.name, x, y - 33);
};

// const drawBridges = (
//   ctx: CanvasRenderingContext2D,
//   bridges: Bridge[],
//   laneCount: number,
//   canvas: HTMLCanvasElement,
//   runners: Runner[],
// ) => {
//   if (runners.length === 0) return;

//   ctx.lineWidth = 3;

//   const leaderY = Math.max(...runners.map((r) => r.y));
//   const VISIBLE_DISTANCE = 1000;
//   const FULL_VISIBLE_DISTANCE = 300;

//   bridges.forEach((bridge) => {
//     const distanceToBridge = bridge.floor - leaderY;

//     if (distanceToBridge > VISIBLE_DISTANCE || distanceToBridge < -200) return;

//     let alpha =
//       1 -
//       (distanceToBridge - FULL_VISIBLE_DISTANCE) /
//         (VISIBLE_DISTANCE - FULL_VISIBLE_DISTANCE);
//     alpha = Math.max(0, Math.min(1, alpha));

//     const startPos = getTrackPos(
//       bridge.floor,
//       bridge.fromPlayer,
//       laneCount,
//       canvas,
//     );
//     const endPos = getTrackPos(
//       bridge.floor,
//       bridge.fromPlayer + 1,
//       laneCount,
//       canvas,
//     );

//     const bridgeColor = bridge.color || "#A226FF";

//     ctx.globalAlpha = alpha;
//     ctx.strokeStyle = bridgeColor;
//     ctx.shadowColor = bridgeColor;
//     ctx.shadowBlur = 12 * alpha; // 멀리 있을 땐 네온 효과도 약하게

//     ctx.beginPath();
//     ctx.moveTo(startPos.x, startPos.y);
//     ctx.lineTo(endPos.x, endPos.y);
//     ctx.stroke();
//   });

//   ctx.globalAlpha = 1.0;
//   ctx.shadowBlur = 0;
// };

const drawBridges = (
  ctx: CanvasRenderingContext2D,
  bridges: Bridge[],
  laneCount: number,
  canvas: HTMLCanvasElement,
  runners: Runner[],
) => {
  if (runners.length === 0) return;

  const leaderY = Math.max(...runners.map((r) => r.y));
  const tailY = Math.min(...runners.map((r) => r.y));

  bridges.forEach((bridge) => {
    // ★ 이미 사용된 다리는 렌더링하지 않음
    if (bridge.isUsed) return;

    // 시야 범위 밖의 다리 최적화
    const distToLeader = bridge.floor - leaderY;
    if (distToLeader > 1000 || bridge.floor < tailY - 200) return;

    // 페이드 인 연출 (앞에서 나타나는 효과)
    let alpha = 1;
    if (distToLeader > 0) {
      alpha = 1 - distToLeader / 1000;
    }
    alpha = Math.max(0, Math.min(1, alpha));

    const startPos = getTrackPos(
      bridge.floor,
      bridge.fromPlayer,
      laneCount,
      canvas,
    );
    const endPos = getTrackPos(
      bridge.floor,
      bridge.fromPlayer + 1,
      laneCount,
      canvas,
    );

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = bridge.color || "#A226FF";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10 * alpha;
    ctx.shadowColor = ctx.strokeStyle;

    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.stroke();
    ctx.restore();
  });
};

export default RunnerCanvas;
