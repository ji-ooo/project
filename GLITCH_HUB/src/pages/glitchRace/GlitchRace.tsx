import React, { useState } from "react";
import styles from "./GlitchRace.module.scss";
import SetupForm from "../../games/glitchRace/components/SetupForm.tsx";
import LaneSlotMachine from "../../games/glitchRace/components/LaneSlotMachine.tsx";
import CountDown from "../../games/glitchRace/components/CountDown.tsx";
import RunnerCanvas from "../../games/glitchRace/components/RunnerCanvas.tsx";
import type { Player, GameState } from "../../games/glitchRace/types";

const GlitchRacePage = () => {
  const [gameState, setGameState] = useState<GameState>("SETUP");
  const [isCounting, setIsCounting] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const handleSetupComplete = (finalPlayers: Player[]) => {
    setPlayers(finalPlayers);
    setGameState("READY");
  };

  const handleShuffleComplete = (shuffledPlayers: Player[]) => {
    setPlayers(shuffledPlayers); // 섞인 순서로 최종 확정
    setGameState("PLAYING");
    setIsCounting(true);
  };

  return (
    <div className={styles.gameContainer}>
      {gameState === "SETUP" && <SetupForm onStart={handleSetupComplete} />}

      {gameState === "READY" && (
        <LaneSlotMachine players={players} onFinish={handleShuffleComplete} />
      )}

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
