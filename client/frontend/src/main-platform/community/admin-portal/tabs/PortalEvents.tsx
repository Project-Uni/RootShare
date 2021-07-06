import React, { useState, useEffect } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../../redux/actions';

import { CircularProgress } from '@material-ui/core';

import { RSText } from '../../../../base-components';
import {
  RSCard,
  RSTabsV2,
  RSAvatar,
  RSLink,
  SingleExternalEvent,
} from '../../../reusable-components';
import { CommunityExternalEventCreate } from '../../redesign/modals';

import { CreateEventIcon } from '../../../../images';
import { appendToStateArray } from '../../../../helpers/functions';
import { ExternalEvent } from '../../../../helpers/types';
import { getCommunityAdminEvents } from '../../../../api';

const NON_SCROLL_HEIGHT = 394;

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    maxWidth: 1000,
    paddingTop: 30,
  },
}));

export const EVENT_TABS = [
  {
    label: 'Approved',
    value: 'approved',
  },
  {
    label: 'Pending',
    value: 'pending',
  },
  {
    label: 'Denied',
    value: 'denied',
  },
];

type EventTab = 'approved' | 'pending' | 'denied';

export type CommunityAdminPortalTab = 'approved' | 'pending' | 'denied';

type Props = {
  communityID: string;
};

export const PortalEvents = (props: Props) => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const { communityID } = props;

  const [currentTab, setCurrentTab] = useState<EventTab>('approved');
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<ExternalEvent[]>([]);
  const [deniedEvents, setDeniedEvents] = useState<ExternalEvent[]>([]);

  const [loading, setLoading] = useState(false);
  const [scrollHeight, setScrollHeight] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getCommunityAdminEvents(communityID);
    setLoading(false);

    if (data.successful) setEvents(data.content.events);
    else
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error fetching events',
        })
      );
  };

  const handleResize = () => {
    setScrollHeight(window.innerHeight - NON_SCROLL_HEIGHT);
  };

  const updateEvents = (event: ExternalEvent) => {
    appendToStateArray(event, setEvents);
  };

  function renderEvents() {
    if (currentTab === 'approved')
      return events.map((event) => (
        <SingleExternalEvent key={event._id} event={event} />
      ));
    if (currentTab === 'pending')
      return pendingEvents.map((event) => (
        <SingleExternalEvent key={event._id} event={event} />
      ));
    if (currentTab === 'denied')
      return deniedEvents.map((event) => (
        <SingleExternalEvent key={event._id} event={event} />
      ));
  }

  return (
    <div className={styles.wrapper}>
      <CommunityExternalEventCreate
        open={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        communityID={communityID}
        onSuccess={updateEvents}
      />
      <RSCard variant="secondary">
        <RSTabsV2
          tabs={EVENT_TABS}
          selected={currentTab}
          onChange={setCurrentTab}
          style={{
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: 40,
            paddingRight: 40,
          }}
          theme="rootshare"
          size={15}
          variant="underlinedTabs"
        />
      </RSCard>
      <RSLink onClick={() => setShowCreateEventModal(true)}>
        <RSCard style={{ height: 170 }} variant="secondary">
          <div
            style={{
              display: 'flex',
              flex: 1,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RSAvatar src={CreateEventIcon} variant="square" size={50} />
            <RSText weight="light" size={19} style={{ paddingLeft: 20 }}>
              Create Event +
            </RSText>
          </div>
        </RSCard>
      </RSLink>
      <div
        style={{
          width: '100%',
          overflowY: 'scroll',
          maxHeight: scrollHeight,
          marginBottom: 10,
        }}
      >
        {loading ? <CircularProgress size={100} /> : renderEvents()}
      </div>
    </div>
  );
};
