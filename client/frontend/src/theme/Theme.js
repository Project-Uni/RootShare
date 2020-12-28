const currentTheme = 'default'; //TODO - In the future, we can get the theme from redux and export the correct one from here using store.getState

const theme = {
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
  },
  dark: {
    white: '',
    primary: '',
    secondary: '',
    background: '',
    primaryText: '',
    secondaryText: '',
    error: '',
    success: '',
    highlight: '',
    highlightText: '',
  },
};

export default theme[currentTheme];
