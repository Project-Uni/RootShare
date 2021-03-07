import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  link: {
    color: 'inherit',
  },
  pointer: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  none: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  hover: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  static: {},
}));

type Props = {
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children: JSX.Element[] | JSX.Element | string;
  underline: 'none' | 'hover' | 'static';
};

export const RSLink = (props: Props) => {
  const styles = useStyles();

  const { href, onClick, className, style, children, underline } = props;

  return href ? (
    <Link
      to={href}
      style={style}
      className={[className, styles.link, styles.pointer, styles[underline]].join(
        ' '
      )}
    >
      {children}
    </Link>
  ) : (
    <a
      href={undefined}
      onClick={onClick}
      style={style}
      className={[className, styles.link, styles.pointer, styles[underline]].join(
        ' '
      )}
    >
      {children}
    </a>
  );
};

RSLink.defaultProps = {
  underline: 'none',
};
