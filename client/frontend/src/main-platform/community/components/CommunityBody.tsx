import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { FaLock } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityGeneralInfo from './CommunityGeneralInfo';

import BabyBoilersBanner from '../../../images/PurdueHypeAlt.png';
import RSText from '../../../base-components/RSText';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
  },
  body: {},
  coverPhoto: {
    background: colors.bright,
    height: 200,
    objectFit: 'cover',
  },
  profilePicture: {
    height: 175,
    width: 175,
    borderRadius: 100,
    marginTop: -88,
    border: `8px solid ${colors.primaryText}`,
    marginLeft: 50,
    objectFit: 'cover',
  },
}));

type Props = {
  status: 'JOINED' | 'PENDING' | 'OPEN';
  name: string;
  description: string;
  numMembers: number;
  numMutual: number;
  type:
    | 'Social'
    | 'Business'
    | 'Just for Fun'
    | 'Athletics'
    | 'Student Organization'
    | 'Academic';
  private?: boolean;
};

function CommunityBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const locked =
    props.status === 'PENDING' || (props.status === 'OPEN' && props.private);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    console.log('Fetching data');
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function renderProfileAndBackground() {
    return (
      <div style={{ textAlign: 'left' }}>
        <div className={styles.coverPhoto}></div>
        <img src={BabyBoilersBanner} className={styles.profilePicture} />
      </div>
    );
  }

  function renderTabs() {
    return <div></div>;
  }

  function renderLocked() {
    return (
      <div style={{ marginTop: 70 }}>
        <FaLock size={90} color={colors.secondaryText} />
        <RSText type="subhead" size={20} color={colors.primary}>
          You must be a member to view this content.
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {/* {showWelcomeModal && (
        <WelcomeMessage
          title="Community"
          message="This is a community. You can talk with other people who are also involved in this community."
          onClose={closeWelcomeMessage}
        />
      )} */}
      <div className={styles.body}>
        {renderProfileAndBackground()}
        <CommunityGeneralInfo
          status={props.status}
          name={props.name}
          numMembers={props.numMembers}
          numMutual={props.numMutual}
          type={props.type}
          private={props.private}
          description={props.description}
        />
        {locked ? renderLocked() : renderTabs()}
      </div>
    </div>
  );
}

export default CommunityBody;
