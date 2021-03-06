import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, IconButton } from '@material-ui/core';
import { RSTextField } from './RSTextField';
import { ImageUploadIcon } from '../../../images';
import { RSCard } from './RSCard';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import RSButton from './RSButton';
import { RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';

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
}));

type Props = {
  style?: React.CSSProperties;
  className?: string;
  mode?: 'homepage' | 'profile' | 'community';
};

export const MakePostContainer = (props: Props) => {
  const { style, className } = props;

  const styles = useStyles();
  const user = useSelector((state: RootshareReduxState) => state.user);

  const [message, setMessage] = useState('');
  const [imageSrc, setImageSrc] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState<string>();

  const fileUploader = useRef<HTMLInputElement>(null);

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

  async function handlePostClicked() {
    setLoading(true);
    setServerErr(undefined);

    //TODO

    // const { data } = await makeRequest('POST', '/api/posts/broadcast/user', {
    //   message,
    //   image: imageSrc,
    // });

    // setLoading(false);

    // if (data.success === 1) {
    //   setMessage('');
    //   if (imageSrc) setImageSrc(undefined);
    //   setServerMessage({ status: 1, message: 'Successfully created post.' });
    //   setTimeout(() => {
    //     setServerMessage(undefined);
    //   }, 5000);
    //   props.appendNewPost(data.content['newPost']);
    // } else {
    //   setServerMessage({
    //     status: 0,
    //     message: 'There was an error creating your post.',
    //   });
    //   setTimeout(() => {
    //     setServerMessage(undefined);
    //   }, 10000);
    // }
  }

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
          paddingTop: 15,
          paddingBottom: 15,
          paddingLeft: 20,
          paddingRight: 20,
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
            label="Hey Purdue..."
            error={Boolean(serverErr)}
            helperText={serverErr}
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
            <RSButton
              style={{ textTransform: 'none', height: '100%' }}
              disabled={loading}
              onClick={handlePostClicked}
            >
              Post
            </RSButton>
          </div>
        </div>
      </div>
    </RSCard>
  );
};
