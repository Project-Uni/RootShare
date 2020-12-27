import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSModal } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';
import Theme from '../../../../../theme/Theme';

import { FiMessageSquare } from 'react-icons/fi';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
}));

type Props = {
  open: boolean;
  communityName: string;
  communityID: string;
  onClose: () => any;
};

function MTGMessageModal(props: Props) {
  const styles = useStyles();

  const { open, communityName, communityID, onClose } = props;
  return (
    <>
      <RSModal
        open={open}
        title={`Messaging - ${communityName}`}
        onClose={onClose}
        className={styles.modal}
        helperText={
          'Send a message to everyone who is interested in your fraternity'
        }
        helperIcon={<FiMessageSquare size={90} />}
      ></RSModal>
    </>
  );
}

export default MTGMessageModal;
