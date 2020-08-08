import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ProfilePicture from '../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  profilePicture: {
    marginTop: 20,
  },
}));

type Props = {};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <ProfilePicture
        className={styles.profilePicture}
        editable
        height={150}
        width={150}
        borderRadius={150}
      />
    </div>
  );
}

export default ProfileDrawer;
