import { useState } from "react";
import styles from "./SetupForm.module.scss";

interface Props {
  onStart: (players: any[]) => void;
}

const NEON_COLORS = [
  "#00f3ff",
  "#ff00de",
  "#39ff14",
  "#ffea00",
  "#ff4d00",
  "#bd00ff",
];

const SetupForm = ({ onStart }: Props) => {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>(["", ""]);

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    setNames(
      Array(newCount)
        .fill("")
        .map((_, i) => names[i] || ""),
    );
  };

  const handleNameChange = (index: number, val: string) => {
    const newNames = [...names];
    newNames[index] = val;
    setNames(newNames);
  };

  const handleSubmit = () => {
    const players = names.map((name, i) => ({
      id: i,
      name: name || `PLAYER ${i + 1}`,
      color: NEON_COLORS[i % NEON_COLORS.length],
    }));
    onStart(players);
  };

  const MIN = 2;
  const MAX = 6;
  const percentage = ((count - MIN) / (MAX - MIN)) * 100;

  return (
    <div className={styles.setupCard}>
      <h1 className={styles.glitchText} data-text="GAME SETUP">
        인원 설정
      </h1>

      <div className={styles.stepperContainer}>
        <div className={styles.stepperWrapper}>
          <button
            className={styles.stepBtn}
            onClick={() => handleCountChange(Math.max(count - 1, MIN))}
            disabled={count <= MIN}
            content="-"
          >
            -
          </button>
          <div className={styles.countDisplay}>
            <span className={styles.countNumber}>{count}</span>
            <span className={styles.countUnit}>명</span>
          </div>
          <button
            className={styles.stepBtn}
            onClick={() => handleCountChange(Math.min(count + 1, MAX))}
            disabled={count >= MAX}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.nameList}>
        {names.map((name, i) => (
          <div
            key={i}
            className={styles.nameInput}
            style={{ "--neon": NEON_COLORS[i] } as any}
          >
            <span className={styles.dot} />
            <input
              placeholder={`PLAYER ${i + 1} NAME`}
              value={name}
              onChange={(e) => handleNameChange(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className={styles.startButton} onClick={handleSubmit}>
        START GLITCH
      </button>
    </div>
  );
};

export default SetupForm;
