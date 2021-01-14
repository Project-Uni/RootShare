const currentTheme = 'default'; //TODO - In the future, we can get the theme from redux and export the correct one from here using store.getState

type Theme = {
  white: string;
  dark: string;
  primary: string;
  secondary: string;
  background: string;
  primaryText: string;
  secondaryText: string;
  error: string;
  success: string;
  bright: string;
  altText: string;
  disabledButton: string;
  buttonHighlight: string;
  universityAccent: string;
};

const theme: { default: Theme; dark: Theme } = {
  default: {
    white: '#F8F8FF',
    dark: 'black',
    primary: '#1D2445',
    secondary: '',
    background: 'rgb(227, 227, 227)',
    primaryText: 'black',
    secondaryText: '#6D738E',
    error: '#900C1C',
    success: '#4BB543',
    bright: '#6699FF',
    altText: '#F8F8FF',
    disabledButton: 'lightgray',
    buttonHighlight: '#3C4469',
    universityAccent: '#CEB888',
  },
  dark: {
    white: '',
    dark: '',
    primary: '',
    secondary: '',
    background: '',
    primaryText: '',
    secondaryText: '',
    error: '',
    success: '',
    bright: '',
    altText: '',
    disabledButton: '',
    buttonHighlight: '',
    universityAccent: '',
  },
};

export function addAlpha(hex: string, alpha: number) {
  if (alpha < 0 || alpha > 1) return hex;

  let alphaHex = (alpha * 255).toString(16).split('.')[0];
  if (alphaHex.length === 1) alphaHex = '0'.concat(alphaHex);

  return hex.concat(alphaHex);
}

export default theme[currentTheme];
