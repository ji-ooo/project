import React, { useEffect, useState } from "react";
import styles from "./CountDown.module.scss";

interface Props {
  onComplete: () => void;
}

const CountDown = ({ onComplete }: Props) => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1050);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className={styles.overlay}>
      <div
        key={count}
        className={styles.countText}
        data-text={count === 0 ? "START" : count}
      >
        {count === 0 ? "START" : count}
      </div>
    </div>
  );
};

export default CountDown;
