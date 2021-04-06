import React, { useState, useEffect } from 'react';
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%'
  },
  
}));

type Props = {};

export const PromotedEvents = (props: Props) => {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      YOLO
    </div>
  );
};