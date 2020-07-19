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
    background: colors.primary,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
  },
  eventTitle: {
    marginLeft: 10,
  },
}));

type Props = {};

function ProfileEvent(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.wrapper}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <RSText type="body" size={12} italic color={colors.secondaryText}>
          Aug 14, 2020
        </RSText>
        <RSText
          type="body"
          size={14}
          bold
          color={colors.primaryText}
          className={styles.eventTitle}
        >
          The Baby Boilers are Back
        </RSText>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <RSText type="body" size={14} color={colors.primaryText}>
          SPEAKER
        </RSText>
        <IconButton>
          <BsChevronDown size={14} color={colors.secondaryText} />
        </IconButton>
      </div>
    </div>
  );
}

export default ProfileEvent;
