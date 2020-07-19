import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton, Button } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';
import { DhruvHeadshot } from '../../../images/team';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.secondaryText}`,
    paddingBottom: 15,
  },
  profilePic: {
    height: 80,
    borderRadius: 80,
    marginRight: 10,
  },
  top: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  nameHideDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  joinButton: {
    color: colors.primaryText,
    background: colors.bright,
  },
  joinButtonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

type Props = {};

function DiscoveryCommunity(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div className={styles.top}>
        <img src={DhruvHeadshot} className={styles.profilePic} />
        <div>
          <div className={styles.nameHideDiv}>
            <RSText type="body" bold size={13} color={colors.primaryText}>
              RootShare
            </RSText>
            <IconButton onClick={() => {}}>
              <RSText type="subhead" color={colors.primaryText} size={12}>
                X
              </RSText>
            </IconButton>
          </div>
          <RSText type="body" size={11} color={colors.secondaryText}>
            109 Mutual Connections
          </RSText>
          <div className={styles.joinButtonDiv}>
            <Button className={styles.joinButton}>Join</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DiscoveryCommunity;
