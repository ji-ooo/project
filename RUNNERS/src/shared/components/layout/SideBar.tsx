import { useEffect, useRef, useState } from "react";
import styles from "./SideBar.module.scss";
import useThemeStore from "../../../store/ThemeStore";
import { useSideBarStore } from "../../../store/useSideBarStore";
import MenuIcon from "@mui/icons-material/Menu";
import HouseSidingIcon from "@mui/icons-material/HouseSiding";
import InfoIcon from "@mui/icons-material/Info";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SportsScoreIcon from "@mui/icons-material/SportsScore";

function SideBar() {
  const { theme } = useThemeStore();
  const { isOpen, setIsOpen, toggle } = useSideBarStore();
  const sideBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isOpen &&
        sideBarRef.current &&
        !sideBarRef.current.contains(event.target as Node) &&
        !target.closest("header")
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
      className={`${styles.sideBar} ${isOpen ? styles.open : ""}`}
    >
      <nav className={styles.menuContent}>
        <a href="/" className={styles.menuItem}>
          <HouseSidingIcon />
          <span>Home</span>
        </a>
        <a href="/about" className={styles.menuItem}>
          {theme === "light" ? <InfoOutlinedIcon /> : <InfoIcon />}
          <span>About</span>
        </a>
        <a href="/glitchrace" className={styles.menuItem}>
          <SportsScoreIcon />
          <span>GlitchRace</span>
        </a>
        <a href="/test" className={styles.menuItem}>
          <SportsScoreIcon />
          <span>TEST</span>
        </a>
      </nav>

      <button
        className={`${styles.toggleButton} ${isOpen ? styles.buttonOpen : ""}`}
        onClick={toggle}
      >
        <MenuIcon />
      </button>
    </div>
  );
}

export default SideBar;
