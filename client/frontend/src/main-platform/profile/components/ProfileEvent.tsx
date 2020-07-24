import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';

import { BsChevronDown } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.secondary,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
  },
  eventTitle: {
    marginLeft: 10,
  },
}));

type Props = {
  title: string;
  date: string;
  participationType: 'ATTENDEE' | 'SPEAKER' | 'HOST';
  style?: any;
};

function ProfileEvent(props: Props) {
  const styles = useStyles();
  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <RSText type="body" size={11} italic color={colors.secondaryText}>
          {props.date}
        </RSText>
        <RSText
          type="body"
          size={12}
          bold
          color={colors.primaryText}
          className={styles.eventTitle}
        >
          {props.title}
        </RSText>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <RSText type="body" size={12} color={colors.primaryText}>
          {props.participationType}
        </RSText>
        <IconButton>
          <BsChevronDown size={12} color={colors.secondaryText} />
        </IconButton>
      </div>
    </div>
  );
}

export default ProfileEvent;
