import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CommunityMemberServiceResponse } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  members: CommunityMemberServiceResponse[];
};

function CommunityMembers(props: Props) {
  const styles = useStyles();

  console.log('Members:', props.members);

  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
}

export default CommunityMembers;
