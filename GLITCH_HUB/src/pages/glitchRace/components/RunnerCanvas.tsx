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

const RunnerCanvas: React.FC<Props> = ({ players, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const [bridges, setBridges] = useState<Bridge[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const cameraYRef = useRef<number>(-100);

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

    const laneWidth = canvas.width / (players.length + 1);

    const initialRunners: Runner[] = players.map((p, i) => ({
      ...p,
      id: String(p.id),
      lane: i,
      x: (i + 1) * laneWidth,
      targetX: (i + 1) * laneWidth,
      y: 0,
      speed: RACE_CONFIG.BASE_SPEED + Math.random() * 0.5,
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
          updateVerticalRace(
            prev,
            elapsed,
            canvas.width / (players.length + 1),
            bridges,
          ),
        );
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (runners.length > 0) {
        const maxY = Math.max(...runners.map((r) => r.y));
        const minY = Math.min(...runners.map((r) => r.y));
        const distance = maxY - minY; // 주자 간 간격

        const targetOffset = Math.min(250 + distance * 0.5, 400);
        const targetCameraY = isRunning ? maxY - targetOffset : -100;

        const lerpFactor = 0.03;
        cameraYRef.current += (targetCameraY - cameraYRef.current) * lerpFactor;
      }

      const currentCameraY = cameraYRef.current;

      const laneWidth = canvas.width / (players.length + 1);

      drawTracks(ctx, canvas, players.length);
      drawBridges(ctx, bridges, laneWidth, currentCameraY);

      runners.forEach((r) => {
        drawRunner(ctx, r, currentCameraY);
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
  const laneWidth = canvas.width / (count + 1);
  ctx.strokeStyle = "rgba(162, 38, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#A226FF";

  for (let i = 1; i <= count; i++) {
    const x = i * laneWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
};

const drawRunner = (
  ctx: CanvasRenderingContext2D,
  r: Runner,
  cameraY: number,
) => {
  const drawY = r.y - cameraY;

  ctx.fillStyle = r.color;
  ctx.shadowBlur = 10;
  ctx.shadowColor = r.color;
  ctx.beginPath();
  ctx.arc(r.x, drawY, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.font = "bold 15px Pretendard, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const textMetrics = ctx.measureText(r.name);
  const paddingH = 10;
  const rectWidth = textMetrics.width + paddingH * 2;
  const rectHeight = 22;
  const rectX = r.x - rectWidth / 2;
  const rectY = drawY - 33 - rectHeight / 2;

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.beginPath();

  if (ctx.roundRect) {
    ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 6);
  } else {
    ctx.rect(rectX, rectY, rectWidth, rectHeight);
  }
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(r.name, r.x, drawY - 33);
};

const drawBridges = (
  ctx: CanvasRenderingContext2D,
  bridges: Bridge[],
  laneWidth: number,
  cameraY: number,
) => {
  ctx.strokeStyle = "rgba(162, 38, 255, 0.8)";
  ctx.lineWidth = 4;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#A226FF";

  bridges.forEach((bridge) => {
    const drawY = bridge.floor - cameraY;
    const startX = (bridge.fromPlayer + 1) * laneWidth;
    const endX = (bridge.fromPlayer + 2) * laneWidth;

    ctx.beginPath();
    ctx.moveTo(startX, drawY);
    ctx.lineTo(endX, drawY);
    ctx.stroke();
  });

  ctx.shadowBlur = 0;
};

export default RunnerCanvas;
