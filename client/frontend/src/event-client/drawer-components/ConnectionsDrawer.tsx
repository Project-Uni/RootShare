import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import SingleConnection from './SingleConnection';
import SinglePendingConnection from './SinglePendingConnection';
import MyConnections from '../images/MyConnections.png';

import { colors } from '../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    height: window.innerHeight - 60,
  },
  textFieldContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    background: colors.primary,
    borderTop: '2px solid ' + colors.primaryText,
    color: colors.primaryText,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
  },
  connectionContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    background: colors.secondary,
    overflow: 'scroll',
    label: colors.primaryText,
  },
}));

type Props = {};

function ConnectionsDrawer(props: Props) {
  const styles = useStyles();
  const [message, setMessage] = useState('');

  function testRenderConnections() {
    const output = [];
    for (let i = 0; i < 1; i++) {
      output.push(
        <div>
          <SinglePendingConnection
            name="Ashwin Mahesh"
            nameId="1002"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SinglePendingConnection
            name="Dhruv Patel"
            nameId="1003"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SinglePendingConnection
            name="Lauren Odle"
            nameId="1004"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SinglePendingConnection
            name="Chris Hartley"
            nameId="1004"
            organization="RootShare"
            picture="jeffsprofile.png"
          />
        </div>
      );
    }
    for (let i = 0; i <= 10; i++) {
      output.push(
        <div>
          <SingleConnection
            name="Jackson McCluskey"
            nameId="2001"
            organization="RootShare"
            picture="jacksonsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SingleConnection
            name="Smit Desai"
            nameId="2002"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SingleConnection
            name="Caite Capezzuto"
            nameId="2003"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      );
      output.push(
        <div>
          <SingleConnection
            name="Caite Capezzuto"
            nameId="2004"
            organization="RootShare"
            picture="elonsprofile.png"
          />
        </div>
      );
    }
    return output;
  }
  return (
    <div className={styles.wrapper}>
      <div className={styles.connectionContainer}>{testRenderConnections()}</div>
    </div>
  );
}

export default ConnectionsDrawer;
