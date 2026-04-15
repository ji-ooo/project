import React, { useEffect, useRef, useState } from "react";
import type { Player, Runner } from "../../../games/glitchRace/types";
import {
  RACE_CONFIG,
  updateVerticalRace,
} from "../../../games/glitchRace/logic/ladderGenerator";
import styles from "./RunnerCanvas.module.scss";

interface Props {
  players: Player[];
  isRunning: boolean;
}

const RunnerCanvas: React.FC<Props> = ({ players, isRunning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [runners, setRunners] = useState<Runner[]>([]);
  const startTimeRef = useRef<number | null>(null);

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
  }, [players]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frameId: number;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTracks(ctx, canvas, players.length);

      if (isRunning) {
        if (!startTimeRef.current) startTimeRef.current = time;
        const elapsed = time - startTimeRef.current;

        setRunners((prev) => {
          const next = updateVerticalRace(
            prev,
            elapsed,
            canvas.width / (players.length + 1),
          );

          const cameraY = Math.max(...next.map((r) => r.y)) - 100;
          next.forEach((r) => drawRunner(ctx, r, cameraY));
          return next;
        });
      } else {
        runners.forEach((r) => drawRunner(ctx, r, -100));
      }
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, players.length]);

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
  ctx.arc(r.x, drawY, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.fillText(r.name, r.x, drawY - 20);
};

export default RunnerCanvas;
