import { useEffect, useRef, useState } from "react";
import styles from "./SideBar.module.scss";
import MenuIcon from "@mui/icons-material/Menu";

function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const sideBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sideBarRef.current &&
        !sideBarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={sideBarRef}
      className={`${styles.wrapper} ${isOpen ? styles.open : ""}`}
    >
      <button
        className={`${styles.toggleButton} ${isOpen ? styles.buttonOpen : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>

      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <a href="/about">About</a>
        <a href="/runners">RUNNERS</a>
      </div>
    </div>
  );
}

export default SideBar;
