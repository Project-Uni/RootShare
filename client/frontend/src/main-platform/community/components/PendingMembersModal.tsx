import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Modal, IconButton, CircularProgress } from '@material-ui/core';
import { MdErrorOutline } from 'react-icons/md';

import { connect } from 'react-redux';

import SinglePendingMember from './SinglePendingMember';

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
  errorText: {
    marginLeft: 20,
  },
  singleMember: { marginBottom: 15 },
}));

type PendingUser = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
};

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
  const [showServerErr, setShowServerErr] = useState(false);
  const [pendingMembers, setPendingMembers] = useState<PendingUser[]>([]);

  useEffect(() => {
    if (props.open) {
      fetchPendingUsers().then(() => {
        setLoading(false);
      });
    }
  }, [props.open]);

  async function fetchPendingUsers() {
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/pending`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );

    if (data.success !== 1) {
      setShowServerErr(true);
    } else {
      setPendingMembers(data.content['pendingMembers']);
    }
  }

  function handleAcceptUser(_id: string) {
    console.log('Accepting user', _id);
  }

  function handleRejectUser(_id: string) {
    console.log('Reject user:', _id);
  }

  function renderServerErr() {
    return (
      <div
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 20,
          display: 'flex',
        }}
      >
        <MdErrorOutline color={colors.brightError} size={50} />
        <RSText size={14} className={styles.errorText}>
          There was an error retrieving the list of pending members.
        </RSText>
      </div>
    );
  }

  function renderPendingList() {
    const output = [];

    // for (let i = 0; i < pendingMembers.length; i++) {
    //   output.push(
    //     <SinglePendingMember
    //       firstName={pendingMembers[i].firstName}
    //       lastName={pendingMembers[i].lastName}
    //       _id={pendingMembers[i]._id}
    //       profilePicture={pendingMembers[i].profilePicture}
    //       className={styles.singleMember}
    //       onAccept = { handleAcceptUser };
    //       onReject = { handleRejectUser };
    //     />
    //   );
    // }
    for (let i = 0; i < 10; i++) {
      output.push(
        <SinglePendingMember
          firstName={pendingMembers[0].firstName}
          lastName={pendingMembers[0].lastName}
          _id={pendingMembers[0]._id}
          profilePicture={pendingMembers[0].profilePicture}
          className={styles.singleMember}
          onAccept={handleAcceptUser}
          onReject={handleRejectUser}
        />
      );
    }

    return <div style={{ maxHeight: 500, overflow: 'scroll' }}>{output}</div>;
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
        ) : showServerErr ? (
          renderServerErr()
        ) : (
          renderPendingList()
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
