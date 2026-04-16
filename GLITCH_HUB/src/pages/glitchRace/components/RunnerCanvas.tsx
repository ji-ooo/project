import React, { useEffect, useRef, useState } from "react";
import type { Player, Runner, Bridge } from "../../../games/glitchRace/types";
import {
  generateLadders,
  RACE_CONFIG,
} from "../../../games/glitchRace/logic/ladderGenerator";
import { updateVerticalRace } from "../../../games/glitchRace/logic/raceEngine";
import styles from "./RunnerCanvas.module.scss";

interface Props {
  players: Player[];
  isRunning: boolean;
}

export const TRACK_SETTING = {
  BASE_RADIUS: 150,
  LANE_WIDTH: 40,
  STRAIGHT_RATIO: 0.5,
  STROKE_WIDTH: 2,
  DEFAULT_ZOOM: 1.5,
  MIN_ZOOM: 1.0,
  MAX_ZOOM: 2.2,
  CAMERA_LERP: 0.08,
};

const RunnerCanvas: React.FC<Props> = ({ players, isRunning }) => {
  // 렌더링 트리거를 위한 최소한의 state
  const [, setTick] = useState(0);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [zoom, setZoom] = useState(TRACK_SETTING.DEFAULT_ZOOM);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraPosRef = useRef({ x: 0, y: 0 });
  const runnersRef = useRef<Runner[]>([]);

  // 1. 캔버스 사이즈 최적화 (ResizeObserver 하나로 관리)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      canvas.width = width;
      canvas.height = height;
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  // 2. 초기 데이터 셋업
  useEffect(() => {
    const initialRunners: Runner[] = players.map((p, i) => ({
      id: String(p.id),
      name: p.name,
      lane: i,
      visualLane: i,
      y: 0,
      speed: RACE_CONFIG.BASE_SPEED,
      status: "RUNNING",
      color: p.color,
      lastBridgeId: null,
    }));

    runnersRef.current = initialRunners;
    const newLadders = generateLadders(players.length, 5000);
    setBridges(newLadders);
  }, [players]);

  // 3. 메인 게임 루프 (Ref 중심)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frameId: number;

    const render = () => {
      if (isRunning && runnersRef.current.length > 0 && canvasRef.current) {
        // [물리 엔진]
        const nextRunners = updateVerticalRace(
          runnersRef.current,
          bridges,
          canvasRef.current.width,
        );
        runnersRef.current = nextRunners;

        // [카메라 & 줌 계산]
        const leader = nextRunners.reduce((prev, curr) =>
          prev.y > curr.y ? prev : curr,
        );
        const tail = nextRunners.reduce((prev, curr) =>
          prev.y < curr.y ? prev : curr,
        );
        const distance = leader.y - tail.y;

        const leaderPos = getTrackPos(
          leader.y,
          leader.visualLane ?? leader.lane,
          canvas,
        );
        const targetZoom =
          TRACK_SETTING.MAX_ZOOM -
          (Math.min(1000, Math.max(0, distance - 500)) / 1000) *
            (TRACK_SETTING.MAX_ZOOM - TRACK_SETTING.MIN_ZOOM);

        const lerp = TRACK_SETTING.CAMERA_LERP;
        cameraPosRef.current.x += (leaderPos.x - cameraPosRef.current.x) * lerp;
        cameraPosRef.current.y += (leaderPos.y - cameraPosRef.current.y) * lerp;

        const nextZoom = zoom + (targetZoom - zoom) * lerp;
        setZoom(nextZoom);

        // [그리기]
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(nextZoom, nextZoom);
        ctx.translate(-cameraPosRef.current.x, -cameraPosRef.current.y);

        drawTracks(ctx, canvas, players.length);
        drawBridges(ctx, bridges, canvas, leader.y, tail.y);
        nextRunners.forEach((r) => drawRunner(ctx, r));

        ctx.restore();

        // 리액트 외부의 물리 변화를 반영하기 위해 강제 틱 발생 (필요 시)
        setTick((t) => t + 1);
      }
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, bridges, players.length, zoom]);

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.raceCanvas} />
    </div>
  );
};

