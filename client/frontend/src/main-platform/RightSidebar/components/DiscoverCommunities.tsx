import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import PeopleIcon from '@material-ui/icons/People';
import { FaLock } from 'react-icons/fa';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSLink, RSButtonV2, RSAvatar } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { putCommunityMembership } from '../../../api';
import { COMPONENT_WIDTH } from '../RightSidebar';

const MAX_USERS = 4;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: COMPONENT_WIDTH - 20,
    padding: 10,
    marginBottom: 20,
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
  lockIcon: {
    marginLeft: 4,
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

export type DiscoverCommunity = {
  _id: string;
  name: string;
  lastName: string;
  profilePicture?: string;
  private: boolean;
  numMembers: number;
  numMutual: number;
  numMutualConnections: number;
};

type Props = {
  // children?: JSX.Element | JSX.Element[] | string | number;
  communities: DiscoverCommunity[];
  className?: string;
};

export const DiscoverCommunities = (props: Props) => {
  const styles = useStyles();
  const { className } = props;

  const [communities, setCommunities] = useState(props.communities);

  useEffect(() => {
    setCommunities(props.communities);
  }, [props.communities]);

  const removeCommunity = (userID: string) => {
    let newCommunities = communities.slice();
    for (let i = 0; i < communities.length; i++) {
      const currCommunity = communities[i];
      if (currCommunity._id === userID) {
        newCommunities.splice(i, 1);
        setCommunities(newCommunities);
        return;
      }
    }
  };

  const renderCommunities = () => {
    const output: any = [];
    const limit = Math.min(MAX_USERS, communities.length);

    for (let i = 0; i < limit; i++) {
      const currCommunity = communities[i];
      output.push(
        <SingleDiscoverCommunity
          key={currCommunity._id}
          community={currCommunity}
          removeCommunity={removeCommunity}
        />
      );
    }
    return output;
  };

  if (communities.length === 0) return <></>;

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} background="secondary">
      <RSText className={styles.cardTitle} size={16} bold>
        Communities For You
      </RSText>
      {renderCommunities()}
    </RSCard>
  );
};

type SingleProps = {
  community: DiscoverCommunity;
  removeCommunity: (communityID: string) => void;
};

const SingleDiscoverCommunity = (props: SingleProps) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const { community, removeCommunity } = props;

  const [visible, setVisible] = useState(true);

  const requestJoin = async (isPrivate: boolean) => {
    removeSuggestion();
    const data = await putCommunityMembership('join', community._id);

    const successMessage = isPrivate ? 'Requested to join' : 'Joined';
    if (data.success === 1)
      dispatch(
        dispatchSnackbar({
          message: `${successMessage} ${community.name}`,
          mode: 'success',
        })
      );
    else
      dispatch(
        dispatchSnackbar({
          message: `There was an error trying to join ${community.name}`,
          mode: 'error',
        })
      );
  };

  const removeSuggestion = () => {
    setVisible(false);
    setTimeout(() => {
      removeCommunity(community._id);
    }, 500);
  };

  return (
    <div className={[styles.singleWrapper, visible || styles.fadeOut].join(' ')}>
      <div className={styles.left}>
        <RSAvatar
          href={`/community/${community._id}`}
          src={community.profilePicture}
          primaryName={community.name}
        >
          <PeopleIcon fontSize="large" />
        </RSAvatar>
      </div>
      <div className={styles.center}>
        <RSLink href={`/community/${community._id}`}>
          <RSText size={13} className={styles.name}>
            {community.name}
            {community.private && (
              <FaLock
                color={Theme.secondaryText}
                size={12}
                className={styles.lockIcon}
              />
            )}
          </RSText>
        </RSLink>

        <RSText size={11} italic className={styles.accountType}>
          {`${community.numMembers} ${
            community.numMembers === 1 ? 'Member' : 'Members'
          }`}
          {/* {`${community.numMembers} Members | ${community.numMutual} Mutual`} */}
        </RSText>
      </div>

      <div className={styles.right}>
        <RSButtonV2
          className={styles.button}
          onClick={() => requestJoin(community.private)}
          variant="university"
        >
          <RSText size={10}>Join</RSText>
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
