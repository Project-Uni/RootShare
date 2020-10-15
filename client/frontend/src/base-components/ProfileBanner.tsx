import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { FaCamera } from 'react-icons/fa';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';

import DefaultProfilePicture from '../images/defaultProfilePicture.png';
import { colors } from '../theme/Colors';
import {
  getCroppedImage,
  imageURLToFile,
} from './profileHelpers/profilePictureHelpers';
import { checkDesktop, log, makeRequest } from '../helpers/functions';
import RSText from './RSText';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  cameraContainer: {
    position: 'relative',
    height: 0,
    width: 0,
  },
  cameraIcon: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  paper: {
    background: colors.primaryText,
    borderRadius: 10,
    padding: 0,
  },
  dialogText: {
    color: 'black',
  },
  cancelButton: {
    color: colors.secondaryText,
  },
  saveButton: {
    background: colors.primary,
    color: colors.primaryText,
  },
  loadingIndicator: {
    color: colors.primaryText,
  },
  placeholder: {
    background: colors.bright,
  },
}));

type Props = {
  type: 'profile' | 'community';
  _id?: string; //Required for community
  className?: string; //Use this for margin and positioning
  pictureStyle?: string; //The only thing this should be used for is adding border
  currentPicture?: any;
  editable?: boolean;
  height: number;
  borderRadius?: number;
  borderWidth?: number; //Added for camera icon positioning on images with a border
  updateCurrentPicture?: (imageData: string) => any;
  zoomOnClick?: boolean;

  user: { [key: string]: any };
  updateUser: (userInfo: { [key: string]: any }) => void;
};

function ProfileBanner(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const [croppedImageURL, setCroppedImageURL] = useState<string>();
  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  const [uploadErr, setUploadErr] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [crop, setCrop] = useState<{ [key: string]: any }>({
    aspect: 16 / 6,
  });

  const fileUploader = useRef<HTMLInputElement>(null);
  const placeholder = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);

  const isDesktop = checkDesktop();

  function handleMouseOver() {
    setHovering(true);
  }

  function handleMouseLeave() {
    setHovering(false);
  }

  function handleSelfImageClick() {
    fileUploader.current?.click();
  }

  function handleOtherImageClick() {
    if (props.currentPicture) setIsViewerOpen(true);
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      if (event.target.files[0].size > 1440000) {
        setUploadErr('The image file is too big.');
        event.target.value = '';
        return;
      }
      setCrop({ aspect: 16 / 6 });
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setImageSrc(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
      event.target.value = '';
    }
    setHovering(false);
  }

  function handleImageLoaded(image: HTMLImageElement) {
    setImageRef(image);
  }

  function handleCropChange(newCrop: { [key: string]: any }) {
    setCrop(newCrop);
  }

  async function handleCropComplete(newCrop: { [key: string]: any }) {
    if (imageRef && newCrop.width && newCrop.height) {
      try {
        const imageURL = await getCroppedImage(
          imageRef,
          newCrop,
          'new-profile.jpeg',
          croppedImageURL || ''
        );

        setCroppedImageURL(imageURL);
      } catch (err) {
        log('error', err);
      }
    }
  }

  async function handleSaveImage() {
    imageURLToFile(croppedImageURL!, sendPictureToServer);
  }

  async function sendPictureToServer(imageData: string | ArrayBuffer | null | Blob) {
    setLoading(true);
    const path = props.type === 'profile' ? '/api/images/profile/banner' : ``;

    const { data } = await makeRequest('POST', path, {
      image: imageData,
    });
    setLoading(false);
    if (data['success'] !== 1) {
      setUploadErr(data.message);
      return;
    }
    setUploadErr('');
    setImageSrc(undefined);

    props.updateCurrentPicture && props.updateCurrentPicture(imageData as string);
  }

  function renderImage() {
    return (
      <div className={props.className}>
        {props.currentPicture ? (
          <img
            src={props.currentPicture || DefaultProfilePicture}
            alt="Profile Picture"
            className={[styles.image, props.pictureStyle].join(' ')}
            ref={picture}
            style={{
              height: props.height,
              width: '100%',
              objectFit: 'cover',
              borderTopRightRadius: props.borderRadius || 0,
              borderTopLeftRadius: props.borderRadius || 0,
            }}
            onMouseEnter={props.editable ? handleMouseOver : undefined}
            onMouseLeave={props.editable ? handleMouseLeave : undefined}
            onClick={
              props.editable
                ? handleSelfImageClick
                : props.zoomOnClick
                ? handleOtherImageClick
                : undefined
            }
          />
        ) : (
          <div
            className={[styles.image, styles.placeholder, props.pictureStyle].join(
              ' '
            )}
            style={{
              height: props.height,
              width: '100%',
              borderTopRightRadius: props.borderRadius || 0,
              borderTopLeftRadius: props.borderRadius || 0,
            }}
            ref={placeholder}
            onMouseEnter={props.editable ? handleMouseOver : undefined}
            onMouseLeave={props.editable ? handleMouseLeave : undefined}
            onClick={props.editable ? handleSelfImageClick : undefined}
          ></div>
        )}
        <div className={styles.cameraContainer}>
          {hovering && (
            <FaCamera
              color={`rgba(220,220,220,0.8)`}
              size={32}
              style={{
                position: 'absolute',
                bottom: Math.floor(props.height / 2) - 16 + (props.borderWidth || 0),
                left:
                  Math.floor(
                    ((props.currentPicture
                      ? picture.current?.width
                      : placeholder.current?.clientWidth) || window.innerWidth) / 2
                  ) -
                  16 +
                  (props.borderWidth || 0),
              }}
              className={styles.cameraIcon}
              onMouseEnter={props.editable ? handleMouseOver : undefined}
              onClick={
                props.editable
                  ? handleSelfImageClick
                  : props.zoomOnClick
                  ? handleOtherImageClick
                  : undefined
              }
            />
          )}
        </div>

        <input
          type="file"
          ref={fileUploader}
          style={{ display: 'none' }}
          accept="image/x-png, image/jpeg"
          onChange={handleImageUpload}
        />
        <ModalGateway>
          {isViewerOpen && (
            <Modal onClose={() => setIsViewerOpen(false)}>
              <Carousel views={[{ source: props.currentPicture }]} />
            </Modal>
          )}
        </ModalGateway>
      </div>
    );
  }

  function renderCrop() {
    return (
      <Dialog open={Boolean(imageSrc)} PaperComponent={PaperComponent}>
        <DialogTitle className={styles.dialogText} id="draggable-title">
          <RSText type="head" size={16} bold>
            Crop Image
          </RSText>
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              maxHeight: isDesktop ? 400 : window.innerWidth - 25,
              maxWidth: isDesktop ? 700 : window.innerWidth - 25,
            }}
          >
            <ReactCrop
              src={imageSrc!}
              crop={crop}
              onImageLoaded={handleImageLoaded}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
            />
            {loading && (
              <div style={{ position: 'relative', height: 0, width: 0 }}>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 200,
                    left: 200,
                  }}
                >
                  <CircularProgress size={100} className={styles.loadingIndicator} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          {uploadErr && (
            <RSText type="body" size={12} color="red" italic>
              {uploadErr}
            </RSText>
          )}
          <Button
            className={styles.cancelButton}
            disabled={loading}
            onClick={() => {
              setImageSrc(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            className={styles.saveButton}
            onClick={handleSaveImage}
            disabled={!Boolean(croppedImageURL) || loading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <div className={styles.wrapper}>
      {renderImage()}
      {renderCrop()}
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileBanner);

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return <Paper {...props} className={styles.paper} square={false} />;
}
