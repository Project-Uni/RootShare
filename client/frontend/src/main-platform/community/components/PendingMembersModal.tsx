import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Modal, IconButton, CircularProgress } from '@material-ui/core';
import { MdErrorOutline } from 'react-icons/md';

import { connect } from 'react-redux';

import SinglePendingRequest from './SinglePendingRequest';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import { makeRequest } from '../../../helpers/functions';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 500,
    background: Theme.white,
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
    color: Theme.bright,
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
  communityID: string;
  handleClose: () => any;
  updatePendingCount: (numPending: number) => any;
  updateMemberCount: (value: 1 | -1) => any;
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
      `/api/community/${props.communityID}/pending`
    );

    if (data.success !== 1) {
      setShowServerErr(true);
    } else {
      setPendingMembers(data.content['pendingMembers']);
    }
  }

  async function handleAcceptUser(_id: string) {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/acceptPending`,
      { userID: _id }
    );

    if (data.success === 1) {
      let spliceIndex: number = -1;

      for (let i = 0; i < pendingMembers.length; i++) {
        if (pendingMembers[i]._id === _id) {
          spliceIndex = i;
          break;
        }
      }

      if (spliceIndex > -1) {
        const newPending = pendingMembers.slice();
        newPending.splice(spliceIndex, 1);
        setPendingMembers(newPending);
        props.updatePendingCount(newPending.length);
        props.updateMemberCount(1);
      }
    }
  }

  async function handleRejectUser(_id: string) {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/rejectPending`,
      { userID: _id }
    );

    if (data.success === 1) {
      let spliceIndex: number = -1;
      for (let i = 0; i < pendingMembers.length; i++) {
        if (pendingMembers[i]._id === _id) {
          spliceIndex = i;
          break;
        }
      }

      if (spliceIndex > -1) {
        const newPending = pendingMembers.slice();
        newPending.splice(spliceIndex, 1);
        setPendingMembers(newPending);
        props.updatePendingCount(newPending.length);
      }
    }
  }

  function handleClose() {
    props.updatePendingCount(pendingMembers.length);
    setLoading(true);
    setPendingMembers([]);
    props.handleClose();
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
        <MdErrorOutline color={Theme.error} size={50} />
        <RSText size={14} className={styles.errorText}>
          There was an error retrieving the list of pending members.
        </RSText>
      </div>
    );
  }

  function renderPendingList() {
    const output = [];
    if (pendingMembers.length === 0) {
      output.push(
        <div
          style={{ paddingLeft: 15, paddingRight: 15, paddingBottom: 20, flex: 1 }}
        >
          <RSText size={14}>There no pending requests.</RSText>
        </div>
      );
    }

    for (let i = 0; i < pendingMembers.length; i++) {
      output.push(
        <SinglePendingRequest
          name={`${pendingMembers[i].firstName} ${pendingMembers[i].lastName}`}
          _id={pendingMembers[i]._id}
          profilePicture={pendingMembers[i].profilePicture}
          className={styles.singleMember}
          onAccept={handleAcceptUser}
          onReject={handleRejectUser}
          key={pendingMembers[i]._id}
          type="user"
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
            {!loading && pendingMembers.length} Pending Member
            {pendingMembers.length !== 1 && 's'}
          </RSText>
          <IconButton onClick={handleClose} size="medium">
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
