import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Theme from '../../theme/Theme';
import {
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Box,
  Menu,
  MenuItem,
} from '@material-ui/core';

import { Event } from './MeetTheGreeks';
import { RSText } from '../../base-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: Theme.white,
    padding: 1,
  },
  linkText: {
    color: 'inherit',
    textDecoration: 'none',
    '&:visited': {
      color: 'inherit',
    },
    '&:hover': {
      textDecoration: 'underline',
    },
    display: 'inline-block',
  },
}));

type Props = {
  className?: string;
  event: Event;
};

function MTGEvent(props: Props) {
  const styles = useStyles();

  const {
    className,
    event: {
      _id: eventID,
      description,
      introVideoURL,
      dateTime,
      eventBanner,
      community: { _id: communityID, name: communityName },
    },
  } = props;

  return (
    <Box
      borderRadius={10}
      boxShadow={2}
      className={[className, styles.wrapper].join(' ')}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
        }}
      >
        <a href={`/community/${communityID}`} className={styles.linkText}>
          <RSText
            size={16}
            type="head"
            bold
          >{`Meet The Greeks - ${communityName}`}</RSText>
        </a>
      </div>
    </Box>
  );
}

export default MTGEvent;
