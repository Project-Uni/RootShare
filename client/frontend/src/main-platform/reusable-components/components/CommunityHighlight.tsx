import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';

const MAX_DESC_LEN = 200;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.secondary,
    borderRadius: 10,
    padding: 15,
  },
  left: {
    display: 'flex',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  profilePic: {
    height: 70,
    width: 70,
    borderRadius: 50,
    border: `1px solid ${colors.primaryText}`,
  },
  connectButton: {
    background: colors.bright,
    color: colors.primaryText,
    '&:hover': {
      background: colors.primary,
    },
  },
  textContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
  type: {
    marginBottom: 6,
  },
  noUnderline: {
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
}));

type Props = {
  style?: any;
  communityID: string;
};

function CommunityHighlight(props: Props) {
  const styles = useStyles();

  const message =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis.';

  const messageSubstr = message.substr(0, MAX_DESC_LEN);
  return (
    <div className={[styles.wrapper, props.style || null].join(' ')}>
      <div className={styles.left}>
        <a href={`/community/${props.communityID}`}>
          <img src={PurdueHypeBanner} className={styles.profilePic} />
        </a>
        <div className={styles.textContainer}>
          <a href={`/community/${props.communityID}`} className={styles.noUnderline}>
            <RSText type="head" size={13} color={colors.primaryText}>
              RootShare
            </RSText>
          </a>
          <RSText
            type="subhead"
            size={12}
            color={colors.primaryText}
            className={styles.type}
          >
            Business
          </RSText>
          <RSText
            type="subhead"
            size={12}
            color={colors.secondaryText}
            className={styles.type}
          >
            {message !== messageSubstr ? messageSubstr.concat(' ...') : message}
          </RSText>
          <RSText type="subhead" size={12} color={colors.primaryText}>
            1498 Members | 178 Mutual
          </RSText>
        </div>
      </div>
      <div style={{ width: 125 }}>
        <Button className={styles.connectButton}>Join</Button>
      </div>
    </div>
  );
}

export default CommunityHighlight;
