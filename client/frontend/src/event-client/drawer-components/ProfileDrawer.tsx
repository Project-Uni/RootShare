import React, { useState, useEffect } from 'react';
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
  const [currentPicture, setCurrentPicture] = useState<string>();

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }
  return (
    <div className={styles.wrapper}>
      <ProfilePicture
        className={styles.profilePicture}
        editable
        height={150}
        width={150}
        borderRadius={150}
        currentPicture={currentPicture}
        updateCurrentPicture={updateCurrentPicture}
      />
    </div>
  );
}

export default ProfileDrawer;
