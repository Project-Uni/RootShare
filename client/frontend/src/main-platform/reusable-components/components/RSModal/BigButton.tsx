import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';
import { RSButton } from '../../';

const useBigButtonStyles = makeStyles((_: any) => ({
  button: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
  },
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

  return (
    <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
      <RSButton
        variant={variant}
        onClick={onClick}
        disabled={loading}
        className={styles.button}
      >
        {loading ? (
          <CircularProgress size={30} />
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </RSButton>
    </div>
  );
};

BigButton.defaultProps = {
  variant: 'primary',
};

export default BigButton;
