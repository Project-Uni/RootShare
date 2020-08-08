import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FaCamera } from 'react-icons/fa';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import Paper, { PaperProps } from '@material-ui/core/Paper';

import Draggable from 'react-draggable';

import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import DefaultProfilePicture from '../images/defaultProfilePicture.png';
import { colors } from '../theme/Colors';

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
    color: colors.primaryText,
  },
}));

type Props = {
  className?: string;
  currentPicture?: any;
  editable?: boolean;
  height: number;
  width: number;
  borderRadius?: number;
};

function ProfilePicture(props: Props) {
  const styles = useStyles();

  const [hovering, setHovering] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>();

  const [crop, setCrop] = useState<{ [key: string]: any }>({
    aspect: 1,
    height: 500,
    top: 100,
    left: 100,
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
          Update Image
        </DialogTitle>
        <DialogContent>
          <div style={{ display: 'block' }}>
            <ReactCrop
              src={imageSrc!}
              crop={crop}
              onChange={(newCrop) => setCrop(newCrop)}
              circularCrop
              ruleOfThirds
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            className={styles.cancelButton}
            onClick={() => {
              setImageSrc(undefined);
            }}
          >
            Cancel
          </Button>
          <Button className={styles.saveButton}>Save</Button>
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
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
  );
}
