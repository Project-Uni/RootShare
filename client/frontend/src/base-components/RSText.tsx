import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Theme from '../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  base: {
    margin: 0,
  },
  title: {
    // fontFamily: 'Lora, serif',
    fontFamily: 'Lato',
    // fontFamily: 'Raleway'
  },
  normal: {
    fontFamily: 'Lato',
  },
  light: {
    fontWeight: 300,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  defaultColor: {
    color: Theme.primaryText,
  },
}));

export type TextTransformType = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

export type TextWeight = 'normal' | 'light' | 'bold';

type Props = {
  type?: 'head' | 'subhead' | 'body' | 'other';
  bold?: boolean; // TODO: refactor this to use weight prop
  weight: TextWeight;
  italic?: boolean;
  caps?: TextTransformType;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  hoverColor?: string;
  children?: React.ReactNode;
  onClick?: () => any;
};

function RSText(props: Props) {
  const styles = useStyles();

  const {
    type,
    bold,
    weight,
    italic,
    caps,
    size,
    className,
    style: styleProps,
    color,
    hoverColor,
    children,
    onClick,
  } = props;

  const [style, setStyle] = useState({
    ...styleProps,
    fontSize: `${size}pt`,
    textTransform: caps,
    color,
  });

  function handleMouseOver() {
    setStyle({ ...style, color: hoverColor });
  }

  function handleMouseLeave() {
    setStyle({ ...style, color });
  }

  useEffect(() => {
    setStyle({ ...style, color });
  }, [color]);

  return (
    <p
      className={[
        styles.base,
        color ? null : styles.defaultColor,
        className,
        type === 'head' ? styles.title : type === 'other' ? null : styles.normal,
        bold && styles.bold,
        styles[weight],
        italic ? styles.italic : null,
      ].join(' ')}
      style={style}
      onMouseEnter={hoverColor ? handleMouseOver : undefined}
      onMouseLeave={hoverColor ? handleMouseLeave : undefined}
      onClick={onClick}
    >
      {children}
    </p>
  );
}

RSText.defaultProps = {
  type: 'body',
  weight: 'normal',
  caps: 'none',
  size: 12,
};

export default RSText;
