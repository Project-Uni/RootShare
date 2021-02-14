import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

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
  children: JSX.Element[] | JSX.Element;
};

const RSLink = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();

  const { href, className, style, children } = props;

  return (
    <a
      href={undefined}
      style={style}
      className={[className, styles.link].join(' ')}
      onClick={() => history.push(href)}
    >
      {children}
    </a>
  );
};
export default RSLink;
