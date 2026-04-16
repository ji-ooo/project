import React, { useEffect, useState } from "react";
import type { Player } from "../types";
import styles from "./LaneSlotMachine.module.scss";

interface Props {
  players: Player[];
  onFinish: (shuffled: Player[]) => void;
}

const LaneSlotMachine = ({ players, onFinish }: Props) => {
  const [shuffled, setShuffled] = useState<Player[]>([...players]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let count = 0;
    const maxTicks = 12; // 셔플 횟수

    const timer = setInterval(() => {
      setShuffled((prev) => {
        const next = [...prev];
        // 피셔-예이츠 셔플
        for (let i = next.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [next[i], next[j]] = [next[j], next[i]];
        }
        return next;
      });

      count++;
      if (count >= maxTicks) {
        clearInterval(timer);
        setIsDone(true);
        // 1초 뒤에 셔플 결과와 함께 다음 단계로
        setTimeout(() => onFinish(shuffled), 1000);
      }
    }, 120); // 셔플 속도

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>ASSIGNING LANES...</h2>
        <div className={styles.slotBox}>
          {shuffled.map((p, i) => (
            <div key={p.id} className={styles.row} style={{ color: p.color }}>
              <span className={styles.laneIdx}>LANE {i + 1}</span>
              <span className={styles.name}>{p.name}</span>
            </div>
          ))}
        </div>
        {isDone && <div className={styles.fixed}>LANE FIXED!</div>}
      </div>
    </div>
  );
};

export default LaneSlotMachine;
