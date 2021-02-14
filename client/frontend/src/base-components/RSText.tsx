import React, { useState } from 'react';
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

type Props = {
  type?: 'head' | 'subhead' | 'body' | 'other';
  bold?: boolean;
  italic?: boolean;
  size?: number;
  className?: string;
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
    italic,
    size,
    className,
    color,
    hoverColor,
    children,
    onClick,
  } = props;

  const [style, setStyle] = useState({
    fontSize: `${size}pt`,
    color,
  });

  function handleMouseOver() {
    setStyle({ ...style, color: hoverColor });
  }

  function handleMouseLeave() {
    setStyle({ ...style, color });
  }

  return (
    <p
      className={[
        styles.base,
        color ? null : styles.defaultColor,
        className,
        type === 'head' ? styles.title : type === 'other' ? null : styles.normal,
        bold ? styles.bold : null,
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
  size: 12,
};

export default RSText;
