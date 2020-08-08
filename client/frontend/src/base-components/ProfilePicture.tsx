import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
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

import Draggable from 'react-draggable';

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { connect } from 'react-redux';

import DefaultProfilePicture from '../images/defaultProfilePicture.png';
import { colors } from '../theme/Colors';
import {
  getCroppedImage,
  imageURLToFile,
} from './profileHelpers/profilePictureHelpers';
import log from '../helpers/logger';
import { makeRequest } from '../helpers/makeRequest';
import RSText from './RSText';
import { relative } from 'path';

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
    background: colors.secondary,
  },
  dialogText: {
    color: colors.primaryText,
  },
  cancelButton: {
    color: colors.secondaryText,
  },
  saveButton: {
    background: colors.bright,
    color: colors.primaryText,
  },
  loadingIndicator: {
    color: colors.primaryText,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
  className?: string;
  currentPicture?: any;
  editable?: boolean;
  height: number;
  width: number;
  borderRadius?: number;
  updateCurrentPicture?: (imageData: string) => any;
};

function ProfilePicture(props: Props) {
  const styles = useStyles();

  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();
  const [croppedImageURL, setCroppedImageURL] = useState<string>();
  const [imageRef, setImageRef] = useState<HTMLImageElement>();
  const [uploadErr, setUploadErr] = useState('');

  const [crop, setCrop] = useState<{ [key: string]: any }>({
    aspect: 1,
    // height: 300,
    // top: 100,
    // left: 100,
  });

  const fileUploader = useRef<HTMLInputElement>(null);

  function handleMouseOver() {
    setHovering(true);
  }

  function handleMouseLeave() {
    setHovering(false);
  }

  function handleImageClick() {
    fileUploader.current?.click();
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const imageReader = new FileReader();

      imageReader.onloadend = (event: ProgressEvent) => {
        const resultBuffer = imageReader.result;
        setImageSrc(resultBuffer as string);
      };

      imageReader.readAsDataURL(event.target.files[0]);
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
    const { data } = await makeRequest(
      'POST',
      '/api/profile/updateProfilePicture',
      {
        image: imageData,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
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
        <img
          src={props.currentPicture || DefaultProfilePicture}
          alt="Profile Picture"
          className={styles.image}
          style={{
            height: props.height,
            width: props.width,
            borderRadius: props.borderRadius || 0,
          }}
          onMouseEnter={props.editable ? handleMouseOver : undefined}
          onMouseLeave={props.editable ? handleMouseLeave : undefined}
          onClick={handleImageClick}
        />
        <div className={styles.cameraContainer}>
          {hovering && (
            <FaCamera
              color={colors.secondaryText}
              size={32}
              style={{
                position: 'absolute',
                bottom: Math.floor(props.height / 2) - 16,
                left: Math.floor(props.width / 2) - 16,
              }}
              className={styles.cameraIcon}
              onMouseEnter={props.editable ? handleMouseOver : undefined}
              onClick={handleImageClick}
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
          <div style={{ height: 500, width: 500 }}>
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
                <div style={{ position: 'absolute', bottom: 200, left: 200 }}>
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
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePicture);

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
  );
}
