import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress } from '@material-ui/core';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import RSText from '../../../base-components/RSText';

import { WelcomeMessage, UserPost } from '../../reusable-components';
import MakePostContainer from './MakePostContainer';

import { JacksonHeadshot } from '../../../images/team';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.fourth,
    overflow: 'scroll',
    minWidth: 600,
  },
  loadingIndicator: {
    color: colors.primary,
    marginTop: 1,
  },
  posts: {
    marginLeft: 1,
    marginRight: 1,
  },
  singlePost: {
    marginTop: 1,
    borderRadius: 1,
  },
}));

type Props = {
  user: { [key: string]: any };
};

function HomepageBody(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(window.innerHeight - HEADER_HEIGHT);
  //TODO - Use default state false for this once connected to server, and set to true if its their first visit
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [feed, setFeed] = useState<{ [key: string]: any }[]>([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  async function fetchData() {
    setTimeout(() => {
      console.log('Fetching data');
      return true;
    }, 1000);
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function handleDiscoverClick() {
    window.location.href = `${window.location.protocol}//${window.location.host}/discover`;
  }

  function appendNewPost(post: { [key: string]: any }) {
    setFeed((prevState) => prevState.concat(post));
  }

  function renderFeed() {
    const output = [];
    for (let i = 0; i < feed.length; i++) {
      output.push(
        <UserPost
          userID={props.user._id}
          userName={`${props.user.firstName} ${props.user.lastName}`}
          timestamp={feed[i].createdAt}
          profilePicture={JacksonHeadshot}
          message={feed[i].message}
          likeCount={feed[i].likes.length}
          commentCount={0}
        />
      );
    }
    // for (let i = 0; i < 6; i++)
    //   output.push(
    //     <UserPost
    //       userID={'testID'}
    //       userName="Jackson McCluskey"
    //       profilePicture={JacksonHeadshot}
    //       community="Computer Science Nerds Club"
    //       communityID={'testCommID'}
    //       timestamp="July 14th, 2020 6:52 PM"
    //       message="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
    //       likeCount={109}
    //       commentCount={54}
    //       style={styles.singlePost}
    //     />
    //   );
    return <div className={styles.posts}>{output}</div>;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Welcome to RootShare!"
          message="Every success story is rooted in the support from a community. Join your
        communities or discover new ones today."
          onClose={closeWelcomeMessage}
          buttonText="Discover"
          buttonAction={handleDiscoverClick}
        />
      )}
      <MakePostContainer appendNewPost={appendNewPost} />
      {loading ? (
        <CircularProgress size={100} className={styles.loadingIndicator} />
      ) : (
        renderFeed()
      )}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomepageBody);
