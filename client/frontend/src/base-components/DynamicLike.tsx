import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { IconButton } from '@material-ui/core';
import { BsStar, BsStarFill } from 'react-icons/bs';
import { colors } from '../theme/Colors';

import * as mojs from '@mojs/core';

const useStyles = makeStyles((_: any) => ({}));

type Props = {};

function DynamicLike(props: Props) {
  const styles = useStyles();
  return (
    <IconButton>
      <BsStar color={colors.bright} size={20} />
    </IconButton>
  );
}

export default DynamicLike;
