import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';

import RSText from '../../base-components/RSText';

import EventClientHeader from '../../event-client/EventClientHeader';
import { MainNavigator } from '../reusable-components';
import HomepageBody from './components/HomepageBody';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  discoverSidePanel: {
    width: 300,
    border: '1px solid green',
    height: '100vh',
  },
}));

type Props = {
  user: { [key: string]: any };
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function Homepage(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      {/* TODO?- Create Custom Header for Main Platform */}
      <EventClientHeader />
      <div className={styles.body}>
        <MainNavigator currentTab="home" />
        <HomepageBody />
        <div className={styles.discoverSidePanel}>
          <p>Discover</p>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Homepage);
