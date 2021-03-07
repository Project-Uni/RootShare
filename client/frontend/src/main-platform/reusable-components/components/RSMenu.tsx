import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popper, Grow, Paper, ClickAwayListener, MenuList } from '@material-ui/core';

import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    margin: 5,
    outline: 'none',
  },
  primary: {
    backgroundColor: Theme.foreground,
    boxShadow: Theme.fullShadow,
  },
  transparent: {
    backgroundColor: Theme.transparent,
    boxShadow: Theme.noShadow,
  },
  rounded: {
    backgroundColor: Theme.foreground,
    borderRadius: 15,
    boxShadow: Theme.fullShadow,
  },
  test: {
    backgroundColor: Theme.error,
  },
}));

type Props = {
  children?: JSX.Element | JSX.Element[] | string | number;
  open: boolean;
  anchorEl: any;
  variant: 'primary' | 'transparent' | 'rounded';
  onClose: () => void;
};

const RSMenu = (props: Props) => {
  const styles = useStyles();
  const { children, open, anchorEl, variant, onClose } = props;

  function handleListKeyDown(event: { key: string; preventDefault: () => void }) {
    if (event.key === 'Tab') {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <Popper open={open} anchorEl={anchorEl} role={undefined} transition>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
          }}
        >
          <Paper className={styles.transparent}>
            <ClickAwayListener onClickAway={onClose}>
              <MenuList
                className={[styles.wrapper, styles[variant]].join(' ')}
                autoFocusItem={open}
                onKeyDown={handleListKeyDown}
              >
                {children}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};

RSMenu.defaultProps = {
  variant: 'primary',
};

export default RSMenu;
