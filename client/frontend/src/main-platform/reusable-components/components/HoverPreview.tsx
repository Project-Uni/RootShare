import React, { useEffect, useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Popover, Avatar } from '@material-ui/core';

import { GiGraduateCap } from 'react-icons/gi';
import { FaUserTie } from 'react-icons/fa';

import { useSelector, useDispatch } from 'react-redux';

import qs from 'query-string';

import { CommunityType } from '../../../helpers/types';

import { clearHoverPreview } from '../../../redux/actions/interactions';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import RSButton from './RSButton';
import { makeRequest } from '../../../helpers/functions';

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

// JANUARY 18 2021 - USE THIS FOR NEW USER RELATIONSHIP TYPES
type UserToUserRelationship = 'open' | 'pending_from' | 'pending_to' | 'connected';

type UserFields = {
  relationship: UserToUserRelationship;
  work?: string;
  position?: string;
  major?: string;
  graduationYear?: number;
  type: string;
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
};

const HoverPreview = () => {
  const styles = useStyles();
  const dispatch = useDispatch();

  const { anchorEl, _id, type, profilePicture, name } = useSelector(
    (state: { [key: string]: any }) => state.hoverPreview
  );

  const [additionalFields, setAdditionalFields] = useState<
    UserFields | CommunityFields
  >();
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(Boolean(anchorEl));
  const id = open ? 'preview-popover' : undefined;

  const fetchData = useCallback(async () => {
    const query = qs.stringify({
      _ids: [_id],
      limit: 1,
      fields: ['work', 'position', 'major', 'graduationYear', 'accountType'],
      getProfilePicture: false,
      getRelationship: true,
    });
    setLoading(true);
    const route = type === 'user' ? '/api/v2/users' : '';
    const { data } = await makeRequest<{
      users: {
        [key: string]: any;
        work?: string;
        position?: string;
        graduationYear?: number;
        major?: string;
        relationship: UserToUserRelationship;
        accountType: string;
      }[];
    }>('GET', `${route}?${query}`);
    if (data.success === 1) {
      if (type === 'user') {
        const user = data.content.users[0];
        setAdditionalFields({
          relationship: user.relationship,
          work: user.work,
          position: user.position,
          major: user.major,
          graduationYear: user.graduationYear,
          type: user.accountType,
        } as UserFields);
      }

      setOpen(true);
    } else {
      dispatch(clearHoverPreview());
    }
    setLoading(false);
  }, [_id, type]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      dispatch(clearHoverPreview());
    }, 300);
  };

  useEffect(() => {
    if (anchorEl && !loading) fetchData();
    else if (open) setOpen(false);
  }, [anchorEl]);

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
            {additionalFields?.type && (
              <RSText color={Theme.secondaryText} italic>
                {additionalFields?.type.charAt(0).toUpperCase() +
                  additionalFields?.type.slice(1)}
              </RSText>
            )}
            {additionalFields && (
              <AdditionalPreviewData
                type={type}
                additionalFields={additionalFields}
              />
            )}
          </div>
        </div>
        <RSButton className={styles.actionButton}>
          {additionalFields?.relationship}
        </RSButton>
      </div>
    </Popover>
  );
};

export default React.memo(HoverPreview);

const AdditionalPreviewData = ({
  type,
  additionalFields: additionalFieldsProps,
}: {
  type: 'user' | 'community';
  additionalFields: UserFields | CommunityFields;
}) => {
  if (type === 'community') {
    const { description, type: communityType } = Object.assign(
      {},
      additionalFieldsProps
    ) as CommunityFields;

    return <></>;
  }

  const { work, position, graduationYear, major } = Object.assign(
    {},
    additionalFieldsProps
  ) as UserFields;

  return (
    <div style={{ marginTop: 10 }}>
      {(work || position) && (
        <>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FaUserTie color={Theme.primary} size={26} />
            <div style={{ marginLeft: 10, marginRight: 10 }}>
              <RSText>{position}</RSText>
              <RSText>{work}</RSText>
            </div>
          </div>
          <div style={{ marginBottom: 15 }} />
        </>
      )}
      {(major || graduationYear) && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <GiGraduateCap color={Theme.primary} size={32} />
          <div style={{ marginLeft: 10, marginRight: 10 }}>
            <RSText>{major}</RSText>
            <RSText>{graduationYear} Graduate</RSText>
          </div>
        </div>
      )}
    </div>
  );
};
