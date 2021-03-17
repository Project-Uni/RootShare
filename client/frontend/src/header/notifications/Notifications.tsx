import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { Popper } from '@material-ui/core';
import { RSCard } from '../../main-platform/reusable-components';
import { RSText } from '../../base-components';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  onClose: () => void;
};

export const Notifications = (props: Props) => {
  const { open, anchorEl, onClose } = props;
  const styles = useStyles();

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
      <RSCard style={{ width: 300, padding: 10 }} variant="secondary">
        <RSText bold size={13}>
          Notifications
        </RSText>
      </RSCard>
    </Popper>
  );
};

type NotificationProps = {
  message: string;
  variant: string;
  createdAt: string;
  updatedAt: string;
  forUser: string;
  seen: boolean;
  relatedItemType: 'post' | 'event' | 'community' | 'connection';
  actionProviderType: 'user' | 'community' | 'rootshare';
  actionProvider: { [key: string]: any };
  relatedItem: { [key: string]: any };
};

const Notification = (props: NotificationProps) => {
  const {
    message,
    variant,
    createdAt,
    updatedAt,
    forUser,
    seen,
    relatedItemType,
    actionProviderType,
    actionProvider,
    relatedItem,
  } = props;

  return <div></div>;
};

type NotificationResponse = {
  message: string;
  variant: string;
  createdAt: string;
  updatedAt: string;
  forUser: string;
  seen: boolean;
  relatedItemType: 'post' | 'event' | 'community' | 'connection';
  relatedPost?: {
    _id: string;
    message: string;
  };
  relatedCommunity?: {
    _id: string;
    name: string;
    type: string;
    profilePicture?: string;
  };
  relatedEvent?: {
    _id: string;
    title: string;
    dateTime: string;
    eventImage?: string;
    eventBanner?: string;
  };
  relatedConnection?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderType: 'user' | 'community' | 'rootshare';
  actionProviderUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  actionProviderCommunity?: {
    _id: string;
    name: string;
    type: string;
    profilePicture?: string;
  };
};

const unifyNotifications = (notifications: NotificationResponse[]) => {
  return notifications.map((n) => {
    const {
      relatedCommunity,
      relatedPost,
      relatedEvent,
      relatedConnection,
      actionProviderCommunity,
      actionProviderUser,
      ...rest
    } = n;
    let relatedItem:
      | NotificationResponse['relatedCommunity']
      | NotificationResponse['relatedEvent']
      | NotificationResponse['relatedPost']
      | NotificationResponse['relatedConnection'];
    switch (n.relatedItemType) {
      case 'community':
        relatedItem = n.relatedCommunity;
        break;
      case 'connection':
        relatedItem = n.relatedConnection;
        break;
      case 'event':
        relatedItem = n.relatedEvent;
        break;
      case 'post':
        relatedItem = n.relatedPost;
        break;
      default:
    }

    let actionProvider:
      | NotificationResponse['actionProviderUser']
      | NotificationResponse['actionProviderCommunity'];

    switch (n.actionProviderType) {
      case 'user':
        actionProvider = n.actionProviderUser;
      case 'community':
        actionProvider = n.actionProviderCommunity;
      case 'rootshare':
      default:
    }

    return Object.assign({}, { actionProvider, relatedItem }, rest);
  });
};
