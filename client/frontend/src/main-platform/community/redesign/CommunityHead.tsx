import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import { RSCard, RSTabsV2 } from '../../reusable-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { ProfilePicture, RSText } from '../../../base-components';
import { CommunityTab } from './Community';
import FollowButton from './FollowButton';
import RelationshipButton from './RelationshipButton';
import Tag from './Tag';

import Theme from '../../../theme/Theme';
import { Community } from '../../../helpers/types';

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
    border: `2px solid ${Theme.foreground}`,
  },
  profilePictureContainer: {
    marginTop: -70,
    alignSelf: 'start',
  },
  center: {
    display: 'flex',
    width: '50%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
  },
  name: {
    alignSelf: 'flex-start',
    textAlign: 'left',
    wordWrap: 'break-word',
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
    textAlign: 'left',
    wordWrap: 'break-word',
    maxWidth: '100%',
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
          size={24}
          color={Theme.secondaryText}
          className={styles.name}
        >
          {name}
          {isPrivate && (
            <FaLock
              color={Theme.secondaryText}
              size={20}
              className={styles.lockIcon}
            />
          )}
        </RSText>
        <Tag className={styles.tag} tag={type} variant="university" weight="light" />
        <RSText size={12} color={Theme.secondaryText} className={styles.bio}>
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
        <RelationshipButton
          communityID={communityID}
          isPrivate={isPrivate}
          relationship={relationship}
        />
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
        <div className={styles.profilePictureContainer}>
          <ProfilePicture
            type="community"
            height={140}
            width={140}
            pictureStyle={styles.profilePicture}
            editable={relationship === 'admin'}
            zoomOnClick
            borderRadius={100}
            borderWidth={0}
            _id={communityID}
            currentPicture={profilePicture}
          />
        </div>
        {renderCenter()}
        {renderRight()}
      </div>
    </RSCard>
  );
};
