import React from "react";
import Switch from "@mui/material/Switch";
import { CiLight, CiDark } from "react-icons/ci";
import { Box } from "@mui/material";
import useThemeStore, { Theme } from "../../store/ThemeStore";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeStore();

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.checked ? Theme.Dark : Theme.Light);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <div style={{ width: "150px", display: "flex", alignItems: "center" }}>
        <CiLight size="30" />
        <Switch
          checked={theme === Theme.Dark}
          onChange={handleToggle}
          color="default"
          slotProps={{ input: { "aria-label": "theme switch" } }}
        />
        <CiDark size="30" />
      </div>
    </Box>
  );
};

export default ThemeSwitcher;
