const colors = {
  primary: '#242D56', // Dark-Blue
  secondary: '#1D2445', // Light-Dark
  ternary: '#3C4469', // Light-Blue
  background: 'rgb(227, 227, 227)', // Light-Gray
  primaryText: '#F8F8FF', // Ghost-White
  secondaryText: '#6D738E', // Light-Grey
  error: '#440C16', // Dark Red
  brightError: '#900C1C', // Red
  success: '#4BB543', // Green

  // DARK TO LIGHT COLOR PALETTE BELOW

  first: '#0C1644', // Darkest Blue
  second: '#1D2445', // Light Dark Blue
  third: '#3C4469', // Regular Blue
  fourth: '#545B7C', // Subtle Blue
  fifth: '#6D738E', // Grey Blue

  // SHADES OF BLUE
  'shade-one': '#242D56', // Dark
  'shade-two': '#1D2445', // Darker
  'shade-three': '#171D37', // Darkest

  // TINTS OF BLUE
  'tint-one': '#242D56', // Light
  'tint-two': '#505778', // Lighter
  'tint-three': '#737993', // Lightest

  // HIGHLIGHTS OF BLUE
  bright: '#6699FF', // Bright
  brightHover: '#9cbdff',

  accentColors: ['#988ADE', '#DE8AA0', '#8AAEDE', '#8ADEAD', '#DEC58A', '#8AD1DE'],
  //We can break this out into its own color names later, but just wanted to save these for now

  boilerGold: '#CEB888',
};

function addAlpha(hex, alpha) {
  if (alpha < 0 || alpha > 1) return hex;

  let alphaHex = (alpha * 255).toString(16).split('.')[0];
  if (alphaHex.length === 1) alphaHex = '0'.concat(alphaHex);

  return hex.concat(alphaHex);
}

export { colors, addAlpha };
