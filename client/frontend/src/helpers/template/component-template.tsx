import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
}));

type Props = {};

export const Template = (props: Props) => {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
};
