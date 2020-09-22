import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { UserType, UniversityType } from '../../../helpers/types';
import { capitalizeFirstLetter } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    background: colors.secondary,
    paddingTop: 5,
    paddingBottom: 5,
  },
  left: {},
  center: {
    marginLeft: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  right: {},
  top: {},
  bottom: {},
  picture: {
    marginLeft: 4,
    marginTop: 2,
  },
  organization: {
    color: colors.secondaryText,
    wordWrap: 'break-word',
    maxWidth: 320,
  },
  name: {
    display: 'inline-block',
    color: colors.primaryText,
    wordWrap: 'break-word',
    maxWidth: 320,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: colors.primaryText,
    },
  },
  ellipsis: {
    margin: 1.5,
    marginBottom: -7,
  },
}));

type Props = {
  connectedUser: UserType;
};

function SingleConnection(props: Props) {
  const styles = useStyles();

  const university = props.connectedUser.university as UniversityType;
  const universityName = university.nickname
    ? university.nickname
    : university.universityName;

  // TODO: Make ellipsis show popup modal to send message to that user

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <a href={`/profile/${props.connectedUser._id}`}>
          <ProfilePicture
            type="profile"
            className={styles.picture}
            editable={false}
            height={35}
            width={35}
            borderRadius={35}
            currentPicture={props.connectedUser.profilePicture}
          />
        </a>
      </div>
      <div className={styles.center}>
        <a href={`/profile/${props.connectedUser._id}`}>
          <RSText bold size={12} className={styles.name}>
            {`${props.connectedUser.firstName} ${props.connectedUser.lastName}`}
          </RSText>
        </a>

        <RSText size={11} italic={true} className={styles.organization}>
          {university.universityName} |{' '}
          {capitalizeFirstLetter(props.connectedUser.accountType)}
        </RSText>
      </div>
      {/* <div className={styles.right}>
        <IconButton className={styles.ellipsis}>
          <FaEllipsisH size={12} color={colors.secondaryText} />
        </IconButton>
      </div> */}
    </div>
  );
}

export default SingleConnection;
