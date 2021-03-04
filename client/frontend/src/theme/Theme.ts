const currentTheme = 'default'; //TODO - In the future, we can get the theme from redux and export the correct one from here using store.getState

type Theme = {
  white: string;
  dark: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  primaryHover: string;
  primaryText: string;
  secondaryText: string;
  error: string;
  success: string;
  bright: string;
  brightHover: string;
  altText: string;
  disabledButton: string;
  buttonHighlight: string;
  transparent: '#00000000';
  universityAccent: { [key: string]: string };
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
    //bright: '#6699FF',
    //altText: '#F8F8FF',
    buttonHighlight: '#3C4469',
    universityAccent: {
      '5eb89c308cc6636630c1311f': '#CEB888',
    },
    transparent: '#00000000',

    // UPDATED COLORS
    white: '#FFFFFF',
    primary: '#545454',
    primaryHover: '#C4C4C4',
    accent: '#FFF9E1',
    background: '#E3E3E3',
    foreground: '#FBFBFB',
    bright: '#61C87F',
    brightHover: '#7BD294',
    altText: '#FFFFFF',
    primaryText: '#000000',
    secondaryText: '#545454',
    disabledButton: 'lightgray',
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
    primaryText: '',
    secondaryText: '',
    error: '',
    success: '',
    bright: '',
    brightHover: '',
    altText: '',
    disabledButton: '',
    buttonHighlight: '',
    transparent: '#00000000',
    universityAccent: {},
  },
};

export function addAlpha(hex: string, alpha: number) {
  if (alpha < 0 || alpha > 1) return hex;

  let alphaHex = (alpha * 255).toString(16).split('.')[0];
  if (alphaHex.length === 1) alphaHex = '0'.concat(alphaHex);

  return hex.concat(alphaHex);
}

export function addShadow(
  xOffset: number,
  yOffset: number,
  blurRadius: number,
  color: string,
  opacity: number
) {
  return `${xOffset}px ${yOffset}px ${blurRadius}px ${addAlpha(color, opacity)}`;
}

export default theme[currentTheme];
