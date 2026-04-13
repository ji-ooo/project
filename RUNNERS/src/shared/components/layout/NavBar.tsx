import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NavBar.module.scss";
import ThemeSwitcher from "./ThemeSwitcher";
import logo from "../../../assets/logo.png";

function NavBar() {
  const navigate = useNavigate();

  return (
    <div className={styles.navbar}>
      <img
        src={logo}
        alt="Logo"
        className={styles.logo}
        onClick={() => navigate("/")}
      />
      <ThemeSwitcher />
    </div>
  );
}

export default NavBar;
