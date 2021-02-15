import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((_: any) => ({
  link: {
    color: 'inherit',
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

type Props = {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: JSX.Element[] | JSX.Element | string;
};

const RSLink = (props: Props) => {
  const styles = useStyles();

  const { href, className, style, children } = props;

  return href ? (
    <Link to={href} style={style} className={[className, styles.link].join(' ')}>
      {children}
    </Link>
  ) : (
    <a href={undefined} style={style} className={[className, styles.link].join(' ')}>
      {children}
    </a>
  );
};
export default RSLink;
