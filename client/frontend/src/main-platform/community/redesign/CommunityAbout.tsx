import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { TextField } from '@material-ui/core';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSAvatar, RSLink } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { putUpdateCommunityDescription } from '../../../api/put';

const AVATAR_SIZE = 120;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 20,
  },
  cardWrapper: {
    padding: 50,
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
  },
  textField: {
    width: '100%',
  },
  peopleWrapper: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'flex-start',
    overflow: 'scroll',
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

export type AboutPageUser = {
  firstName: string;
  lastName: string;
  profilePicture?: string;
  _id: string;
};

type Props = {
  communityID: string;
  admin: AboutPageUser; //Populated admin type
  moderators?: AboutPageUser[]; //Populated Moderator type
  members: AboutPageUser[];
  aboutDesc: string;
  editable?: boolean;
};

export const CommunityAbout = (props: Props) => {
  const styles = useStyles();

  const { communityID, admin, moderators, members, aboutDesc, editable } = props;

  const filteredMembers = members.filter(
    (member) =>
      member._id !== admin._id &&
      (!moderators ||
        moderators.filter((moderator) => moderator._id === member._id).length === 0)
  );

  return (
    <div className={styles.wrapper}>
      <AboutCard
        communityID={communityID}
        description={aboutDesc}
        editable={editable}
      />
      <AdminsCard admin={admin} moderators={moderators} editable={editable} />
      <MembersCard members={filteredMembers} />
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
    const data = await putUpdateCommunityDescription(communityID, {
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
          underline="hoverUnderline"
          onClick={cancelEditing}
        >
          <RSText size={11} weight="light" color={Theme.error}>
            Cancel
          </RSText>
        </RSLink>
        <RSLink
          className={styles.editButton}
          underline="hoverUnderline"
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
        underline="hoverUnderline"
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
        <RSText className={styles.cardTitle} weight="light" size={20}>
          About
        </RSText>
        {renderEditButtons()}
      </div>
      {editing ? (
        <TextField
          variant="outlined"
          value={editDescription}
          label="Edit Community Description"
          className={styles.textField}
          onChange={(e) => setEditDescription(e.target.value)}
        />
      ) : (
        <RSText className={styles.bodyText}>{description}</RSText>
      )}
    </RSCard>
  );
};

const AdminsCard = (props: {
  admin: Props['admin'];
  moderators: Props['moderators'];
  editable?: boolean;
}) => {
  const styles = useStyles();
  const { admin, moderators, editable } = props;

  return (
    <RSCard className={styles.cardWrapper}>
      <RSText className={styles.cardTitle} weight="light" size={20}>
        Admin
      </RSText>
      <div className={styles.peopleWrapper}>
        <RSLink
          className={styles.profilePictureContainer}
          href={`/profile/${admin._id}`}
          underline="hoverUnderline"
        >
          <RSAvatar
            className={styles.profilePicture}
            src={admin.profilePicture}
            primaryName={admin.firstName}
            secondaryName={admin.lastName}
            size={AVATAR_SIZE}
            href={`/profile/${admin._id}`}
          />
          <RSText className={styles.userName} size={12} weight="light">
            {admin.firstName} {admin.lastName}
          </RSText>
        </RSLink>
      </div>
    </RSCard>
  );
};

const MembersCard = (props: { members: Props['members'] }) => {
  const styles = useStyles();
  const { members } = props;

  return (
    <RSCard className={styles.cardWrapper}>
      <RSText className={styles.cardTitle} weight="light" size={20}>
        Members
      </RSText>
      <div className={styles.peopleWrapper}>
        {members.map((member) => {
          return (
            <RSLink
              className={styles.profilePictureContainer}
              href={`/profile/${member._id}`}
              underline="hoverUnderline"
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
