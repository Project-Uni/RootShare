import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { updateSidebarComponents } from '../../redux/actions';

import { CircularProgress } from '@material-ui/core';

import { SingleExternalEvent, RSLink } from '../reusable-components';
import { RSText } from '../../base-components';

import { getExternalEventInfo, GetExternalEventInfoCommunity } from '../../api';
import { ExternalEventDefault } from '../../helpers/types';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

type EventInfoError = 'unknown' | 'access';

type Props = {};

export const EventInfoPage = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();

  const dispatch = useDispatch();

  const { eventID } = useParams<{ eventID: string }>();

  const { _id: userID } = useSelector((state: RootshareReduxState) => state.user);

  const [event, setEvent] = useState<ExternalEventDefault>();
  const [community, setCommunity] = useState<GetExternalEventInfoCommunity>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EventInfoError>();

  const fetchEvent = useCallback(async () => {
    if (!loading) setLoading(true);
    if (error) setError(undefined);

    const data = await getExternalEventInfo(eventID, userID || undefined);

    if (data.successful) {
      setEvent(data.content.event);
      setIsAdmin(data.content.isAdmin);
    } else if (data.status === 403) {
      setError('access');
      setCommunity(data.content.community);
    } else {
      setError('unknown');
    }

    setLoading(false);
  }, [eventID, userID]);

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverUsers', 'discoverCommunities'],
      })
    );
  }, []);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return (
    <div className={styles.wrapper}>
      {error ? (
        <EventInfoError error={error} community={community} />
      ) : loading || !event ? (
        <CircularProgress style={{ marginTop: 50 }} size={80} />
      ) : (
        <SingleExternalEvent
          event={event}
          showCommunity
          onDelete={isAdmin ? (_) => history.push('/home') : undefined}
        />
      )}
    </div>
  );
};

type EventInfoErrorProps = {
  error: EventInfoError;
  community?: GetExternalEventInfoCommunity;
};

export const EventInfoError = (props: EventInfoErrorProps) => {
  const { error, community } = props;

  if (error === 'unknown')
    return (
      <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
        There was an error getting the event information
      </RSText>
    );

  if (error === 'access')
    return (
      <RSText bold size={14} style={{ marginTop: 20, maxWidth: 400 }}>
        Can't access because this is a private event
        {community && ` for `}
        {community && (
          <RSLink href={`/community/${community._id}`} underline="hover">
            <RSText bold size={14}>
              {community.name}
            </RSText>
          </RSLink>
        )}
      </RSText>
    );

  return <></>;
};
