import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
<<<<<<< HEAD
import { Link, useHistory } from 'react-router-dom';
=======
import { Link } from 'react-router-dom';
>>>>>>> f5db7feec8239c2203b85ba27e8d5516b3d9f612

const useStyles = makeStyles((_: any) => ({
  link: {
    color: 'inherit',
  },
  pointer: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

type Props = {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: JSX.Element[] | JSX.Element | string;
};

export const RSLink = (props: Props) => {
  const styles = useStyles();

  const { href, className, style, children } = props;

<<<<<<< HEAD
  return (
    <Link
      to={href || window.location.href}
      style={style}
      className={[className, styles.link, href ? styles.pointer : undefined].join(
        ' '
      )}
    >
      {children}
    </Link>
=======
  return href ? (
    <Link
      to={href}
      style={style}
      className={[className, styles.link, styles.pointer].join(' ')}
    >
      {children}
    </Link>
  ) : (
    <a href={undefined} style={style} className={[className, styles.link].join(' ')}>
      {children}
    </a>
>>>>>>> f5db7feec8239c2203b85ba27e8d5516b3d9f612
  );
};
