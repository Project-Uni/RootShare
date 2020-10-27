import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';

import { RSModal } from '../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 400,
  },
}));

type Props = {
  open: boolean;
  onClose: () => any;
};

function CreateCommunityModal(props: Props) {
  const styles = useStyles();

  const helperText =
    'Post to the community, broadcast to the university, and follow and post to other communities';
  return (
    <RSModal
      open={props.open}
      title="Create Community"
      onClose={props.onClose}
      className={styles.wrapper}
      helperText={helperText}
    >
      <div></div>
    </RSModal>
  );
}

export default CreateCommunityModal;
