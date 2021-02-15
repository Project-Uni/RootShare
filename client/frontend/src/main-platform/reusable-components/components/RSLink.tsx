import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link, useHistory } from 'react-router-dom';

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
  const history = useHistory();

  const { href, className, style, children } = props;

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
  );
};
