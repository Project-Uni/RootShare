import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Theme from '../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  base: {
    margin: 0,
  },
  multiline: {
    whiteSpace: 'pre-wrap',
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

export type TextWeight = 'normal' | 'light' | 'bold';

type Props = {
  type?: 'head' | 'subhead' | 'body' | 'other';
  bold?: boolean; // TODO: refactor this to use weight prop
  weight: TextWeight;
  italic?: boolean;
  multiline?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  hoverColor?: string;
  children?: React.ReactNode;
  onClick?: () => any;
};

function RSText(
  props: Props &
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLParagraphElement>,
      HTMLParagraphElement
    >
) {
  const styles = useStyles();

  const {
    type,
    bold,
    weight,
    italic,
    multiline,
    size,
    className,
    style: styleProps,
    color,
    hoverColor,
    children,
    onClick,
    ...rest
  } = props;

  const [style, setStyle] = useState({
    ...styleProps,
    fontSize: `${size}pt`,
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
        multiline && styles.multiline,
        italic && styles.italic,
      ].join(' ')}
      style={style}
      onMouseEnter={hoverColor ? handleMouseOver : undefined}
      onMouseLeave={hoverColor ? handleMouseLeave : undefined}
      onClick={onClick}
      {...rest}
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
