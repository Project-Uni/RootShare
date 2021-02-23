import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSCard } from '../../reusable-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { ProfilePicture } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { CommunityTab } from './Community';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    paddingBottom: 30,
  },
  profilePicture: {
    border: `7px solid ${Theme.white}`,
  },
  profilePictureContainer: {
    marginTop: -82,
    display: 'inline-block',
  },
}));

type Props = {
  communityID: string;
  style?: React.CSSProperties;
  className?: string;
  profilePicture?: string;
  banner?: string;
  tab: CommunityTab;
  onTabChange: (newTab: CommunityTab) => void;
};

export const CommunityHead = (props: Props) => {
  const styles = useStyles();
  const {
    style,
    className,
    communityID,
    profilePicture,
    banner,
    tab,
    onTabChange,
  } = props;

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} style={style}>
      <ProfileBanner
        height={225}
        editable={false}
        type={'community'}
        borderRadius={40}
        _id={communityID}
        currentPicture={banner}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 50,
          paddingRight: 50,
        }}
      >
        <ProfilePicture
          editable={false}
          type="community"
          height={150}
          width={150}
          pictureStyle={styles.profilePicture}
          className={styles.profilePictureContainer}
          borderRadius={100}
          _id={communityID}
          currentPicture={profilePicture}
        />
        <span>Title desc and tabs</span>
        <span>buttons</span>
      </div>
    </RSCard>
  );
};
