import React, { useState } from "react";
import styles from "./GlitchRace.module.scss";
import SetupForm from "./components/SetupForm.tsx";
import CountDown from "./components/CountDown.tsx";

export type GameState = "SETUP" | "PLAYING" | "RESULT";

export interface Player {
  id: number;
  name: string;
  color: string;
}

const GlitchRacePage = () => {
  const [gameState, setGameState] = useState<GameState>("SETUP");
  const [isCounting, setIsCounting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleStartGame = (finalPlayers: Player[]) => {
    setPlayers(finalPlayers);
    setGameState("PLAYING");
    setIsCounting(true);
  };

  return (
    <div className={styles.container}>
      {gameState === "SETUP" && <SetupForm onStart={handleStartGame} />}

      {gameState === "PLAYING" && (
        <div className={styles.gameArea}>
          {isCounting && <CountDown onComplete={() => setIsCounting(false)} />}

          {/* 카운트다운이 끝나면(isCounting === false) 실제 달리기 시작! */}
          <div className={styles.canvasWrapper}>
            {/* 여기에 나중에 만들 <RunnerCanvas isRunning={!isCounting} /> 가 들어갑니다 */}
            {!isCounting && <p>RACE START!!</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlitchRacePage;
