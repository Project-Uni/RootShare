import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import Theme from '../../../theme/Theme';
import { RSLink } from '..';
import { RSText } from '../../../base-components';
import { RSCard } from './RSCard';

const useStyles = makeStyles((_: any) => ({
  banner: {
    backgroundColor: Theme.primaryHover,
    backgroundPosition: 'left top',
    backgroundFit: 'cover',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    borderRadius: 40,
    height: '100%',
    width: '100%',
  },
  bannerFilter: {
    borderRadius: 40,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  text: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
    width: '80%',
    marginLeft: 20,
  },
  title: {
    marginTop: 5,
    textAlign: 'left',
  },
}));

type Props = {
  _id: string;
  className?: string;
  image?: string;
  date?: string;
  title?: string;
  location?: string;
};

export const EventWidget = (props: Props) => {
  const styles = useStyles();

  const [textColor, setTextColor] = useState(Theme.white);

  function handleMouseOver() {
    setTextColor(Theme.bright);
  }

  function handleMouseLeave() {
    setTextColor(Theme.white);
  }

  return (
    <>
      <RSCard className={props.className}>
        <RSLink href={`/event/${props._id}`}>
          <div
            style={{
              backgroundImage: `url(${props.image})`,
            }}
            className={styles.banner}
            onMouseEnter={Theme.bright ? handleMouseOver : undefined}
            onMouseLeave={Theme.bright ? handleMouseLeave : undefined}
          >
            <div className={styles.bannerFilter}>
              <div className={styles.text}>
                <RSText
                  color={textColor}
                  size={14}
                  bold={true}
                  className={styles.title}
                >
                  {props.date}
                </RSText>
                <RSText
                  color={textColor}
                  size={10}
                  bold={true}
                  className={styles.title}
                >
                  {props.location}
                </RSText>
                <RSText
                  color={textColor}
                  size={12}
                  bold={true}
                  type="subhead"
                  className={styles.title}
                  multiline={true}
                >
                  {props.title}
                </RSText>
              </div>
            </div>
          </div>
        </RSLink>
      </RSCard>
    </>
  );
};
