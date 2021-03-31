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
import GreyRootshareIcon from '../../images/icongray.png';
import { formatTimestamp } from '../../helpers/functions';

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
      <RSCard style={{ width: 375 }} variant="secondary">
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
    const timestamp = formatTimestamp(createdAt, 'MMM D h:mm A');
    let image: string | undefined;
    switch (actionProviderType) {
      case 'user':
      case 'community':
        image = actionProvider?.profilePicture;
        break;
      case 'rootshare':
        if (relatedItemType === 'event') image = relatedItem?.profilePicture;
        else image = GreyRootshareIcon;
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
        return undefined;
    }
  };

  return (
    <div
      style={{
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 15,
        paddingRight: 15,
        background: seen ? undefined : green[100],
        ...style,
      }}
      className={className}
    >
      <RSLink href={data?.href}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src={data?.image} style={{ marginRight: 7 }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${Theme.primaryText}`,
              alignItems: 'flex-start',
              paddingBottom: 10,
              flex: 1,
            }}
          >
            <RSText size={11}>
              {data?.message}
              {/* <RSText
                color={Theme.secondaryText}
                size={9}
                style={{ display: 'inline-block' }}
              >
                {data?.timestamp}
              </RSText> */}
            </RSText>
            <RSText
              color={Theme.secondaryText}
              size={9}
              style={{ textAlign: 'right' }}
            >
              {data?.timestamp}
            </RSText>
          </div>
          {/* <div>
            <RSText>{data?.message}</RSText>
            <RSText color={Theme.secondaryText} size={10}>
              {data?.timestamp}
            </RSText>
          </div> */}
        </div>
      </RSLink>
    </div>
  );
};
