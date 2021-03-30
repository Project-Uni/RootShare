import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import { RSCard, RSTabsV2, RSButtonV2 } from '../../reusable-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { ProfilePicture, RSText } from '../../../base-components';
import { CommunityTab } from './Community';
import EditCommunityModal from './EditCommunityModal';
import FollowButton from './FollowButton';
import RelationshipButton from './RelationshipButton';
import { UserToCommunityRelationship, U2CR, CommunityType } from '../../../helpers/types';
import Tag from './Tag';
import Theme from '../../../theme/Theme';
import { Community } from '../../../helpers/types';
import CommunityGeneralInfo from '../components/CommunityGeneralInfo';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
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
    marginBottom: 10,
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

  const [stateName, setStateName] = useState(name);
  const [stateBio, setStateBio] = useState(bio);
  const [stateType, setStateType] = useState(type);
  const [stateBanner, setStateBanner] = useState<string | undefined>(bannerPicture);
  const [stateProfile, setStateProfile] = useState<string | undefined>(profilePicture);

  function updateName(name: string){
    setStateName(name);
  }

  function updateBio(bio: string){
    setStateBio(bio);
  }

  function updateType(type: CommunityType){
    setStateType(type);
  }

  function updateBanner(banner: string | undefined){
    setStateBanner(banner);
  }

  function updateProfile(profile: string | undefined){
    setStateProfile(profile);
  }

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
          {stateName}
          {isPrivate && (
            <FaLock
              color={Theme.secondaryText}
              size={18}
              className={styles.lockIcon}
            />
          )}
        </RSText>
        <Tag className={styles.tag} tag={stateType} variant="university" weight="light" />
        <RSText size={12} color={Theme.secondaryText} className={styles.bio}>
          {stateBio}
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
        {relationship == U2CR.ADMIN ?
          <RSButtonV2
            variant="universitySecondary"
            className={styles.button}
            onClick={() => setShowEditCommunityModal(true)}
          >
              <RSText size={11}>Edit Community</RSText>
            </RSButtonV2> : ""}
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

  const [showEditCommunityModal, setShowEditCommunityModal] = useState(
    false
  );

  return (
    <div>
      {relationship == U2CR.ADMIN ?
      <EditCommunityModal
        communityID={communityID}
        name={name}
        bio={bio}
        type={type}
        open={showEditCommunityModal}
        onClose={() => setShowEditCommunityModal(false)}
        updateName={updateName}
        updateBio={updateBio}
        updateType={updateType}
        updateBanner={updateBanner}
        updateProfile={updateProfile}
        editable={relationship === 'admin'}
        banner={bannerPicture}
        profilePicture={profilePicture}
        /> : ""}
      <RSCard className={[styles.wrapper, className].join(' ')} style={style}>
        <ProfileBanner
          height={225}
          type={'community'}
          borderRadius={40}
          _id={communityID}
          currentPicture={stateBanner}
          zoomOnClick
        />
        <div className={styles.horizontalDiv}>
          <div className={styles.profilePictureContainer}>
            <ProfilePicture
              type="community"
              height={140}
              width={140}
              pictureStyle={styles.profilePicture}
              zoomOnClick
              borderRadius={100}
              borderWidth={0}
              _id={communityID}
              currentPicture={stateProfile}
            />
          </div>
          {renderCenter()}
          {renderRight()}
        </div>
      </RSCard>
    </div>
  );
};
