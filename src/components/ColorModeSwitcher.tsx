import * as React from "react";
import {
  useColorMode,
  useColorModeValue,
  BoxProps,
  Box,
} from "@chakra-ui/react";
import { DarkModeSwitch } from "react-toggle-dark-mode";

type ColorModeSwitcherProps = Omit<BoxProps, "aria-label">;

export const ColorModeSwitcher: React.FC<ColorModeSwitcherProps> = (props) => {
  const { toggleColorMode } = useColorMode();
  const isDark = useColorModeValue(false, true);

  return (
    <Box {...props}>
      <DarkModeSwitch
        checked={isDark}
        onChange={toggleColorMode}
        size={25}
        sunColor="orange"
      />
    </Box>
  );
};
