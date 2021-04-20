import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { RSText } from '../../base-components';
import { FiUserPlus } from 'react-icons/fi';
import Theme from '../../theme/Theme';
import { RSLink } from '../../main-platform/reusable-components';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    display: 'flex',
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 7,
    paddingBottom: 7,
  },
  name: {
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  name: string;
  _id: string;
};

export const JoinedMessage = (props: Props) => {
  const styles = useStyles();

  const { name, _id } = props;

  return (
    <div className={styles.wrapper}>
      <FiUserPlus
        size={20}
        color={Theme.secondaryText}
        style={{ marginRight: 10 }}
      />
      <RSText color={Theme.secondaryText}>
        <RSLink href={`/profile/${_id}`}>
          <b className={styles.name}>{name}</b>
        </RSLink>{' '}
        joined the event.
      </RSText>
    </div>
  );
};
