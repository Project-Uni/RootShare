import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Card, CardContent, LinearProgress } from '@material-ui/core';

import { FaArrowLeft } from 'react-icons/fa';
import RootShareLogoFull from '../../images/RootShareLogoFull.png';

import { colors } from '../../theme/Colors';
import Theme from '../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  linearProgress: {
    backgroundColor: Theme.bright,
  },
  linearProgressBg: {
    backgroundColor: Theme.background,
  },
  linearProgressRoot: {
    height: 5,
  },
  backArrow: {
    float: 'left',
    marginLeft: '10px',
    verticalAlign: 'center',
    marginTop: '13px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  rootshareLogo: {
    height: '72px',
  },
  header: {
    fontSize: '14pt',
    fontWeight: 'bold',
    fontFamily: 'Ubuntu',
    marginBottom: 0,
  },
}));

type Props = {
  width: number;
  loading: boolean;
  children?: React.ReactNode;
  headerText: string;
  backArrow?: 'link' | 'action';
  backArrowLink?: string;
  backArrowAction?: () => void;
};

function HypeCard(props: Props) {
  const styles = useStyles();

  function renderBackArrow() {
    if (props.backArrow === undefined) return null;
    else if (props.backArrow === 'link')
      return (
        <a href={props.backArrowLink} className={styles.backArrow}>
          <FaArrowLeft color={Theme.primary} size={24} />
        </a>
      );
    else
      return (
        <a
          href={undefined}
          className={styles.backArrow}
          onClick={props.backArrowAction}
        >
          <FaArrowLeft color={Theme.primary} size={24} />
        </a>
      );
  }

  return (
    <Card raised style={{ width: props.width }}>
      <LinearProgress
        classes={{
          root: styles.linearProgressRoot,
          barColorPrimary: styles.linearProgress,
          colorPrimary: styles.linearProgressBg,
        }}
        variant={props.loading ? 'indeterminate' : 'determinate'}
        value={100}
      />
      <CardContent>
        {renderBackArrow()}
        <img
          src={RootShareLogoFull}
          className={styles.rootshareLogo}
          alt="RootShare"
        />
        <p className={styles.header}>{props.headerText}</p>
        {props.children}
      </CardContent>
    </Card>
  );
}

export default HypeCard;
