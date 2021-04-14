import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Modal, IconButton, CircularProgress } from '@material-ui/core';
import { MdErrorOutline } from 'react-icons/md';

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

type PendingCommunity = {
  name: string;
  edgeID: string;
  _id: string;
  type: string;
  profilePicture?: string;
};

type Props = {
  open: boolean;
  communityID: string;
  handleClose: () => any;
  updatePendingCount?: (numPending: number) => any;
};

function PendingFollowRequestsModal(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [showServerErr, setShowServerErr] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingCommunity[]>([]);

  useEffect(() => {
    if (props.open) {
      fetchPendingRequests().then(() => {
        setLoading(false);
      });
    }
  }, [props.open]);

  async function fetchPendingRequests() {
    const { data } = await makeRequest(
      'GET',
      `/api/community/${props.communityID}/follow/pending`
    );

    if (data.success !== 1) {
      setShowServerErr(true);
    } else {
      setPendingRequests(data.content['communities']);
    }
  }

  async function handleAccept(edgeID: string) {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/follow/accept`,
      { edgeID }
    );
    if (data.success === 1) {
      let spliceIndex: number = -1;
      for (let i = 0; i < pendingRequests.length; i++) {
        if (pendingRequests[i].edgeID === edgeID) {
          spliceIndex = i;
          break;
        }
      }
      if (spliceIndex > -1) {
        const newPending = pendingRequests.slice();
        newPending.splice(spliceIndex, 1);
        setPendingRequests(newPending);
        props.updatePendingCount?.(newPending.length);
      }
    }
  }

  async function handleReject(edgeID: string) {
    const { data } = await makeRequest(
      'POST',
      `/api/community/${props.communityID}/follow/reject`,
      { edgeID }
    );
    if (data.success === 1) {
      let spliceIndex: number = -1;
      for (let i = 0; i < pendingRequests.length; i++) {
        if (pendingRequests[i].edgeID === edgeID) {
          spliceIndex = i;
          break;
        }
      }
      if (spliceIndex > -1) {
        const newPending = pendingRequests.slice();
        newPending.splice(spliceIndex, 1);
        setPendingRequests(newPending);
        props.updatePendingCount?.(newPending.length);
      }
    }
  }

  function handleClose() {
    props.updatePendingCount?.(pendingRequests.length);
    setLoading(true);
    setPendingRequests([]);
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
    if (pendingRequests.length === 0) {
      output.push(
        <div
          style={{ paddingLeft: 15, paddingRight: 15, paddingBottom: 20, flex: 1 }}
        >
          <RSText size={14}>There no pending requests.</RSText>
        </div>
      );
    }

    for (let i = 0; i < pendingRequests.length; i++) {
      output.push(
        <SinglePendingRequest
          name={pendingRequests[i].name}
          _id={pendingRequests[i]._id}
          profilePicture={pendingRequests[i].profilePicture}
          className={styles.singleMember}
          onAccept={handleAccept}
          onReject={handleReject}
          key={pendingRequests[i]._id}
          type="community"
          edgeID={pendingRequests[i].edgeID}
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
            {!loading && pendingRequests.length} Pending Follow Request
            {pendingRequests.length !== 1 && 's'}
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

export default PendingFollowRequestsModal;
