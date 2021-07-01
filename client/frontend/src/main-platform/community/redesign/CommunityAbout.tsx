import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TextField } from '@material-ui/core';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSAvatar, RSLink } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { putUpdateCommunity } from '../../../api';
import { UserAvatar, BoardMember } from '../../../helpers/types';

const AVATAR_SIZE = 120;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 20,
    maxWidth: '100vw',
  },
  cardWrapper: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom: 30,
    textAlign: 'left',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 18,
  },
  cardTitle: {},
  editButton: { padding: 10 },
  editingButtonsWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyText: {
    color: Theme.secondaryText,
    wordWrap: 'break-word',
  },
  textField: {
    width: '100%',
  },
  peopleWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    overflowX: 'scroll',
  },
  profilePictureContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: 7,
    paddingLeft: 7,
    paddingRight: 7,
  },
  profilePicture: {},
  userName: {
    wordWrap: 'break-word',
    maxWidth: 120,
  },
}));

type Props = {
  communityID: string;
  admin: UserAvatar;
  boardMembers: BoardMember[];
  members: UserAvatar[];
  aboutDesc: string;
  editable?: boolean;
};

export const CommunityAbout = (props: Props) => {
  const styles = useStyles();

  const { communityID, admin, boardMembers, members, aboutDesc, editable } = props;

  // const filteredMembers = members.filter(
  //   (member) =>
  //     member._id !== admin._id &&
  //     (!boardMembers ||
  //       boardMembers.filter((boardMember) => boardMember._id === member._id)
  //         .length === 0)
  // );

  return (
    <div className={styles.wrapper}>
      <AboutCard
        communityID={communityID}
        description={aboutDesc}
        editable={editable}
      />
      <AdminsCard admin={admin} boardMembers={boardMembers} editable={editable} />
      <MembersCard members={members} />
    </div>
  );
};

const AboutCard = (props: {
  communityID: string;
  description: string;
  editable?: boolean;
}) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const { communityID, editable } = props;

  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState<string>(props.description);
  const [editDescription, setEditDescription] = useState<string>(props.description);

  const cancelEditing = () => {
    setEditDescription(description);
    setEditing(false);
  };

  const saveDescription = async () => {
    setDescription(editDescription);
    setEditing(false);
    const data = await putUpdateCommunity(communityID, {
      description: editDescription,
    });
    if (data.success !== 1) {
      dispatch(
        dispatchSnackbar({
          message: 'There was an error saving the description',
          mode: 'error',
        })
      );
      setEditing(true);
    }
  };

  const renderEditButtons = () => {
    if (!editable) return <></>;

    return editing ? (
      <div className={styles.editingButtonsWrapper}>
        <RSLink
          className={styles.editButton}
          underline="hover"
          onClick={cancelEditing}
        >
          <RSText size={11} weight="light" color={Theme.error}>
            Cancel
          </RSText>
        </RSLink>
        <RSLink
          className={styles.editButton}
          underline="hover"
          onClick={saveDescription}
        >
          <RSText size={11} weight="light">
            Save
          </RSText>
        </RSLink>
      </div>
    ) : (
      <RSLink
        className={styles.editButton}
        underline="hover"
        onClick={() => setEditing(true)}
      >
        <RSText size={11} weight="light">
          Edit
        </RSText>
      </RSLink>
    );
  };

  return (
    <RSCard className={styles.cardWrapper}>
      <div className={styles.cardHeader}>
        <RSText className={styles.cardTitle} weight="light" size={18}>
          About
        </RSText>
        {renderEditButtons()}
      </div>
      {editing ? (
        <TextField
          variant="outlined"
          value={editDescription}
          multiline
          label="Edit Community Description"
          className={styles.textField}
          onChange={(e) => setEditDescription(e.target.value)}
        />
      ) : (
        <RSText className={styles.bodyText} multiline>
          {description}
        </RSText>
      )}
    </RSCard>
  );
};

const AdminsCard = (props: {
  admin: Props['admin'];
  boardMembers: Props['boardMembers'];
  editable?: boolean;
}) => {
  const styles = useStyles();
  const { admin, boardMembers, editable } = props;

  return (
    <RSCard className={styles.cardWrapper}>
      <RSText className={styles.cardTitle} weight="light" size={18}>
        Executive Board
      </RSText>
      <div className={styles.peopleWrapper}>
        {boardMembers.map((boardMember) => (
          <div className={styles.profilePictureContainer}>
            <RSLink
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
              href={`/profile/${boardMember._id}`}
              underline="hover"
            >
              <RSAvatar
                className={styles.profilePicture}
                src={boardMember.profilePicture}
                primaryName={boardMember.firstName}
                secondaryName={boardMember.lastName}
                size={AVATAR_SIZE}
                href={`/profile/${boardMember._id}`}
              />
              <RSText className={styles.userName} size={12} weight="light">
                {boardMember.firstName} {boardMember.lastName}
              </RSText>
            </RSLink>
            <RSText
              className={styles.userName}
              style={{ marginTop: 5 }}
              size={10}
              weight="light"
            >
              {boardMember.title}
            </RSText>
          </div>
        ))}
      </div>
    </RSCard>
  );
};

const MembersCard = (props: { members: Props['members'] }) => {
  const styles = useStyles();
  const { members } = props;

  return (
    <RSCard className={styles.cardWrapper}>
      <RSText className={styles.cardTitle} weight="light" size={18}>
        Members
      </RSText>
      <div className={styles.peopleWrapper}>
        {members.map((member) => {
          return (
            <RSLink
              className={styles.profilePictureContainer}
              href={`/profile/${member._id}`}
              underline="hover"
            >
              <RSAvatar
                className={styles.profilePicture}
                src={member.profilePicture}
                primaryName={member.firstName}
                secondaryName={member.lastName}
                size={AVATAR_SIZE}
                href={`/profile/${member._id}`}
              />
              <RSText className={styles.userName} size={12} weight="light">
                {member.firstName} {member.lastName}
              </RSText>
            </RSLink>
          );
        })}
      </div>
    </RSCard>
  );
};
