import React, { useState, useEffect, useRef } from 'react';
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

import { useDispatch } from 'react-redux';
import { updateProfilePicture } from '../redux/actions/user';

import DefaultProfilePicture from '../images/defaultProfilePicture.png';
import {
  getCroppedImage,
  imageURLToFile,
} from './profileHelpers/profilePictureHelpers';
import { log, makeRequest } from '../helpers/functions';
import RSText from './RSText';
import Theme from '../theme/Theme';

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
    background: Theme.white,
  },
  dialogText: {
    color: Theme.dark,
  },
  cancelButton: {
    color: Theme.secondaryText,
  },
  saveButton: {
    background: Theme.bright,
    color: Theme.white,
  },
  loadingIndicator: {
    color: Theme.bright,
  },
  disabledButton: {
    background: Theme.disabledButton,
    color: Theme.white,
    marginLeft: 10,
    marginRight: 1,
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
  width: number;
  borderRadius?: number;
  borderWidth?: number; //Added for camera icon positioning on images with a border
  zoomOnClick?: boolean;
  preview?: boolean; //preview enables use of external callback
  callback?: (data: string) => any;
};

function ProfilePicture(props: Props) {
  const styles = useStyles();

  const dispatch = useDispatch();

  const {
    type,
    _id,
    className,
    pictureStyle,
    editable,
    height,
    width,
    borderRadius,
    borderWidth,
    zoomOnClick,
  } = props;

  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const [croppedImageURL, setCroppedImageURL] = useState<string>();
  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  const [uploadErr, setUploadErr] = useState('');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPicture, setCurrentPicture] = useState(props.currentPicture);

  const [crop, setCrop] = useState<{ [key: string]: any }>({
    aspect: 1,
    // height: 300,
    // top: 100,
    // left: 100,
  });

  const fileUploader = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentPicture(props.currentPicture);
  }, [props.currentPicture]);

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
    if (currentPicture) setIsViewerOpen(true);
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
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
    if (props.preview === true) {
      imageURLToFile(croppedImageURL!, previewPicture);
    }
    else {
      imageURLToFile(croppedImageURL!, sendPictureToServer);
    }
  }

  async function previewPicture(imageData: string | ArrayBuffer | null | Blob) {
    props.callback!(imageData as string);
    setImageSrc(undefined);
    setCurrentPicture(imageData as string);
  }

  async function sendPictureToServer(imageData: string | ArrayBuffer | null | Blob) {
    setLoading(true);
    const path =
      type === 'profile'
        ? '/api/images/profile/updateProfilePicture'
        : `/api/images/community/${_id}/updateProfilePicture`;

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
    if (type === 'profile') dispatch(updateProfilePicture(imageData as string));

    setCurrentPicture(imageData as string);
  }

  function renderImage() {
    let currPictureSource: string = currentPicture;
    if (
      !currPictureSource ||
      currPictureSource.length < 4 ||
      (currPictureSource.substring(0, 4) !== 'http' &&
        currPictureSource.substring(0, 4) !== 'data')
    )
      currPictureSource = DefaultProfilePicture;

    return (
      <div className={className}>
        <img
          src={currPictureSource}
          alt="Profile Picture"
          className={[
            editable || currentPicture ? styles.image : undefined,
            pictureStyle,
          ].join(' ')}
          style={{
            height: height,
            width: width,
            borderRadius: borderRadius || 0,
          }}
          onMouseEnter={editable ? handleMouseOver : undefined}
          onMouseLeave={editable ? handleMouseLeave : undefined}
          onClick={
            editable
              ? handleSelfImageClick
              : zoomOnClick
              ? handleOtherImageClick
              : undefined
          }
        />
        <div className={styles.cameraContainer}>
          {hovering && (
            <FaCamera
              color={Theme.primaryText}
              size={32}
              style={{
                position: 'absolute',
                bottom: Math.floor(height / 2) - 16 + (borderWidth || 0),
                left: Math.floor(width / 2) - 16 + (borderWidth || 0),
              }}
              className={styles.cameraIcon}
              onMouseEnter={editable ? handleMouseOver : undefined}
              onClick={
                editable
                  ? handleSelfImageClick
                  : zoomOnClick
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
              <Carousel views={[{ source: currentPicture }]} />
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
          <div style={{ maxHeight: 500, maxWidth: 500 }}>
            <ReactCrop
              src={imageSrc!}
              crop={crop}
              onImageLoaded={handleImageLoaded}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              circularCrop
              // ruleOfThirds
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
            className={
              Boolean(croppedImageURL) ? styles.saveButton : styles.disabledButton
            }
            onClick={handleSaveImage}
            disabled={!Boolean(croppedImageURL) || loading}
          >
            {props.preview == true ? "Select" : "Save"}
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

export default ProfilePicture;

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return <Paper {...props} className={styles.paper} square={false} />;
}
