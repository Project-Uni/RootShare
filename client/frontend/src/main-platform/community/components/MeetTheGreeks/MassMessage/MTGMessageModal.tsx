import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSModal } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';
import theme from '../../../../../theme/Theme';

import { FiMessageSquare } from 'react-icons/fi';
import { Button, CircularProgress } from '@material-ui/core';
import { colors } from '../../../../../theme/Colors';

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

const useBigButtonStyles = makeStyles((_: any) => ({
  primaryButton: {
    background: theme.bright,
    color: theme.altText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  disabledButton: { background: theme.disabledButton },
  middleButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
  },
}));

type BigButtonProps = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant: 'primary' | 'secondary';
};

const BigButton = (props: BigButtonProps) => {
  const styles = useBigButtonStyles();

  const { loading, onClick, label, variant } = props;

  return (
    <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
      <Button
        className={[
          styles.middleButton,
          loading ? styles.disabledButton : styles.primaryButton,
        ].join(' ')}
        disabled={loading}
        onClick={onClick}
      >
        {loading ? <CircularProgress size={30} /> : label}
      </Button>
    </div>
  );
};
