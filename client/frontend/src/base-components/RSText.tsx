import React, { useState } from 'react';
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
  ubuntu: {
    fontFamily: 'Ubuntu',
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
    color: props.color || undefined,
  });

  const type = props.type ? props.type : 'body';

  function handleMouseOver() {
    setStyle({ ...style, color: props.hoverColor! });
  }

  function handleMouseLeave() {
    setStyle({ ...style, color: props.color || undefined });
  }

  return (
    <p
      className={[
        styles.base,
        type === 'head'
          ? styles.title
          : type === 'other'
          ? styles.ubuntu
          : styles.normal,
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
