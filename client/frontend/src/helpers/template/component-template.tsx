import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function Template(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
}

export default Template;
