import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { RSCard } from '../../reusable-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { ProfilePicture, RSText } from '../../../base-components';
import { CommunityTab } from './Community';

import Theme, { addShadow } from '../../../theme/Theme';
import { Community } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginBottom: 50,
    paddingBottom: 30,
    height: 400,
  },
  horizontalDiv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 50,
    paddingRight: 50,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profilePicture: {
    border: `0px solid ${Theme.white}`,
    boxShadow: addShadow(0, 0, 12, '#444444', 0.4),
  },
  profilePictureContainer: {
    marginTop: -82,
    display: 'inline-block',
  },
}));

type Props = {
  style?: React.CSSProperties;
  className?: string;
  communityInfo: Community;
};

export const CommunityHead = (props: Props) => {
  const styles = useStyles();
  const { style, className, communityInfo } = props;

  const {
    _id: communityID,
    name,
    description,
    private: isPrivate,
    type,
    numMembers,
    numMutual,
    profilePicture,
    bannerPicture,
    status,
  } = communityInfo;

  const renderCenter = () => {
    return (
      <div className={styles.center}>
        <RSText>{}</RSText>
      </div>
    );
  };

  const renderRight = () => {
    return <div className={styles.right}>buttons</div>;
  };

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} style={style}>
      {/* <ProfileBanner
        height={225}
        editable={false}
        type={'community'}
        borderRadius={40}
        _id={communityInfo._id}
        currentPicture={communityInfo.bannerPicture}
      />
      <div className={styles.horizontalDiv}>
        <ProfilePicture
          editable={false}
          type="community"
          height={170}
          width={170}
          pictureStyle={styles.profilePicture}
          className={styles.profilePictureContainer}
          borderRadius={100}
          borderWidth={0}
          _id={communityInfo._id}
          currentPicture={communityInfo.profilePicture}
        />
        {renderCenter()}
        {renderRight()}
      </div> */}
    </RSCard>
  );
};
