import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSLink, RSButtonV2, RSAvatar } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { putUpdateUserConnection } from '../../../api';
import { COMPONENT_WIDTH } from '../RightSidebar';
import { capitalizeFirstLetter } from '../../../helpers/functions';

const MAX_USERS = 4;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: COMPONENT_WIDTH - 20,
    padding: 10,
  },
  cardTitle: {
    paddingBottom: 15,
  },
  singleWrapper: {
    display: 'flex',
    width: COMPONENT_WIDTH - 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  left: {},
  center: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },
  accountType: {
    color: Theme.secondaryText,
    textAlign: 'left',
    wordWrap: 'break-word',
    maxWidth: 140,
  },
  name: {
    display: 'inline-block',
    color: Theme.primaryText,
    textAlign: 'left',
    wordWrap: 'break-word',
    maxWidth: 140,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: Theme.primaryText,
    },
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
  },
  button: {
    height: 20,
    marginTop: 7,
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
}));

export type DiscoverUser = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  accountType: string;
  graduationYear: string;
  numMutualConnections: number;
};

type Props = {
  // children?: JSX.Element | JSX.Element[] | string | number;
  users: DiscoverUser[];
  className?: string;
};

export const DiscoverUsers = (props: Props) => {
  const styles = useStyles();
  const { className } = props;

  const [users, setUsers] = useState(props.users);

  useEffect(() => {
    setUsers(props.users);
  }, [props.users]);

  const removeUser = (userID: string) => {
    let newUsers = users.slice();
    for (let i = 0; i < users.length; i++) {
      const currUser = users[i];
      if (currUser._id === userID) {
        newUsers.splice(i, 1);
        setUsers(newUsers);
        return;
      }
    }
  };

  const renderUsers = () => {
    const output: any = [];
    const limit = Math.min(MAX_USERS, users.length);

    for (let i = 0; i < limit; i++) {
      const currUser = users[i];
      output.push(
        <SingleDiscoverUser
          key={currUser._id}
          user={currUser}
          removeUser={removeUser}
        />
      );
    }
    return output;
  };

  if (users.length === 0) return <></>;

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} background="secondary">
      <RSText className={styles.cardTitle} size={16} bold>
        People For You
      </RSText>
      {renderUsers()}
    </RSCard>
  );
};

type SingleProps = {
  user: DiscoverUser;
  removeUser: (userID: string) => void;
};

const SingleDiscoverUser = (props: SingleProps) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const { user, removeUser } = props;

  const [visible, setVisible] = useState(true);

  async function requestConnection() {
    removeSuggestion();

    const data = await putUpdateUserConnection('connect', user._id);

    if (data.success === 1)
      dispatch(
        dispatchSnackbar({
          message: `Connection request sent to ${user.firstName} ${user.lastName}`,
          mode: 'success',
        })
      );
    else
      dispatch(
        dispatchSnackbar({
          message: `There was an error sending a request to ${user.firstName} ${user.lastName}`,
          mode: 'error',
        })
      );
  }

  function removeSuggestion() {
    setVisible(false);
    setTimeout(() => {
      removeUser(user._id);
    }, 500);
  }

  return (
    <div
      id="suggestionWrapper"
      className={[styles.singleWrapper, visible || styles.fadeOut].join(' ')}
    >
      <div className={styles.left}>
        <RSAvatar
          href={`/profile/${user._id}`}
          src={user.profilePicture}
          primaryName={user.firstName}
          secondaryName={user.lastName}
        />
      </div>
      <div className={styles.center}>
        <RSLink href={`/profile/${user._id}`}>
          <RSText size={13} className={styles.name}>
            {`${user.firstName} ${user.lastName}`}
          </RSText>
        </RSLink>

        <RSText size={11} italic className={styles.accountType}>
          {capitalizeFirstLetter(user.accountType)}
          {/* {capitalizeFirstLetter(user.accountType)} | {user.graduationYear} */}
        </RSText>

        {/* TODO: add mutuals to suggestions with the following format:
            27 {people icon} | 4 {community icon}
        */}
      </div>

      <div className={styles.right}>
        <RSButtonV2
          className={styles.button}
          onClick={requestConnection}
          variant="university"
        >
          <RSText size={10}>Connect</RSText>
        </RSButtonV2>
        <RSButtonV2
          className={styles.button}
          onClick={removeSuggestion}
          variant="universitySecondary"
        >
          <RSText size={10} weight="light">
            Remove
          </RSText>
        </RSButtonV2>
      </div>
    </div>
  );
};
