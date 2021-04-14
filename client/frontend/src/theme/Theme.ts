import { createMuiTheme } from '@material-ui/core';

const currentTheme = 'default'; //TODO - In the future, we can get the theme from redux and export the correct one from here using store.getState

type Theme = {
  white: string;
  dark: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  secondaryForeground: string;
  primaryHover: string;
  primaryText: string;
  secondaryText: string;
  error: string;
  success: string;
  notify: string;
  bright: string;
  brightHover: string;
  altText: string;
  disabledButton: string;
  // buttonHighlight: string;
  transparent: '#00000000';
  universityAccent: { [key: string]: string };
  fullShadow: string;
  noShadow: string;
};

const theme: { default: Theme; dark: Theme } = {
  default: {
    //white: '#F8F8FF',
    dark: 'black',
    //primary: '#1D2445',
    secondary: '',
    // background: 'rgb(227, 227, 227)',
    //primaryText: 'black',
    //secondaryText: '#545454',
    error: '#900C1C',
    success: '#4BB543',
    notify: '#f57c00',
    //bright: '#6699FF',
    //altText: '#F8F8FF',
    // buttonHighlight: '#3C4469',
    universityAccent: {
      '5eb89c308cc6636630c1311f': '#CEB888',
    },
    transparent: '#00000000',

    // UPDATED COLORS
    white: '#FFFFFF',
    primary: '#545454',
    primaryHover: '#C4C4C4',
    accent: '#FFF9E1',
    background: '#E5E5E5',
    foreground: '#FBFBFB',
    secondaryForeground: '#F7F9FA',
    bright: '#61C87F',
    brightHover: '#7BD294',
    altText: '#FFFFFF',
    primaryText: '#252525',
    secondaryText: '#545454',
    disabledButton: 'lightgray',
    fullShadow: customShadow(0, 0, 12, '#444444', 0.4),
    noShadow: customShadow(0, 0, 0, '#000000', 0),
  },
  dark: {
    white: '',
    dark: '',
    primary: '',
    primaryHover: '',
    secondary: '',
    accent: '',
    background: '',
    foreground: '',
    secondaryForeground: '',
    primaryText: '',
    secondaryText: '',
    error: '',
    success: '',
    notify: '',
    bright: '',
    brightHover: '',
    altText: '',
    disabledButton: '',
    // buttonHighlight: '',
    transparent: '#00000000',
    universityAccent: {},
    fullShadow: '',
    noShadow: '',
  },
};

export function addAlpha(hex: string, alpha: number) {
  if (alpha < 0 || alpha > 1) return hex;

  let alphaHex = (alpha * 255).toString(16).split('.')[0];
  if (alphaHex.length === 1) alphaHex = '0'.concat(alphaHex);

  return hex.concat(alphaHex);
}

export function customShadow(
  xOffset: number,
  yOffset: number,
  blurRadius: number,
  color: string,
  opacity: number
) {
  return `${xOffset}px ${yOffset}px ${blurRadius}px ${addAlpha(color, opacity)}`;
}

export default theme[currentTheme];

declare module '@material-ui/core/styles/createMuiTheme' {
  interface Theme {
    text: {
      primary: string;
      secondary: string;
      alt: string;
    };
    shadow: {
      full: string;
      none: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    branding: {
      primary: string;
      primaryHover: string;
      university: { [k: string]: string };
      accent: string;
    };
    status: {
      success: string;
      error: string;
      disabledButton: string;
    };
    colors: {
      white: string;
      dark: string;
      transparent: string;
    };
  }
  interface ThemeOptions extends Theme {}
}

export const muiTheme = createMuiTheme({
  palette: { primary: { main: '#61C87F' }, error: { main: '#FA8072' } },
  text: {
    primary: '#252525',
    secondary: '#545454',
    alt: '#FFFFFF',
  },
  shadow: {
    full: customShadow(0, 0, 12, '#444444', 0.4),
    none: customShadow(0, 0, 0, '#000000', 0),
  },
  background: {
    primary: '#E5E5E5',
    secondary: '#FBFBFB',
    tertiary: '#F7F9FA',
  },
  branding: {
    primary: '#61C87F',
    primaryHover: '#7BD294',
    university: {
      '5eb89c308cc6636630c1311f': '#CEB888',
    },
    accent: '#FFF9E1',
  },
  status: { error: '#900C1C', success: '#4BB543', disabledButton: 'lightgray' },
  colors: { white: '#FFFFFF', dark: 'black', transparent: '#00000000' },
});
