import React, { useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Button } from '@material-ui/core';
import theme from '../../../../theme/Theme';

const useBigButtonStyles = makeStyles((_: any) => ({
  button: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
    color: theme.altText,
    '&:hover': {
      background: theme.buttonHighlight,
    },
  },
  primaryButton: {
    background: theme.bright,
  },
  secondaryButton: {
    background: theme.primary,
  },
  disabledButton: { background: theme.disabledButton },
}));

type BigButtonProps = {
  icon?: JSX.Element;
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export const BigButton = (props: BigButtonProps) => {
  const styles = useBigButtonStyles();

  const { loading, onClick, label, icon, variant } = props;

  const coreStyle = useRef(
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton
  );

  return (
    <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
      <Button
        className={[
          styles.button,
          loading ? styles.disabledButton : coreStyle.current,
        ].join(' ')}
        disabled={loading}
        onClick={onClick}
      >
        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </Button>
    </div>
  );
};

BigButton.defaultProps = {
  variant: 'primary',
};

export default BigButton;