// --- Helper Functions (최적화) ---

const getTrackPos = (dist: number, lane: number, canvas: HTMLCanvasElement) => {
  const { BASE_RADIUS, LANE_WIDTH, STRAIGHT_RATIO } = TRACK_SETTING;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const STRAIGHT_LEN = canvas.width * STRAIGHT_RATIO;
  const laneRadius = BASE_RADIUS + lane * LANE_WIDTH;

  const SEMI_CIRCLE_LEN = Math.PI * BASE_RADIUS;
  const TOTAL_LAP = STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN * 2;

  const d = dist % TOTAL_LAP;
  const startX = centerX - STRAIGHT_LEN / 2;
  const endX = centerX + STRAIGHT_LEN / 2;

  if (d < STRAIGHT_LEN) {
    return { x: startX + d, y: centerY - laneRadius };
  } else if (d < STRAIGHT_LEN + SEMI_CIRCLE_LEN) {
    const angle = (d - STRAIGHT_LEN) / BASE_RADIUS - Math.PI / 2;
    return {
      x: endX + Math.cos(angle) * laneRadius,
      y: centerY + Math.sin(angle) * laneRadius,
    };
  } else if (d < STRAIGHT_LEN * 2 + SEMI_CIRCLE_LEN) {
    const dOnBottom = d - STRAIGHT_LEN - SEMI_CIRCLE_LEN;
    return { x: endX - dOnBottom, y: centerY + laneRadius };
  } else {
    const angle =
      (d - STRAIGHT_LEN * 2 - SEMI_CIRCLE_LEN) / BASE_RADIUS + Math.PI / 2;
    return {
      x: startX + Math.cos(angle) * laneRadius,
      y: centerY + Math.sin(angle) * laneRadius,
    };
  }
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

  ctx.strokeStyle = "rgba(162, 38, 255, 0.2)";
  ctx.lineWidth = 2;

  for (let i = 0; i < count; i++) {
    const r = BASE_RADIUS + i * LANE_WIDTH;
    const startX = centerX - STRAIGHT_LEN / 2;
    const endX = centerX + STRAIGHT_LEN / 2;

    ctx.beginPath();
    ctx.moveTo(startX, centerY - r);
    ctx.lineTo(endX, centerY - r);
    ctx.arc(endX, centerY, r, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(startX, centerY + r);
    ctx.arc(startX, centerY, r, Math.PI / 2, -Math.PI / 2, false);
    ctx.closePath();
    ctx.stroke();
  }
};

const drawRunner = (ctx: CanvasRenderingContext2D, r: Runner) => {
  const { x, y } = getTrackPos(r.y, r.visualLane ?? r.lane, ctx.canvas);

  // 1. 공 그리기 (네온 효과 강조)
  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = r.color;
  ctx.fillStyle = r.color;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. 이름표 최적화 (공 아래로 이동 + 배경 간소화)
  ctx.font = "bold 12px Pretendard, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const nameY = y + 25; // 공 아래쪽으로 위치 변경 (위쪽 가림 현상 방지)
  const textWidth = ctx.measureText(r.name).width;
  const padding = 6;

  // 이름표 배경 (더 투명하게)
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  const rectW = textWidth + padding * 2;
  const rectH = 18;

  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x - rectW / 2, nameY - rectH / 2, rectW, rectH, 4);
    ctx.fill();
  }

  // 이름 텍스트
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(r.name, x, nameY);
};

const drawBridges = (
  ctx: CanvasRenderingContext2D,
  bridges: Bridge[],
  canvas: HTMLCanvasElement,
  leaderY: number,
  tailY: number,
) => {
  bridges.forEach((b) => {
    const dist = b.floor - leaderY;
    if (dist > 1000 || b.floor < tailY - 200) return;

    const alpha = Math.max(0, Math.min(1, 1 - (dist - 200) / 600));
    const p1 = getTrackPos(b.floor, b.fromPlayer, canvas);
    const p2 = getTrackPos(b.floor, b.fromPlayer + 1, canvas);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = b.color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  });
};

export default RunnerCanvas;
