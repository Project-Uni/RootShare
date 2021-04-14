import React, { useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { RSButtonV2 } from '../../../reusable-components';
import { RSText } from '../../../../base-components';
import { CommunityInviteModal } from '../modals';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: 150,
    height: 28,
    marginTop: 5,
  },
}));

type Props = {
  communityName: string;
  communityID: string;
};

export const InviteButton = (props: Props) => {
  const styles = useStyles();
  const { communityName, communityID } = props;

  const [open, setOpen] = useState(false);

  return (
    <>
      <CommunityInviteModal
        open={open}
        onClose={() => setOpen(false)}
        communityName={communityName}
        communityID={communityID}
      />
      <RSButtonV2
        className={styles.wrapper}
        variant="universitySecondary"
        onClick={() => setOpen(true)}
      >
        <RSText size={11}>Invite</RSText>
      </RSButtonV2>
    </>
  );
};
