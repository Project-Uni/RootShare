import React, { useEffect, useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Popover, Avatar } from '@material-ui/core';

import { useSelector, useDispatch } from 'react-redux';

import { CommunityType } from '../../../helpers/types';

import { clearHoverPreview } from '../../../redux/actions/interactions';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import RSButton from './RSButton';

const useStyles = makeStyles((_: any) => ({
  paper: {
    borderRadius: 20,
    background: Theme.white,
  },
  actionButton: {
    width: '100%',
    marginTop: 15,
  },
  navigation: {
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
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
  communityType: CommunityType;
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

  const additionalFields = useState(
    type === 'user'
      ? (additionalFieldsProps as UserFields)
      : (additionalFieldsProps as CommunityFields)
  );
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);
  const id = open ? 'preview-popover' : undefined;

  const fetchData = () => {
    setLoading(true);
    const route = type === 'user' ? '' : '';
    const { data } = await makeRequest('GET');
    setLoading(false);
  };

  const handleClose = () => dispatch(clearHoverPreview());

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
      // onMouseLeave={handleClose}
      onClose={handleClose}
      classes={{ paper: styles.paper }}
    >
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <a href={`/${type === 'user' ? 'profile' : type}/${_id}`}>
              <Avatar
                src={profilePicture}
                alt={name}
                style={{ marginRight: 15, height: 125, width: 125 }}
              />
            </a>
          </div>
          <div style={{ flex: 1 }}>
            <RSText
              size={14}
              bold
              type="head"
              className={styles.navigation}
              onClick={() =>
                (window.location.href = `/${
                  type === 'user' ? 'profile' : type
                }/${_id}`)
              }
            >
              {name}
            </RSText>
          </div>
        </div>
        <RSButton className={styles.actionButton}>Connect</RSButton>
      </div>
    </Popover>
  );
};

export default React.memo(HoverPreview);
