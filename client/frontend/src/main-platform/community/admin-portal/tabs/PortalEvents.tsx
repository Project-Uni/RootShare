import React, { useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

import { RSText } from '../../../../base-components';
import {
  RSCard,
  RSTabsV2,
  RSAvatar,
  RSLink,
  RSButtonV2,
} from '../../../reusable-components';

import { CreateEventIcon } from '../../../../images';
import { EventType, LeanEventType } from '../../../../helpers/types';
import {
  formatDatePretty,
  formatTime,
  localDateTimeFromUTC,
} from '../../../../helpers/functions';
import Theme from '../../../../theme/Theme';

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

export type CommunityAdminPortalTab = 'approved' | 'pending' | 'denied';

type Props = {};

export const PortalEvents = (props: Props) => {
  const styles = useStyles();

  const [currentTab, setCurrentTab] = useState(EVENT_TABS[0].value);
  const [events, setEvents] = useState<LeanEventType[]>([
    {
      _id: '12345',
      title: 'Test Event',
      dateTime: new Date('2021-04-29T00:00:00.000Z'),
      RSVPs: [],
      brief_description: 'This is my brief: Come check out this cool event!',
      full_description:
        'This is my full: This event is going to be so cool! Make sure to come and check it out!',
      muxAssetPlaybackID: '123456',
      eventBanner: CreateEventIcon,
    },
  ]);

  return (
    <div className={styles.wrapper}>
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
      <RSLink onClick={() => alert('TODO: implement this')}>
        <RSCard style={{ height: 250 }} variant="secondary">
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
      {events.map((event) => (
        <SingleEvent key={event._id} event={event} />
      ))}
    </div>
  );
};

type SingleEventProps = {
  event: LeanEventType;
};

const SingleEvent = (props: SingleEventProps) => {
  const styles = useStyles();

  const {
    _id: eventID,
    title,
    dateTime: dateTimeUTC,
    RSVPs,
    brief_description,
    full_description,
    muxAssetPlaybackID,
    eventBanner,
  } = props.event;
  const dateTime = localDateTimeFromUTC(dateTimeUTC);

  return (
    <RSCard variant="secondary">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <img
          src={eventBanner}
          style={{
            margin: 25,
            width: 300,
            height: 200,
            borderStyle: 'solid',
            borderRadius: 20,
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: 20,
            paddingRight: 60,
            textAlign: 'left',
          }}
        >
          <RSText weight="bold" size={17} style={{ paddingBottom: 10 }}>
            {title}
          </RSText>
          <div style={{ display: 'flex', paddingBottom: 10 }}>
            <RSText weight="light" size={13} style={{ paddingRight: 20 }}>
              {formatDatePretty(dateTime)}
            </RSText>
            <RSText weight="light" size={13}>
              {formatTime(dateTime)}
            </RSText>
          </div>
          <RSText weight="light" style={{ paddingBottom: 10 }}>
            {brief_description}
          </RSText>
          <RSText weight="light" style={{ paddingBottom: 25 }}>
            {full_description}
          </RSText>
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
              paddingBottom: 10,
            }}
          >
            <RSButtonV2 style={{ height: 30, marginRight: 20 }}>
              <RSText size={10} color={Theme.altText}>
                Download Attendees
              </RSText>
            </RSButtonV2>
            <RSButtonV2 style={{ height: 30 }}>
              <RSText size={10} color={Theme.altText}>
                Edit Event
              </RSText>
            </RSButtonV2>
          </div>
        </div>
      </div>
    </RSCard>
  );
};
