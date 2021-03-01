import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export const UserPost = (props: Props) => {
  const styles = useStyles();

  const { className, style } = props;

  return (
    <div className={[className, styles.wrapper].join(' ')} style={style}>
      <p>RSPost Template</p>
    </div>
  );
};
