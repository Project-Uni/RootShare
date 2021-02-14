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
  U2UR,
  U2CR,
} from '../../../helpers/types';

import {
  clearHoverPreview,
  dispatchSnackbar,
  mouseEnteredHoverPreview,
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
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { RSLink } from '../';
import { useHistory } from 'react-router-dom';

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
  const history = useHistory();

  const { anchorEl, _id, type, profilePicture, name, mouseEntered } = useSelector(
    (state: RootshareReduxState) => state.hoverPreview
  );

  const [additionalFields, setAdditionalFields] = useState<
    UserFields | CommunityFields
  >();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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

  useEffect(() => {
    const removeHistoryListen = history.listen((location, action) => {
      if (anchorEl || open) {
        setOpen(false);
        dispatch(clearHoverPreview());
      }
    });
    return removeHistoryListen;
  }, [history]);

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
            newRelationship = U2UR.PENDING_TO;
            break;

          case 'accept':
            newRelationship = U2UR.CONNECTED;
            break;
          case 'reject':
          case 'cancel':
          case 'remove':
            newRelationship = U2UR.OPEN;
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
              newRelationship = U2CR.PENDING;
            else newRelationship = U2CR.JOINED;
            break;
          case 'leave':
          case 'cancel':
            newRelationship = U2CR.OPEN;
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
        case U2UR.OPEN:
          return (
            <RSButton
              className={styles.actionButton}
              onClick={() => handleUserButtonAction('connect')}
              disabled={actionLoading}
            >
              Connect
            </RSButton>
          );
        case U2UR.PENDING_TO:
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
        case U2UR.PENDING_FROM:
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
        case U2UR.CONNECTED:
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              onClick={() => handleUserButtonAction('remove')}
              variant="secondary"
            >
              Connected
            </RSButton>
          );
        case U2UR.SELF:
        default:
          return <></>;
      }
    else
      switch ((additionalFields as CommunityFields)?.relationship) {
        case U2CR.OPEN:
          return (
            <RSButton
              className={styles.actionButton}
              disabled={actionLoading}
              onClick={() => handleCommunityButtonAction('join')}
            >
              Join
            </RSButton>
          );
        case U2CR.PENDING:
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
        case U2CR.JOINED:
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
        case U2CR.ADMIN:
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
        onMouseEnter={() => dispatch(mouseEnteredHoverPreview())}
        onMouseLeave={() => {
          if (mouseEntered) handleClose();
        }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
            <RSLink href={`/${type === 'user' ? 'profile' : type}/${_id}`}>
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
            </RSLink>
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
