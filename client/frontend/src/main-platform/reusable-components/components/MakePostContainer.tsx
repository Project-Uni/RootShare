import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button, Box, IconButton } from '@material-ui/core';
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
  uploadedImage: {
    maxHeight: 400,
    maxWidth: '100%',
    objectFit: 'contain',
  },
  imagePreviewWrapper: {
    width: '100%',
    background: `linear-gradient(90deg, rgb(107, 107, 107), rgb(20, 20, 20), rgb(107, 107, 107));`,
    borderRadius: 8,
  },
}));

type Props = {
  profilePicture?: string;
  appendNewPost: (post: PostType) => any;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function MakePostContainer(props: Props) {
  const styles = useStyles();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    status: 0 | 1;
    message: string;
  }>();
  const [imageSrc, setImageSrc] = useState<string>();

  const fileUploader = useRef<HTMLInputElement>(null);

  async function handlePostClicked() {
    setLoading(true);
    setServerMessage(undefined);

    const { data } = await makeRequest('POST', '/api/posts/broadcast/user', {
      message,
      image: imageSrc,
    });

    setLoading(false);

    if (data.success === 1) {
      setMessage('');
      if (imageSrc) setImageSrc(undefined);
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
    setMessage(event.target.value);
  }

  function handleImageClicked() {
    fileUploader.current?.click();
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 1440000) {
        setServerMessage({ status: 0, message: 'The image file is too big.' });
        event.target.value = '';
        return;
      }
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setImageSrc(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
  }

  return (
    <Box boxShadow={2} borderRadius={8} className={styles.box}>
      {imageSrc && (
        <div className={styles.imagePreviewWrapper}>
          <IconButton
            style={{ display: 'float', float: 'right' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to remove this image?'))
                setImageSrc(undefined);
            }}
          >
            <RSText color={colors.primaryText} size={16} bold>
              X
            </RSText>
          </IconButton>
          <img src={imageSrc} className={styles.uploadedImage} />
        </div>
      )}
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
              value={message}
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
            <input
              type="file"
              ref={fileUploader}
              style={{ display: 'none' }}
              accept="image/x-png, image/jpeg"
              onChange={handleImageUpload}
            />
            <Button
              className={
                loading || message === '' ? styles.disabledButton : styles.button
              }
              onClick={handlePostClicked}
              disabled={loading || message === ''}
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

export default connect(mapStateToProps, mapDispatchToProps)(MakePostContainer);
