import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Popover, Avatar } from '@material-ui/core';
import { CommunityType } from '../../../helpers/types';

import { useSelector, useDispatch } from 'react-redux';
import { clearHoverPreview } from '../../../redux/actions/interactions';

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

export type HoverProps = {
  _id: string;
  type: 'user' | 'community';
  anchorEl: HTMLElement | null;
  profilePicture?: string;
  name: string;
  additionalFields?: UserFields | CommunityFields; //Optionalizing for now
};

// Conditional Typing Guide
// https://www.typescriptlang.org/docs/handbook/2/conditional-types.html

const HoverPreview = () => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const {
    anchorEl,
    _id,
    type,
    profilePicture,
    name,
    additionalFields: additionalFieldsProps,
  } = useSelector((state: { [key: string]: any }) => state.hoverPreview);

  const state = useSelector((state) => state);
  console.log('State:', state);
  console.log('Retrieved Fields:', type, name, _id, profilePicture);
  const additionalFields = useState(
    type === 'user'
      ? (additionalFieldsProps as UserFields)
      : (additionalFieldsProps as CommunityFields)
  );

  const open = Boolean(anchorEl);
  const id = open ? 'preview-popover' : undefined;

  const handleClose = () => dispatch(clearHoverPreview());

  useEffect(() => {
    console.log('Is Open?:', open);
  }, [open]);

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      onMouseLeave={handleClose}
      onClose={handleClose}
    >
      <Avatar
        src={profilePicture}
        alt={name}
        style={{ marginRight: 15, height: 50, width: 50 }}
      />
    </Popover>
  );
};

export default React.memo(HoverPreview);
