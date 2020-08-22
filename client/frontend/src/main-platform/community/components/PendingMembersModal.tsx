import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Modal, IconButton, CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 500,
    background: colors.primaryText,
  },

  top: {
    textAlign: 'left',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    marginLeft: 15,
    marginRight: 15,
  },
  loadingWrapper: {
    height: 400,
  },
  loadingIndicator: {
    marginTop: 80,
    color: colors.primary,
  },
}));

type Props = {
  open: boolean;
  handleClose: () => any;
  communityID: string;
  accessToken: string;
  refreshToken: string;
};

function PendingMembersModal(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (props.open) {
      fetchPendingUsers().then(() => {
        setLoading(false);
      });
    }
  }, [props.open]);

  async function fetchPendingUsers() {
    console.log('Calling fetch function. CommunityID:', props.communityID);
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/pending`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    console.log('Data:', data);
  }

  return (
    <Modal open={props.open}>
      <div
        className={[styles.wrapper, loading ? styles.loadingWrapper : null].join(
          ' '
        )}
        style={{
          position: 'absolute',
          top: `${50}%`,
          left: `${50}%`,
          transform: `translate(-${50}%, -${50}%)`,
        }}
      >
        <div className={styles.top}>
          <RSText type="head" size={15} bold>
            Pending Members
          </RSText>
          <IconButton onClick={props.handleClose} size="medium">
            X
          </IconButton>
        </div>
        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={85} className={styles.loadingIndicator} />
          </div>
        ) : (
          <p>Users</p>
        )}
      </div>
    </Modal>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(PendingMembersModal);
