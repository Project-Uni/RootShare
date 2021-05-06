import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, CircularProgress, IconButton } from '@material-ui/core';
import { RSTextField } from './RSTextField';
import { ImageUploadIcon } from '../../../images';
import { RSCard } from './RSCard';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import RSButton from './RSButton';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import { postSubmitPost, SubmitPostArgs } from '../../../api';
import { PostType } from '../../../helpers/types';
import { dispatchSnackbar } from '../../../redux/actions';
import { AiOutlineSend } from 'react-icons/ai';
import { GoBroadcast } from 'react-icons/go';

const useStyles = makeStyles((_: any) => ({
  imagePreviewWrapper: {
    width: '100%',
    background: `linear-gradient(90deg, rgb(107, 107, 107), rgb(20, 20, 20), rgb(107, 107, 107));`,
    borderRadius: 8,
    marginBottom: 15,
  },
  uploadedImage: {
    maxHeight: 300,
    maxWidth: '100%',
    objectFit: 'contain',
  },
  textField: {
    ['& fieldset']: {
      borderRadius: 15,
    },
  },
}));

type MakePostContainerMode =
  | {
      name: 'homepage';
    }
  | { name: 'profile' }
  | {
      name: 'community-external';
      communityID: string;
      externalPostingOptions?: any;
      admin?: boolean;
    }
  | {
      name: 'community-internal-student' | 'community-internal-alumni';
      communityID: string;
    };

type Props = {
  style?: React.CSSProperties;
  className?: string;
  mode: MakePostContainerMode;
  appendPost?: (post: PostType) => void;
  disabled?: boolean;
};

export const MakePostContainer = (props: Props) => {
  const { style, className, mode, appendPost, disabled } = props;

  const styles = useStyles();

  const user = useSelector((state: RootshareReduxState) => state.user);
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const [imageSrc, setImageSrc] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string>();
  const [helperText, setHelperText] = useState<string>('Hey Purdue...'); // TODO: change this to the actual school

  const fileUploader = useRef<HTMLInputElement>(null);

  useEffect(() => {
    updateHelperText();
  }, [props.mode]);

  function handleImageClicked() {
    fileUploader.current?.click();
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 2440000) {
        setServerErr('The image file is too big.');
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

  //Add in function args that choose how the post action is done
  async function handlePostClicked(params?: { communityBroadcast?: boolean }) {
    setLoading(true);
    setServerErr(undefined);

    if (!message.trim()) {
      setServerErr('Enter a valid message');
      setLoading(false);
      return;
    }

    let type: SubmitPostArgs['type'];
    let toCommunityID: string | undefined = undefined;
    if (mode.name === 'homepage' || mode.name === 'profile') type = 'broadcast-user';
    else {
      //TODO - Add in other community types
      toCommunityID = mode.communityID;

      if (params?.communityBroadcast) type = 'broadcast-community';
      else if (
        mode.name === 'community-internal-alumni' ||
        mode.name === 'community-internal-student'
      )
        type = mode.name;
      else type = 'community-external-user';
    }

    const data = await postSubmitPost({
      type,
      message,
      image: imageSrc,
      params: {
        toCommunityID,
      },
    });

    if (data.success === 1) {
      setMessage('');
      setImageSrc(undefined);
      const { post } = data.content;
      if (!post) {
        dispatch(
          dispatchSnackbar({
            mode: 'error',
            message: 'There was an error updating the posts',
          })
        );
        return;
      }
      const { user: postUser, ...rest } = post;
      const cleanedPost = {
        ...rest,
        user: {
          ...postUser,
          profilePicture: user.profilePicture,
        },
      };
      appendPost?.(cleanedPost);
      dispatch(dispatchSnackbar({ mode: 'success', message: 'Posted!' }));
    }
    setLoading(false);
  }

  const updateHelperText = () => {
    if (mode.name === 'community-internal-alumni') setHelperText('Hey Alumni...');
    else if (mode.name === 'community-internal-student')
      setHelperText('Hey Members...');
    else setHelperText('Hey Purdue...');
  };

  return (
    <RSCard className={className} style={{ ...style }} variant="secondary">
      <input
        type="file"
        ref={fileUploader}
        style={{ display: 'none' }}
        accept="image/x-png, image/jpeg"
        onChange={handleImageUpload}
      />
      {imageSrc ? (
        <div className={styles.imagePreviewWrapper}>
          <IconButton
            style={{ display: 'float', float: 'right' }}
            onClick={() => {
              if (window.confirm('Are you sure you want to remove this image?'))
                setImageSrc(undefined);
            }}
          >
            <RSText color={Theme.white} size={16} bold>
              X
            </RSText>
          </IconButton>
          <img src={imageSrc} className={styles.uploadedImage} />
        </div>
      ) : (
        <></>
      )}
      <div
        style={{
          display: 'flex',
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 25,
          paddingRight: 25,
        }}
      >
        <Avatar
          src={user.profilePicture}
          style={{ height: 70, width: 70, marginRight: 15 }}
        />
        <div style={{ flex: 1 }}>
          <RSTextField
            fullWidth
            variant="outlined"
            label={helperText}
            error={Boolean(serverErr)}
            helperText={serverErr}
            className={styles.textField}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 5,
              alignItems: 'center',
            }}
          >
            <div>
              <IconButton onClick={handleImageClicked} disabled={loading}>
                <img src={ImageUploadIcon} style={{ height: 20 }} />
              </IconButton>
            </div>
            <div>
              {(props.mode as any)['admin'] ? (
                <RSButton
                  style={{
                    marginRight: 15,
                    textTransform: 'none',
                    paddingTop: 3,
                    paddingBottom: 3,
                  }}
                  disabled={loading || disabled}
                  onClick={(e) => {
                    if (
                      window.confirm(
                        'This announcement will be visible university-wide. Confirm to continue'
                      )
                    )
                      handlePostClicked({ communityBroadcast: true });
                  }}
                >
                  {loading ? (
                    <CircularProgress size={25} style={{ color: Theme.altText }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <RSText color={Theme.altText} style={{ marginRight: 5 }}>
                        Announce
                      </RSText>
                      <GoBroadcast color={Theme.altText} size={16} />
                    </div>
                  )}
                </RSButton>
              ) : (
                <></>
              )}
              <RSButton
                style={{ textTransform: 'none', paddingTop: 3, paddingBottom: 3 }}
                disabled={loading || disabled}
                onClick={(e) => handlePostClicked()}
              >
                {loading ? (
                  <CircularProgress size={25} style={{ color: Theme.altText }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <RSText color={Theme.altText} style={{ marginRight: 5 }}>
                      Post
                    </RSText>
                    <AiOutlineSend color={Theme.altText} size={16} />
                  </div>
                )}
              </RSButton>
            </div>
          </div>
        </div>
      </div>
    </RSCard>
  );
};
