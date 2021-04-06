import React, { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core";
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
  },
  
}));

type Props = {
  _id: string,
  className?: string,
  banner?: string,
  date?: string,
  title?: string,
  location?: string,
  hover?: boolean,
  breif_description?: string,
};

export const EventWidget = (props: Props) => {
  const styles = useStyles();

  return (
    <>
      <RSCard className={props.className}>
        <RSLink
          href={`/event/${props._id}`}
        >
          <div
            style={{
              backgroundImage: `url(${props.banner})`,
            }}
            className={styles.banner}
          >
            <div className={styles.bannerFilter}>
              <div className={styles.text}>
                <RSText color={Theme.white} size={18} bold={true}>{props.date}</RSText>
                <RSText color={Theme.white} size={14} bold={true}>{props.title}</RSText>
              </div>
            </div>
          </div>
        </RSLink>
      </RSCard>
    </>
  );
};