import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

import { RSCard } from '../../../reusable-components';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
}));

type Props = {};

export const PortalMembers = (props: Props) => {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <RSCard>I am the member tab</RSCard>
    </div>
  );
};
