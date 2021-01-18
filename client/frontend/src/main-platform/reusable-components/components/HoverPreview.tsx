import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover, Avatar } from '@material-ui/core';
import { CommunityType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type UserFields = {
  relationship: 'getFromDefinedType';
  work?: string;
  position?: string;
  major?: string;
  graduationYear?: number;
};

type CommunityFields = {
  relationship: 'getFromDefinedType';
  type: CommunityType;
  description: string;
};

type AdditionalFields<T extends 'user' | 'community'> = T extends 'user'
  ? UserFields
  : CommunityFields;

type Props<T extends 'user' | 'community'> = {
  _id: string;
  anchorEl: HTMLElement | null;
  profilePicture?: string;
  name: string;
  additionalFields: AdditionalFields<T>;
};

export function HoverPreview<T extends 'user' | 'community'>(props: Props<T>) {
  const styles = useStyles();

  const { anchorEl } = props;

  const open = Boolean(anchorEl);

  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
}
