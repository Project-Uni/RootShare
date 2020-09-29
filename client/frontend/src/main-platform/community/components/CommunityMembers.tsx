import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CommunityMemberServiceResponse } from '../../../helpers/types';
import { UserHighlight } from '../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  members: CommunityMemberServiceResponse[];
};

function CommunityMembers(props: Props) {
  const styles = useStyles();

  function generateMembers() {
    const output = [];
    for (let i = 0; i < props.members.length; i++) {
      const member = props.members[i];
      output.push(
        <p>
          {member.firstName} {member.lastName}
        </p>
      );
    }
    return output;
  }

  return (
    <div className={styles.wrapper}>
      <p>{generateMembers()}</p>
    </div>
  );
}

export default CommunityMembers;
