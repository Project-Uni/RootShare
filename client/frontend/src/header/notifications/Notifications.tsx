import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { Avatar, CircularProgress, Popper } from '@material-ui/core';
import { RSCard, RSLink } from '../../main-platform/reusable-components';
import { RSText } from '../../base-components';
import { NotificationType, UnifiedNotification } from '../../api';
import dayjs from 'dayjs';
import Theme from '../../theme/Theme';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { useSelector } from 'react-redux';
import { green } from '@material-ui/core/colors';

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
      <RSCard style={{ width: 300 }} variant="secondary">
        <RSText
          bold
          size={13}
          style={{
            paddingTop: 10,
            marginLeft: 15,
            marginRight: 15,
            marginBottom: 10,
          }}
        >
          Notifications
        </RSText>
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
  href: string;
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
    switch (relatedItemType) {
      case 'user':
        return {
          image: relatedItem!.profilePicture,
          timestamp: dayjs(createdAt).format('MMM D YYYY h:mm A'),
          seen,
          message,
          href: `/profile/${relatedItem!._id}`,
        };
      case 'community':
        return {
          image: relatedItem!.profilePicture,
          timestamp: dayjs(createdAt).format('MMM D YYYY h:mm A'),
          seen,
          message,
          href: `/community/${relatedItem!._id}`,
        };
      case 'event':
        return {
          image: relatedItem!.profilePicture,
          timestamp: dayjs(createdAt).format('MMM D YYYY h:mm A'),
          seen,
          message,
          href: `/event/${relatedItem!._id}`,
        };
      case 'post':
        return {
          image: undefined,
          timestamp: dayjs(createdAt).format('MMM D YYYY h:mm A'),
          seen,
          message,
          href: `/post/${relatedItem!._id}`,
        };
      default:
        return undefined;
    }
  };

  return (
    <div
      style={{
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 7,
        paddingRight: 7,
        background: seen ? undefined : green[100],
        ...style,
      }}
      className={className}
    >
      <RSLink href={data?.href}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={data?.image} style={{ marginRight: 7 }} />
          <div>
            <RSText>{data?.message}</RSText>
            <RSText color={Theme.secondaryText} size={10}>
              {data?.timestamp}
            </RSText>
          </div>
        </div>
      </RSLink>
    </div>
  );
};
