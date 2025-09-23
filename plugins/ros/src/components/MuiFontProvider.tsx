import {
  createTheme as createThemeMuiV4,
  ThemeProvider as ThemeProviderMuiV4,
} from '@material-ui/core';
import {
  createTheme as createThemeMuiV5,
  ThemeProvider as ThemeProviderMuiV5,
} from '@mui/material';
import { ReactNode } from 'react';

type MuiFontProviderProps = {
  children: ReactNode;
};

/**
 * The MUI font provider is used to make sure MUI components uses the same
 * font as Backstage UI while the migration from Material UI to Backstage UI
 * is ongoing. After the migration, the MuiFontProvider could be removed.
 */
export function MuiFontProvider(props: MuiFontProviderProps) {
  const fontFamily = [
    //'"Times New Roman"', uncomment to easily see where the fonts are applied
    '"Segoe UI"',
    'Roboto',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
  ].join(',');
  const muiV4Fonts = createThemeMuiV4({
    typography: {
      fontFamily: fontFamily,
    },
  });
  const muiV5Fonts = createThemeMuiV5({
    typography: {
      fontFamily: fontFamily,
    },
  });
  return (
    <ThemeProviderMuiV4 theme={muiV4Fonts}>
      <ThemeProviderMuiV5 theme={muiV5Fonts}>
        {props.children}
      </ThemeProviderMuiV5>
    </ThemeProviderMuiV4>
  );
}
