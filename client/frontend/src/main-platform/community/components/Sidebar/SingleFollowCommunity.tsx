import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '../../../../theme/Colors';
import RSText from '../../../../base-components/RSText';
import ProfilePicture from '../../../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 15,
    borderBottom: `1px solid ${colors.fourth}`,
    paddingBottom: 15,
  },
  lastWrapper: {
    marginTop: 15,
    paddingBottom: 20,
  },
  communityInfo: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 7,
  },
  connectButton: {
    color: colors.primaryText,
    background: colors.bright,
    marginLeft: 7,
  },
  joinedText: {
    marginTop: 10,
  },
  communityLink: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
}));

type Props = {
  description: string;
  name: string;
  profilePicture: string;
  type: string;
  _id: string;
  isLast?: boolean;
  members: number;
  accessToken: string;
  refreshToken: string;
};

function SingleFollowCommunity(props: Props) {
  const styles = useStyles();

  return (
    <div className={props.isLast ? styles.lastWrapper : styles.wrapper}>
      <div>
        <div className={styles.communityInfo}>
          <a href={`/community/${props._id}`} className={styles.communityLink}>
            <ProfilePicture
              editable={false}
              type={'profile'}
              height={60}
              width={60}
              borderRadius={60}
              currentPicture={props.profilePicture}
            />
          </a>
          <div className={styles.textContainer}>
            <a href={`/community/${props._id}`} className={styles.noUnderline}>
              <RSText type="body" bold size={13} color={colors.primaryText}>
                {props.name || ''}
              </RSText>
            </a>

            <RSText type="body" italic={true} size={11} color={colors.primaryText}>
              {props.type || ''}
            </RSText>

            <RSText type="body" italic={false} size={11} color={colors.primaryText}>
              {props.members} Members
            </RSText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleFollowCommunity;