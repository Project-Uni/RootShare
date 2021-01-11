const currentTheme = 'default'; //TODO - In the future, we can get the theme from redux and export the correct one from here using store.getState

type Theme = {
  white: string;
  dark: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  primaryHover: string,
  primaryText: string;
  secondaryText: string;
  error: string;
  success: string;
  bright: string;
  brightHover: string;
  altText: string;
  disabledButton: string;
  buttonHighlight: string;
  universityAccent: string;
};

const theme: { default: Theme; dark: Theme } = {
  default: {
    //white: '#F8F8FF',
    dark: 'black',
    //primary: '#1D2445',
    secondary: '',
    //background: 'rgb(227, 227, 227)',
    //primaryText: 'black',
    //secondaryText: '#545454',
    error: '#900C1C',
    success: '#4BB543',
    //bright: '#6699FF',
    //altText: '#F8F8FF',
    buttonHighlight: '#3C4469',
    universityAccent: '#CEB888',

    // UPDATED COLORS
    white: '#FFFFFF',
    primary: '#545454',
    primaryHover: '#C4C4C4',
    accent: '#FFF9E1',
    background: '#E3E3E3',
    bright: '#61C87F',
    brightHover: '#7BD294',
    altText: '#FFFFFF',
    primaryText: 'black',
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
    primaryText: '',
    secondaryText: '',
    error: '',
    success: '',
    bright: '',
    brightHover: '',
    altText: '',
    disabledButton: '',
    buttonHighlight: '',
    universityAccent: '',
  },
};

export default theme[currentTheme];
