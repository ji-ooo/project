import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
import logo from "../../../assets/logo.png";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitles: { [key: string]: string } = {
    "/": "",
    "/about": "ABOUT",
    "/glitchrace": "GLITCH RACE",
  };

  const currentPageTitle = pageTitles[location.pathname] || "";

  return (
    <div className={styles.header}>
      <img
        src={logo}
        alt="Logo"
        className={styles.logo}
        onClick={() => navigate("/")}
      />
      <div className={styles.pageTitle}>{currentPageTitle}</div>
      <ThemeSwitcher />
    </div>
  );
}

export default Header;
