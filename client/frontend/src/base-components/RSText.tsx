import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: any) => ({
  base: {
    margin: 0,
  },
  title: {
    fontFamily: 'Raleway',
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
};

function RSText(props: Props) {
  const styles = useStyles();
  const [style, setStyle] = useState({
    fontSize: props.size ? `${props.size}pt` : '12pt',
    color: 'black',
  });

  const type = props.type ? props.type : 'body';

  useEffect(() => {
    if (props.color) {
      setStyle({ ...style, color: props.color });
    }
  }, []);

  function handleMouseOver() {
    setStyle({ ...style, color: props.hoverColor! });
  }

  function handleMouseLeave() {
    setStyle({ ...style, color: props.color || 'black' });
  }

  return (
    <p
      className={[
        styles.base,
        type === 'head' ? styles.title : type === 'other' ? null : styles.normal,
        props.bold ? styles.bold : null,
        props.italic ? styles.italic : null,
        props.className ? props.className : null,
      ].join(' ')}
      style={style}
      onMouseEnter={props.hoverColor ? handleMouseOver : undefined}
      onMouseLeave={props.hoverColor ? handleMouseLeave : undefined}
    >
      {props.children}
    </p>
  );
}

export default RSText;
