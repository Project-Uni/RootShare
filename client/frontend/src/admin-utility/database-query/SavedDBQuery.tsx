import React, { useCallback, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { IGetSavedAdminDBQueriesResponse } from '../../api';
import Theme from '../../theme/Theme';
import { RSText } from '../../base-components';
import { formatTimestamp } from '../../helpers/functions';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  hoverUnderline: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  pointer: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  underline: {
    textDecoration: 'underline',
  },
}));

type Props = {};

export const SavedQuery = (
  props: IGetSavedAdminDBQueriesResponse['savedQueries'][number] & {
    style?: React.CSSProperties;
    className?: string;
    onDelete?: (_id: string) => void;
    onSelect: (_id: string) => void;
  }
) => {
  const {
    _id,
    title,
    description,
    displayColor,
    createdAt,
    style,
    className,
    onDelete,
    onSelect,
  } = props;
  const styles = useStyles();

  const [hovering, setHovering] = useState(false);

  const handleDelete = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to delete this saved query? This action cannot be undone.'
      )
    ) {
      onDelete?.(_id);
    }
  }, [onDelete]);

  return (
    <div
      style={{
        ...style,
        width: '100%',
        background: Theme.foreground,
        borderRadius: 5,
      }}
      className={className}
    >
      <div
        style={{
          background: displayColor,
          alignItems: 'center',
          padding: 5,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={styles.pointer}
        onClick={() => onSelect(_id)}
      >
        <RSText
          bold
          className={hovering ? styles.underline : undefined}
          color={Theme.white}
        >
          {title}
        </RSText>
      </div>
      <div style={{ margin: 5, paddingBottom: 5 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <RSText italic size={11}>
            {formatTimestamp(createdAt, 'MMM D h:mm A')}
          </RSText>
          <RSText
            color={Theme.error}
            size={11}
            style={{ marginRight: 7 }}
            className={[styles.hoverUnderline, styles.pointer].join(' ')}
            onClick={handleDelete}
          >
            Delete
          </RSText>
        </div>
        <RSText style={{ marginTop: 5 }}>{description}</RSText>
      </div>
    </div>
  );
};
