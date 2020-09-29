import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  members: any;
};

function CommunityMembers(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
}

export default CommunityMembers;
