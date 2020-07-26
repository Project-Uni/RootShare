import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';

import { FaEllipsisH, FaRegStar, FaStar } from 'react-icons/fa';

import BabyBoilersBanner from '../../../images/PurdueHypeAlt.png';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const MAX_DESC_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.secondary,
  },
  streamPreview: {
    width: 160,
    height: 90,
    marginTop: 10,
    marginLeft: 10,
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  body: {
    flex: 1,
    marginLeft: 15,
    textAlign: 'left',
  },
  buttons: {},
  headerRight: {},
  desc: {
    marginRight: 35,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  host: {
    color: colors.secondaryText,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  seeMore: {
    textDecoration: 'none',
    color: colors.secondaryText,
    marginLeft: 20,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
}));

type Props = {
  eventID: string;
  eventTitle: string;
  eventDesc: string;
  eventHostName: string;
  eventHostID: string;
  eventDate: string;
  className?: any;
  liked?: boolean;
};

function Stream(props: Props) {
  const styles = useStyles();
  const [showFullDesc, setShowFullDesc] = useState(false);

  const descSubstr = props.eventDesc.substr(0, MAX_DESC_LEN);

  function handleSeeClicked() {
    setShowFullDesc(!showFullDesc);
  }

  return (
    <div className={[styles.wrapper, props.className || null].join(' ')}>
      {/* TODO - Navigate this to video stream  */}
      <a href={`/event/${props.eventID}`}>
        <img src={BabyBoilersBanner} className={styles.streamPreview} />
      </a>

      <div className={styles.body}>
        <div className={styles.top}>
          <div className={styles.headerRight}>
            {/* TODO - Navigate this to video stream  */}
            <a href={`/event/${props.eventID}`} className={styles.noUnderline}>
              <RSText type="head" color={colors.primaryText} bold size={14}>
                {props.eventTitle}
              </RSText>
            </a>

            <RSText type="body" size={12} color={colors.secondaryText}>
              Hosted by{' '}
              <a href={`/community/${props.eventHostID}`} className={styles.host}>
                {props.eventHostName}
              </a>
              <span style={{ marginLeft: 10, marginRight: 10 }}>|</span>Aug 14, 2020
            </RSText>
          </div>
          <div className={styles.buttons}>
            <IconButton>
              {props.liked ? (
                <FaStar color={colors.bright} size={18} />
              ) : (
                  <FaRegStar color={colors.fourth} size={18} />
                )}
            </IconButton>
          </div>
        </div>

        <RSText type="body" color={colors.primaryText} size={12} className={styles.desc}>
          {props.eventDesc === descSubstr || showFullDesc
            ? props.eventDesc
            : descSubstr + ' ...'}
          {props.eventDesc !== descSubstr && (
            <a
              href={undefined}
              className={styles.seeMore}
              onClick={handleSeeClicked}
            >
              See {showFullDesc ? 'less' : 'more'}
            </a>
          )}
        </RSText>
      </div>
    </div>
  );
}

export default Stream;
