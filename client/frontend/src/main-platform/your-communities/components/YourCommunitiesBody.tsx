import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';

import { colors } from '../../../theme/Colors';
import { WelcomeMessage } from '../../reusable-components';
import CommunityOverview from './CommunityOverview';

import PurdueHypeBanner from '../../../images/PurdueHypeAlt.png';
import { makeRequest } from '../../../helpers/functions';

const HEADER_HEIGHT = 60;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    background: colors.fourth,
    overflow: 'scroll',
  },
  body: {},
  searchBar: {
    flex: 1,
    marginRight: 10,
  },
  searchBarContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginLeft: 20,
    marginRight: 20,
  },
  singleCommunity: {
    marginLeft: 1,
    marginRight: 1,
    marginBottom: 1,
    borderRadius: 1,
  },
}));

type Props = {
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function YourCommunitiesBody(props: Props) {
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
    const { data } = await makeRequest(
      'GET',
      `/api/user/${props.user._id}/communities/all`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
  }

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT);
  }

  function closeWelcomeMessage() {
    setShowWelcomeModal(false);
  }

  function renderCommunities() {
    const output = [];
    for (let i = 0; i < 5; i++)
      output.push(
        <CommunityOverview
          communityID="testCommID"
          name="RootShare"
          private
          style={styles.singleCommunity}
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque semper nisi sit amet ex tempor, non congue ex molestie. Sed et nulla mauris. In hac habitasse platea dictumst. Nullam ornare tellus bibendum enim volutpat fermentum. Nullam vulputate laoreet tristique. Nam a nibh eget tortor pulvinar placerat. Cras gravida scelerisque odio in vestibulum. Nunc id augue tortor. Aliquam faucibus facilisis tortor nec accumsan. Proin sed tincidunt purus. Praesent tempor nisl enim, et ornare arcu turpis."
          type="Business"
          memberCount={7054}
          mutualMemberCount={68}
          profilePicture={PurdueHypeBanner}
          joinedDate="April 29, 2020"
        />
      );
    return output;
  }

  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {showWelcomeModal && (
        <WelcomeMessage
          title="Communities"
          message="All of the communities that you belong to will be displayed on this page. We believe in the power of community and want to make it as easy to access as possible"
          onClose={closeWelcomeMessage}
        />
      )}
      <div className={styles.body}>{renderCommunities()}</div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(YourCommunitiesBody);
