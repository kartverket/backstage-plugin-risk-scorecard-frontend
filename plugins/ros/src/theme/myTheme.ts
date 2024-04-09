import {
  UnifiedTheme,
  createBaseThemeOptions,
  createUnifiedTheme,
  palettes,
} from '@backstage/theme';
import { Theme, useTheme } from '@material-ui/core';

export const myTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.light,
      background: {
        default: '#EEEEEE',
        light: '#EEEEEE',
        dark: '#333333',
      },
      boxColor: {
        main: '#FFFFFF',
        light: '#FFFFFF',
        dark: '#404040',
      },
      lineColor: {
        main: '#D9D9D9',
        light: '#D9D9D9',
        dark: '#616161',
      },
      interactionElement: {
        main: '#2E77D0',
        light: '#2E77D0',
      },
      text: {
        primary: '#333333',
        light: '#333333',
        dark: '#FFFFFF',
      },

      green: {
        main: '#6BC6A4',
      },
      yellow: {
        main: '#FBE369',
      },
      orange: {
        main: '#FF8B38',
      },
      red: {
        main: '#F23131',
      },
    },
  }),
  fontFamily: 'Comic Sans MS',
});

export const myDarkTheme = createUnifiedTheme({
  ...createBaseThemeOptions({
    palette: {
      ...palettes.dark,
      background: {
        default: '#333333',
      },
      boxColor: {
        main: '#404040',
      },
      lineColor: {
        main: '#616161',
      },
      interactionElement: {
        main: '#9BC9FE',
      },
      text: {
        primary: '#FFFFFF',
      },

      green: {
        main: '#6BC6A4',
      },
      yellow: {
        main: '#FBE369',
      },
      orange: {
        main: '#FF8B38',
      },
      red: {
        main: '#F23131',
      },
    },
  }),
  fontFamily: 'Comic Sans MS',
});

export const MyTheme = () => {
  const theme = useTheme();
  return theme.palette.type === 'light' ? myTheme : myDarkTheme;
};
