import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Box } from '@material-ui/core';
import { FaCamera } from 'react-icons/fa';

import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { makeRequest } from '../../../helpers/functions';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { PostType } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  box: {
    margin: 8,
    background: colors.primaryText,
  },
  profilePictureContainer: {
    marginTop: 1,
  },
  profilePicture: {
    border: `1px solid ${colors.primary}`,
  },
  messageAreaWrapper: {
    borderRadius: 8,
    marginLeft: 1,
    marginRight: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 0,
    marginBottom: 1,
  },
  messageArea: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  newPostTextField: {
    width: '100%',
    background: colors.primaryText,
    borderRadius: 10,
    [`& fieldset`]: {
      borderRadius: 10,
    },
  },
  textFieldContainer: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    background: colors.bright,
    color: colors.primaryText,
    marginLeft: 10,
    marginRight: 1,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    background: 'lightgrey',
    color: colors.primaryText,
    marginLeft: 10,
    marginRight: 1,
  },
  serverMessage: {
    marginLeft: 60,
  },
}));

type Props = {
  profilePicture?: string;
  createPost: (content: string) => any;
  appendNewPost: (post: PostType) => any;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function CommunityMakePostContainer(props: Props) {
  const styles = useStyles();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    status: 0 | 1;
    message: string;
  }>();

  async function handlePostClicked() {
    setLoading(true);
    setServerMessage(undefined);

    const data = props.createPost(content);

    setLoading(false);

    if (data.success === 1) {
      setContent('');
      setServerMessage({ status: 1, message: 'Successfully created post.' });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 5000);
      props.appendNewPost(data.content['newPost']);
    } else {
      setServerMessage({
        status: 0,
        message: 'There was an error creating your post.',
      });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 10000);
    }
  }

  function handleMessageChange(event: any) {
    setContent(event.target.value);
  }

  function handleImageClicked() {
    console.log('Clicked image');
  }

  return (
    <Box boxShadow={2} borderRadius={8} className={styles.box}>
      <div className={styles.messageAreaWrapper}>
        <div className={styles.messageArea}>
          <ProfilePicture
            height={50}
            width={50}
            borderRadius={50}
            currentPicture={props.profilePicture}
            type="profile"
            className={styles.profilePictureContainer}
            pictureStyle={styles.profilePicture}
          />
          <div className={styles.textFieldContainer}>
            <TextField
              variant="outlined"
              placeholder={`What\'s on your mind ${props.user.firstName}?`}
              multiline
              className={styles.newPostTextField}
              value={content}
              onChange={handleMessageChange}
            />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          {serverMessage ? (
            <RSText
              className={styles.serverMessage}
              color={
                serverMessage.status === 1 ? colors.success : colors.brightError
              }
              italic
            >
              {serverMessage.message}
            </RSText>
          ) : (
            <span />
          )}
          <div>
            <Button
              className={loading ? styles.disabledButton : styles.button}
              onClick={handleImageClicked}
              disabled={loading}
            >
              <FaCamera size={12} color={colors.primaryText} />
              <span style={{ marginLeft: 10 }} />
              Image
            </Button>
            <Button
              className={
                loading || content === '' ? styles.disabledButton : styles.button
              }
              onClick={handlePostClicked}
              disabled={loading || content === ''}
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </Box>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunityMakePostContainer);
