import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { Avatar, CircularProgress, Popper } from '@material-ui/core';
import { RSCard, RSLink } from '../../main-platform/reusable-components';
import { RSText } from '../../base-components';
import { UnifiedNotification } from '../../api';
import Theme from '../../theme/Theme';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { useSelector } from 'react-redux';
import { green, grey } from '@material-ui/core/colors';
import GreyRootshareIcon from '../../images/icongray.png';
import { formatTimestamp } from '../../helpers/functions';

import RootShareLogo_Small from '../../images/RootShareLogoFull_Small.png';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({ wrapper: {} }));

type Props = {
  open: boolean;
  anchorEl: null | HTMLElement;
  notifications: UnifiedNotification[];
  loading: boolean;
};

export const Notifications = (props: Props) => {
  const { open, anchorEl, notifications, loading } = props;
  const styles = useStyles();

  return (
    <Popper open={open} anchorEl={anchorEl} placement="bottom-end">
      <RSCard
        style={{ width: 375, maxHeight: 500, overflowY: 'scroll' }}
        variant="secondary"
      >
        {loading ? (
          <CircularProgress color="primary" style={{ height: 40 }} />
        ) : (
          <>
            {notifications.map((n, i) => {
              return (
                <Notification
                  {...n}
                  key={`notification_${i}`}
                  style={
                    i === notifications.length - 1
                      ? { borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }
                      : i === 0
                      ? { borderTopLeftRadius: 30, borderTopRightRadius: 30 }
                      : undefined
                  }
                />
              );
            })}
          </>
        )}
      </RSCard>
    </Popper>
  );
};

type ShapedNotification = {
  image: string | undefined;
  timestamp: string;
  message: string;
  seen: boolean;
  href?: string;
};

const Notification = (
  props: UnifiedNotification & { style?: React.CSSProperties; className?: string }
) => {
  const {
    style,
    className,
    message,
    createdAt,
    seen,
    relatedItemType,
    actionProviderType,
    actionProvider,
    relatedItem,
  } = props;

  const [data, setData] = useState<ShapedNotification>();
  const user = useSelector((state: RootshareReduxState) => state.user);

  useEffect(() => {
    const shapedData = shapeProps();
    setData(shapedData);
  }, []);

  const shapeProps = (): ShapedNotification | undefined => {
    const timestamp = formatTimestamp(createdAt, 'MMM D h:mm A');
    let image: string | undefined;
    switch (actionProviderType) {
      case 'user':
      case 'community':
        image = actionProvider?.profilePicture;
        break;
      case 'rootshare':
        // if (relatedItemType === 'event') image = relatedItem?.profilePicture;
        // else image = GreyRootshareIcon;
        image = GreyRootshareIcon;
        break;
      default:
    }

    switch (relatedItemType) {
      case 'user':
        return {
          image,
          timestamp,
          seen,
          message,
          href: `/profile/${relatedItem!._id}`,
        };
      case 'community':
        return {
          image,
          timestamp,
          seen,
          message,
          href: `/community/${relatedItem!._id}`,
        };
      case 'event':
        return {
          image,
          timestamp,
          seen,
          message,
          href: `/event/${relatedItem!._id}`,
        };
      case 'post':
        return {
          image,
          timestamp,
          seen,
          message,
          href: `/post/${relatedItem!._id}`,
        };
      default:
        return {
          image,
          timestamp,
          seen,
          message,
          href: undefined,
        };
    }
  };

  return (
    <div
      style={{
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
        background: seen ? undefined : green[100],
        ...style,
      }}
      className={className}
    >
      <RSLink href={data?.href}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={data?.image}
            style={{ marginRight: 15, height: 50, width: 50 }}
          />
          <div
            style={{
              borderBottom: `1px solid ${Theme.primaryText}`,
              paddingBottom: 10,
              flex: 1,
            }}
          >
            {actionProviderType === 'rootshare' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <RSText bold size={11} style={{ marginBottom: 5 }}>
                  Message From
                </RSText>
                <img
                  src={RootShareLogo_Small}
                  style={{ height: 18, marginBottom: 5, marginLeft: 3 }}
                />
              </div>
            )}
            <RSText size={11}>{data?.message}</RSText>
            <RSText color={Theme.secondaryText} size={9}>
              {data?.timestamp}
            </RSText>
          </div>
        </div>
      </RSLink>
    </div>
  );
};
