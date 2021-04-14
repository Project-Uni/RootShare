import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { dispatchSnackbar } from '../../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSButtonV2 } from '../../../reusable-components';
import Tag from '../Tag';

import { UserToCommunityRelationship, U2CR } from '../../../../helpers/types';
import { putCommunityMembership } from '../../../../api';
import { RSText } from '../../../../base-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  baseButton: { height: 28, marginTop: 5, width: 150 },
  joinButton: {},
}));

type Props = {
  communityID: string;
  relationship: UserToCommunityRelationship;
  isPrivate: boolean;
};

const RelationshipButton = (props: Props) => {
  const styles = useStyles();

  const { communityID, isPrivate } = props;

  const [hovering, setHovering] = useState(false);
  const [relationship, setRelationship] = useState<UserToCommunityRelationship>(
    props.relationship
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setRelationship(props.relationship);
  }, [props.relationship]);

  const handleJoin = async () => {
    setRelationship(U2CR.JOINED);

    const data = await putCommunityMembership('join', communityID);
    if (data.success === 1) return;

    setRelationship(U2CR.OPEN);
    dispatch(
      dispatchSnackbar({
        message: 'There was an error joining this community',
        mode: 'error',
      })
    );
  };

  const handleRequestJoin = async () => {
    setRelationship(U2CR.PENDING);

    const data = await putCommunityMembership('join', communityID);
    if (data.success === 1) return;

    setRelationship(U2CR.OPEN);
    dispatch(
      dispatchSnackbar({
        message: 'There was an error requesting to join this community',
        mode: 'error',
      })
    );
  };

  const handleCancelPendingRequest = async () => {
    setRelationship(U2CR.OPEN);

    const data = await putCommunityMembership('cancel', communityID);
    if (data.success === 1) return;

    setRelationship(U2CR.PENDING);
    dispatch(
      dispatchSnackbar({
        message: 'There was an error canceling your join request',
        mode: 'error',
      })
    );
  };

  const handleLeave = async () => {
    setRelationship(U2CR.OPEN);

    const data = await putCommunityMembership('leave', communityID);
    if (data.success === 1) return;

    setRelationship(U2CR.JOINED);
    dispatch(
      dispatchSnackbar({
        message: 'There was an error leaving this community',
        mode: 'error',
      })
    );
  };

  if (relationship === U2CR.OPEN)
    return (
      <RSButtonV2
        className={[styles.baseButton].join(' ')}
        onClick={isPrivate ? handleRequestJoin : handleJoin}
        variant="university"
      >
        <RSText size={11}>Join</RSText>
      </RSButtonV2>
    );

  if (relationship === U2CR.PENDING)
    return (
      <RSButtonV2
        className={styles.baseButton}
        onClick={handleCancelPendingRequest}
        onHover={setHovering}
        variant="university"
      >
        <RSText size={11}>{hovering ? 'Cancel' : 'Pending'}</RSText>
      </RSButtonV2>
    );

  if (relationship === 'joined')
    return (
      <RSButtonV2
        className={styles.baseButton}
        onClick={handleLeave}
        onHover={setHovering}
        variant="university"
      >
        <RSText size={11}>{hovering ? 'Leave Community' : 'Member'}</RSText>
      </RSButtonV2>
    );

  return <Tag tag="Admin" variant="university" fontSize={11} />;
};

export default RelationshipButton;
