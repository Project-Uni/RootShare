import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Button } from '@material-ui/core';
import { colors } from '../../../../theme/Colors';
import theme from '../../../../theme/Theme';

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
  variant?: 'primary' | 'secondary';
};

export const BigButton = (props: BigButtonProps) => {
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

export default BigButton;
