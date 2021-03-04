import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { RSCard, RSTabsV2 } from '../../reusable-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { ProfilePicture, RSText } from '../../../base-components';
import { CommunityTab } from './Community';
import FollowButton from './FollowButton';
import RelationshipButton from './RelationshipButton';

import Theme, { addShadow } from '../../../theme/Theme';
import { Community } from '../../../helpers/types';
import { FaLock } from 'react-icons/fa';
import Tag from './Tag';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginBottom: 50,
    paddingBottom: 20,
  },
  horizontalDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  },
  profilePicture: {
    boxShadow: addShadow(0, 0, 12, '#444444', 0.4),
  },
  profilePictureContainer: {
    marginTop: -82,
    padding: 10,
    display: 'inline-block',
  },
  center: {
    display: 'flex',
    width: '55%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  name: {
    alignSelf: 'flex-start',
  },
  lockIcon: {
    marginLeft: 10,
  },
  tag: {
    alignSelf: 'flex-start',
    height: 20,
    minWidth: 80,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    marginBottom: 10,
  },
  bio: {
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    width: '100%',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    marginBottom: -20,
  },
  button: {
    height: 28,
    marginTop: 5,
    width: 150,
  },
}));

type Props = {
  style?: React.CSSProperties;
  className?: string;
  communityInfo: Community;
  currentTab: CommunityTab;
  handleTabChange: (newTab: CommunityTab) => void;
};

export const CommunityHead = (props: Props) => {
  const styles = useStyles();
  const { style, className, communityInfo, currentTab, handleTabChange } = props;

  const {
    _id: communityID,
    name,
    description: bio, // TODO: Change this to fetch bio and allow updates (backfill in DB as well)
    private: isPrivate,
    type,
    members,
    profilePicture,
    bannerPicture,
    relationship,
  } = communityInfo;

  const numMembers = members?.length || 0;

  const renderCenter = () => {
    return (
      <div className={styles.center}>
        <RSText
          type="head"
          weight="light"
          size={30}
          color={Theme.secondaryText}
          className={styles.name}
        >
          {name}
          {isPrivate && (
            <FaLock
              color={Theme.primaryHover}
              size={20}
              className={styles.lockIcon}
            />
          )}
        </RSText>
        <Tag className={styles.tag} tag={type} variant="university" weight="light" />
        <RSText
          size={14}
          type="body"
          color={Theme.secondaryText}
          className={styles.bio}
        >
          {bio}
        </RSText>
        <hr
          style={{
            flex: 1,
            color: Theme.primaryText,
            height: 1,
            width: '100%',
          }}
        />
        <RSTabsV2
          tabs={[
            { label: 'Feed', value: 'feed' },
            { label: 'About', value: 'about' },
          ]}
          onChange={handleTabChange}
          selected={currentTab}
          className={styles.tabs}
        />
      </div>
    );
  };

  const renderRight = () => {
    return (
      <div className={styles.right}>
        <RSText size={11}>{`${numMembers} ${
          numMembers === 1 ? 'Member' : 'Members'
        }`}</RSText>
        <FollowButton
          communityID={communityID}
          name={name}
          variant="universitySecondary"
        />
        <RelationshipButton communityID={communityID} relationship={relationship} />
      </div>
    );
  };

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} style={style}>
      <ProfileBanner
        height={225}
        editable={relationship === 'admin'}
        type={'community'}
        borderRadius={40}
        _id={communityID}
        currentPicture={bannerPicture}
        zoomOnClick
      />
      <div className={styles.horizontalDiv}>
        <ProfilePicture
          type="community"
          height={170}
          width={170}
          pictureStyle={styles.profilePicture}
          editable={relationship === 'admin'}
          zoomOnClick
          className={styles.profilePictureContainer}
          borderRadius={100}
          borderWidth={0}
          _id={communityID}
          currentPicture={profilePicture}
        />
        {renderCenter()}
        {renderRight()}
      </div>
    </RSCard>
  );
};
