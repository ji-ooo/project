import React, { useState } from "react";
import styles from "./GlitchRace.module.scss";
import SetupForm from "./components/SetupForm.tsx";
import CountDown from "./components/CountDown.tsx";
import RunnerCanvas from "./components/RunnerCanvas.tsx";
import type { Player, GameState } from "../../games/glitchRace/types";

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
    <div className={styles.gameContainer}>
      {gameState === "SETUP" && <SetupForm onStart={handleStartGame} />}

      {gameState === "PLAYING" && (
        <div className={styles.gameArea}>
          {isCounting && <CountDown onComplete={() => setIsCounting(false)} />}

          <div className={styles.canvasWrapper}>
            <RunnerCanvas players={players} isRunning={!isCounting} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GlitchRacePage;
