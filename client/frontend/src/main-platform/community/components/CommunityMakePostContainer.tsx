import React, { useState, useRef } from 'react';
import { makeStyles, withStyles, Theme } from '@material-ui/core/styles';
import { connect } from 'react-redux';

import {
  TextField,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';

import CastForEducationIcon from '@material-ui/icons/CastForEducation';
import { FaCamera } from 'react-icons/fa';
import { BsFillCaretDownFill } from 'react-icons/bs';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

import { makeRequest } from '../../../helpers/functions';
import ProfilePicture from '../../../base-components/ProfilePicture';

import { PostType, CommunityPostingOption } from '../../../helpers/types';

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
    '&:hover': {
      background: colors.brightHover,
    },
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
  broadcastIcon: {
    color: colors.primaryText,
    height: 20,
    width: 20,
    marginRight: 8,
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
  rest: {
    marginLeft: 1,
    marginRight: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 0,
    marginBottom: 1,
  },
}));

const CustomTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: colors.error,
    boxShadow: theme.shadows[1],
    fontSize: 12,
  },
}))(Tooltip);

type Props = {
  isAdmin?: boolean;
  communityID: string;
  communityName: string;
  communityProfilePicture?: string;
  postingOptions: CommunityPostingOption[];
  appendNewPost: (post: PostType, profilePicture: string | undefined) => any;
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
};

function CommunityMakePostContainer(props: Props) {
  const styles = useStyles();

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [followMenuAnchorEl, setFollowMenuAnchorEl] = useState(null);
  const [serverMessage, setServerMessage] = useState<{
    status: 0 | 1;
    message: string;
  }>();

  const [imageSrc, setImageSrc] = useState<string>();

  const fileUploader = useRef<HTMLInputElement>(null);

  async function handleBroadcastClicked() {
    setLoading(true);
    setServerMessage(undefined);
    setFollowMenuAnchorEl(null);

    const { data } = await makeRequest(
      'POST',
      `/api/posts/community/${props.communityID}/broadcast`,
      { message: content, image: imageSrc }
    );

    if (data.success === 1) {
      setContent('');
      setImageSrc(undefined);
      setServerMessage({ status: 1, message: 'Successfully created post.' });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 5000);
      props.appendNewPost(data.content['post'], props.communityProfilePicture);
    } else {
      setServerMessage({
        status: 0,
        message: 'There was an error creating your post.',
      });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 10000);
    }
    setLoading(false);
  }

  async function handlePostClicked(postingData: CommunityPostingOption) {
    setLoading(true);
    setServerMessage(undefined);
    setFollowMenuAnchorEl(null);
    const { communityID, routeSuffix, profilePicture } = postingData;
    const { data } = await makeRequest(
      'POST',
      `/api/posts/community/${props.communityID}/${routeSuffix}`,
      {
        fromCommunityID: communityID,
        message: content,
        image: imageSrc,
      }
    );

    setLoading(false);

    if (data.success === 1) {
      setContent('');
      setImageSrc('');
      setServerMessage({ status: 1, message: 'Successfully created post.' });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 5000);
      props.appendNewPost(data.content['post'], profilePicture);
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

  function renderButtons() {
    return (
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
        {props.isAdmin && (
          <Button
            className={
              loading || content === '' ? styles.disabledButton : styles.button
            }
            onClick={handleBroadcastClicked}
            disabled={loading || content === ''}
          >
            <CastForEducationIcon className={styles.broadcastIcon} />
            Broacast
          </Button>
        )}
        <Button
          className={
            loading || content === '' ? styles.disabledButton : styles.button
          }
          onClick={
            props.postingOptions.length === 1
              ? () => handlePostClicked(props.postingOptions[0])
              : (event: any) => {
                  setFollowMenuAnchorEl(event.currentTarget);
                }
          }
          disabled={loading || content === ''}
        >
          Post {props.postingOptions.length > 1 ? 'As' : ''}
          {props.postingOptions.length > 1 && (
            <>
              <span style={{ marginLeft: 8, marginRight: 8 }}>|</span>
              <span>
                <BsFillCaretDownFill size={12} color={colors.primaryText} />
              </span>
            </>
          )}
        </Button>
        <Menu
          open={Boolean(followMenuAnchorEl)}
          anchorEl={followMenuAnchorEl}
          onClose={() => setFollowMenuAnchorEl(null)}
        >
          {props.postingOptions.map((postingOption) => {
            return postingOption.communityID ? (
              <CustomTooltip
                title={`This post will be visible to all of ${props.communityName}'s followers`}
              >
                <MenuItem
                  onClick={() => handlePostClicked(postingOption)}
                  key={postingOption.routeSuffix}
                >
                  <RSText>{postingOption.description}</RSText>
                </MenuItem>
              </CustomTooltip>
            ) : (
              <MenuItem
                onClick={() => handlePostClicked(postingOption)}
                key={postingOption.routeSuffix}
              >
                <RSText>{postingOption.description}</RSText>
              </MenuItem>
            );
          })}
        </Menu>
      </div>
    );
  }

  return (
    <Box boxShadow={2} borderRadius={8} className={styles.box}>
      <div className={styles.messageAreaWrapper}>
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
        <div className={styles.rest}>
          <div className={styles.messageArea}>
            <ProfilePicture
              height={50}
              width={50}
              borderRadius={50}
              currentPicture={props.user.profilePicture}
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
            <div>{renderButtons()}</div>
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
