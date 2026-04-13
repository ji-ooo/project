import { useEffect, useState } from "react";
import useThemeStore from "../../shared/store/ThemeStore";
import { Link, useNavigate } from "react-router-dom";
import styles from "./NotFound.module.scss";
import logo from "../../assets/logo.png";

const NotFound = () => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === "dark") {
      //   setMainLogo(logoWhite);
    } else {
      //   setMainLogo(logo);
    }
  });

  return (
    <div>
      <img
        src={logo}
        className={styles.logo}
        alt="Not Found"
        onClick={() => navigate("/")}
      />
      <p>죄송합니다. 요청하신 페이지를 찾을 수 없습니다.</p>
      <Link to="/">홈으로 돌아가기</Link>
    </div>
  );
};

export default NotFound;
