import React from 'react';
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
  children?: React.ReactNode;
};

function RSText(props: Props) {
  const styles = useStyles();

  const type = props.type ? props.type : 'body';

  return (
    <p
      className={[
        styles.base,
        type === 'head' ? styles.title : type === 'other' ? null : styles.normal,
        props.bold ? styles.bold : null,
        props.italic ? styles.italic : null,
        props.className ? props.className : null,
      ].join(' ')}
      style={{
        fontSize: props.size ? `${props.size}pt` : '12pt',
        color: props.color || 'black',
      }}
    >
      {props.children}
    </p>
  );
}

export default RSText;
