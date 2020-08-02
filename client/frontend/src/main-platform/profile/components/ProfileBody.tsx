import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { colors } from '../../../theme/Colors';
import ProfileHead from './ProfileHead';
import ProfileEvent from './ProfileEvent';
import { WelcomeMessage, UserPost } from '../../reusable-components';
import { DhruvHeadshot } from '../../../images/team';
import RSText from '../../../base-components/RSText';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.primaryText,
    overflow: 'scroll',
    borderLeft: `1px solid ${colors.fourth}`,
    borderRight: `1px solid ${colors.fourth}`,
  },
  body: {},
  coverPhoto: {
    background: colors.bright,
    height: 200,
  },
  profilePicture: {
    height: 175,
    width: 175,
    borderRadius: 100,
    marginTop: -88,
    border: `8px solid ${colors.primaryText}`,
    marginLeft: 50,
  },
  event: {
    marginTop: 0,
    marginLeft: 39,
    marginRight: 0,
    borderTop: `1px solid ${colors.fourth}`,
  },
  post: {
    // marginTop: 1,
    borderBottom: `1px solid ${colors.fourth}`,
  },
  rootshares: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    background: colors.primaryText,
    borderBottom: `1px solid ${colors.fourth}`,
    borderTop: `1px solid ${colors.fourth}`,
  },
}));

type Props = {
  profileID: string;
};

function ProfileBody(props: Props) {
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

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
        <img src={DhruvHeadshot} className={styles.profilePicture} />
      </div>
    );
  }

  function renderRegisteredEvents() {
    const output = [];
    for (let i = 0; i < 4; i++)
      output.push(
        <ProfileEvent
          title="The Baby Boilers Are Back"
          date="Aug 14, 2020"
          participationType="SPEAKER"
          style={styles.event}
        />
      );
    return (
      <div style={{ marginLeft: 0, marginRight: 0, marginTop: 20 }}>{output}</div>
    );
  }

  function renderPosts() {
    const output = [];
    for (let i = 0; i < 7; i++) {
      output.push(
        <UserPost
          userID={'testID'}
          userName="Dhruv Patel"
          profilePicture={DhruvHeadshot}
          timestamp="July 14th, 2020 6:52 PM"
          message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          likeCount={109}
          commentCount={54}
          style={styles.post}
        />
      );
    }
    return (
      <div
        style={{
          paddingLeft: 1,
          paddingRight: 1,
          background: colors.fourth,
        }}
      >
        {output}
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {/* {showWelcomeModal && (
        <WelcomeMessage
          title="Profile"
          message="See detailed information about each user, what organizations they have joined, and what virtual events they will attend."
          onClose={closeWelcomeMessage}
        />
      )} */}
      <div className={styles.body}>
        {renderProfileAndBackground()}
        <ProfileHead
          name="Dhruv Patel"
          userID="testID"
          university="Purdue University"
          graduationYear={2020}
          position="Chief Operating Officer"
          company="RootShare"
          bio="Hello! My name is Dhruv Patel and I am a big fan of Roots! I love roots so
          much that I started a company where we can all share our roots. I hope you
          guys enjoy my profile! Big Root guy here."
          numConnections={804}
          numMutualConnections={78}
          numCommunities={6}
        />
        {renderRegisteredEvents()}
        <RSText
          type="head"
          size={24}
          bold
          color={colors.second}
          className={styles.rootshares}
        >
          Dhruv's RootShares
        </RSText>
        {renderPosts()}
      </div>
    </div>
  );
}

export default ProfileBody;
