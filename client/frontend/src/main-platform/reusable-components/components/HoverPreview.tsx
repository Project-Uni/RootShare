import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover, Avatar } from '@material-ui/core';
import { CommunityType } from '../../../helpers/types';

import { useSelector, useDispatch } from 'react-redux';

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

// type AdditionalFields<T extends 'user' | 'community'> = T extends 'user'
//   ? UserFields
//   : CommunityFields;

export type HoverProps = {
  _id: string;
  type: 'user' | 'community';
  anchorEl: HTMLElement | null;
  profilePicture?: string;
  name: string;
  additionalFields: UserFields | CommunityFields;
};

// Conditional Typing Guide
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

export function HoverPreview() {
  const styles = useStyles();

  const {
    anchorEl,
    _id,
    type,
    profilePicture,
    name,
    additionalFields: additionalFieldsProps,
  } = useSelector((state: { [key: string]: any }) => state.hoverPreview);

  const open = Boolean(anchorEl);
  const additionalFields = useState(
    type === 'user'
      ? (additionalFieldsProps as UserFields)
      : (additionalFieldsProps as CommunityFields)
  );

  // const renderAdditionalFields = (fields: UserFields) => {};
  // const renderAdditionalFields = (fields: CommunityFields) => {};

  return (
    <div className={styles.wrapper}>
      <p>I am a template</p>
    </div>
  );
}
