import React, { useEffect, useState, useCallback } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Avatar, Popper, Box } from '@material-ui/core';

import { GiGraduateCap } from 'react-icons/gi';
import { FaUserTie } from 'react-icons/fa';

import { useSelector, useDispatch } from 'react-redux';

import {
  CommunityType,
  UserToUserRelationship,
  UserToCommunityRelationship,
} from '../../../helpers/types';

import {
  clearHoverPreview,
  dispatchSnackbar,
} from '../../../redux/actions/interactions';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import RSButton from './RSButton';
import {
  putUpdateUserConnection,
  getCommunities,
  getUsers,
  putUserToCommunityRelationship,
} from '../../../api';

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
  pendingButton: {
    flex: 0.5,
  },
}));

type UserFields = {
  relationship: UserToUserRelationship;
  work?: string;
  position?: string;
  major?: string;
  graduationYear?: number;
  type: string;
};

type CommunityFields = {
  relationship: UserToCommunityRelationship;
  type: CommunityType;
  description: string;
  private?: boolean;
};

type UserResponse = {
  users: {
    [k: string]: unknown;
    relationship: UserToUserRelationship;
    work?: string;
    position?: string;
    major?: string;
    graduationYear?: number;
    accountType: string;
  }[];
};

type CommunityResponse = {
  communities: (CommunityFields & {
    [k: string]: unknown;
  })[];
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
  const [actionLoading, setActionLoading] = useState(false);
  const [mouseEntered, setMouseEntered] = useState(false);

  const [open, setOpen] = useState(Boolean(anchorEl));
  const id = open ? 'preview-popover' : undefined;

  useEffect(() => {
    if (anchorEl && !loading) fetchData();
    else if (open) setOpen(false);
  }, [anchorEl]);

  const handleCloseOnScroll = useCallback(() => {
    if (open) handleClose();
  }, [open]);

  useEffect(() => {
    const mainComponent = document.getElementById('mainComponent');
    mainComponent?.addEventListener('scroll', handleCloseOnScroll, {
      passive: true,
    });
    return () => mainComponent?.removeEventListener('scroll', handleCloseOnScroll);
  }, [handleCloseOnScroll]);

  const fetchData = useCallback(async () => {
    const data =
      type === 'user'
        ? await getUsers<UserResponse>([_id], {
            fields: ['work', 'position', 'major', 'graduationYear', 'accountType'],
            options: {
              getProfilePicture: false,
              getRelationship: true,
              limit: 1,
            },
          })
        : await getCommunities<CommunityResponse>([_id], {
            fields: ['description', 'type', 'private'],
            options: {
              limit: 1,
              getProfilePicture: false,
              getRelationship: true,
              includeDefaultFields: false,
            },
          });
    if (data.success === 1) {
      if (type === 'user') {
        const user = (data.content as UserResponse).users[0];
        setAdditionalFields({
          relationship: user.relationship,
          work: user.work,
          position: user.position,
          major: user.major,
          graduationYear: user.graduationYear,
          type: user.accountType,
        } as UserFields);
      } else {
        const community = (data.content as CommunityResponse).communities[0];
        setAdditionalFields({
          relationship: community.relationship,
          type: community.type,
          description: community.description,
        } as CommunityFields);
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

  const handleUserButtonAction = useCallback(
    async (action: 'connect' | 'reject' | 'accept' | 'remove' | 'cancel') => {
      setActionLoading(true);
      const data = await putUpdateUserConnection(action, _id);
      if (data.success === 1) {
        let newRelationship: UserToUserRelationship;
        switch (action) {
          case 'connect':
            newRelationship = 'PENDING_TO';
            break;

          case 'accept':
            newRelationship = 'CONNECTED';
            break;
          case 'reject':
          case 'cancel':
          case 'remove':
            newRelationship = 'OPEN';
            break;
        }
        setAdditionalFields({
          ...additionalFields,
          relationship: newRelationship,
        } as UserFields);
        dispatch(
          dispatchSnackbar({
            message: 'Successfully performed action',
            mode: 'success',
          })
        );
      } else {
        dispatch(
          dispatchSnackbar({
            message: 'There was an error performing the action',
            mode: 'error',
          })
        );
      }
      setActionLoading(false);
    },
    [_id, additionalFields]
  );

  const handleCommunityButtonAction = useCallback(
    async (action: 'join' | 'cancel' | 'leave') => {
      setActionLoading(true);
      const data: { success: number } = await putUserToCommunityRelationship(
        action,
        _id
      );
      if (data.success === 1) {
        let newRelationship: UserToCommunityRelationship;
        switch (action) {
          case 'join':
            if ((additionalFields as CommunityFields).private)
              newRelationship = 'PENDING';
            else newRelationship = 'JOINED';
            break;
          case 'leave':
          case 'cancel':
            newRelationship = 'OPEN';
            break;
        }
        setAdditionalFields({
          ...additionalFields,
          relationship: newRelationship,
        } as CommunityFields);
        dispatch(
          dispatchSnackbar({
            message: 'Successfully performed action',
            mode: 'success',
          })
        );
      } else {
        dispatch(
          dispatchSnackbar({
            message: 'There was an error performing the action',
            mode: 'error',
          })
        );
      }
      setActionLoading(false);
    },
    [_id, additionalFields]
  );

  const ActionButton = useCallback(() => {
    if (type === 'user')
      switch ((additionalFields as UserFields)?.relationship) {
        case 'OPEN':
          return (
            <RSButton
              className={styles.actionButton}
              onClick={() => handleUserButtonAction('connect')}
              disabled={actionLoading}
            >
              Connect
            </RSButton>
          );
        case 'PENDING_TO':
          return (
            <RSButton
              className={styles.actionButton}
              variant="secondary"
              onClick={() => handleUserButtonAction('cancel')}
              disabled={actionLoading}
            >
              Pending
            </RSButton>
          );
        case 'PENDING_FROM':
          return (
            <div style={{ display: 'flex' }} className={styles.actionButton}>
              <RSButton
                variant="secondary"
                className={styles.pendingButton}
                onClick={() => handleUserButtonAction('reject')}
                disabled={actionLoading}
              >
                Reject
              </RSButton>
              <span style={{ marginLeft: 8, marginRight: 8 }} />
              <RSButton
                className={styles.pendingButton}
                onClick={() => handleUserButtonAction('accept')}
                disabled={actionLoading}
              >
                Connect
              </RSButton>
            </div>
          );
        case 'CONNECTED':
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              variant="secondary"
            >
              Connected
            </RSButton>
          );
        case 'SELF':
        default:
          return <></>;
      }
    else
      switch ((additionalFields as CommunityFields)?.relationship) {
        case 'OPEN':
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              onClick={() => handleCommunityButtonAction('join')}
            >
              Join
            </RSButton>
          );
        case 'PENDING':
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              variant="secondary"
              onClick={() => handleCommunityButtonAction('cancel')}
            >
              Pending
            </RSButton>
          );
        case 'JOINED':
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              variant="secondary"
              onClick={() => handleCommunityButtonAction('leave')}
            >
              Member
            </RSButton>
          );
        case 'ADMIN':
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              variant="secondary"
            >
              Admin
            </RSButton>
          );
        default:
          return <></>;
      }
  }, [additionalFields, actionLoading]);

  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement="top-start"
      style={{ zIndex: 10 }}
    >
      <Box
        boxShadow={2}
        borderRadius={20}
        style={{ padding: 20, background: Theme.white }}
        onMouseEnter={() => setMouseEntered(true)}
        onMouseLeave={() => {
          if (mouseEntered) handleClose();
        }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <a href={`/${type === 'user' ? 'profile' : type}/${_id}`}>
              <Avatar
                src={profilePicture}
                alt={name}
                style={{
                  marginRight: 15,
                  height: 125,
                  width: 125,
                  border: `2px solid ${Theme.bright}`,
                }}
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
        <ActionButton />
      </Box>
    </Popper>
  );
};

export default React.memo(HoverPreview);

const MAX_DESC_LEN = 80;
const AdditionalPreviewData = ({
  type,
  additionalFields: additionalFieldsProps,
}: {
  type: 'user' | 'community';
  additionalFields: UserFields | CommunityFields;
}) => {
  if (type === 'community') {
    const { description, private: isPrivate } = Object.assign(
      {},
      additionalFieldsProps
    ) as CommunityFields;

    return (
      <div style={{ marginTop: 10, maxWidth: 225 }}>
        <RSText>
          {description.length > MAX_DESC_LEN
            ? `${description.substr(0, MAX_DESC_LEN)} ...`
            : description}
        </RSText>
      </div>
    );
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
