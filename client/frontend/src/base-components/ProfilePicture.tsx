import React, { useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FaCamera } from 'react-icons/fa';

import DefaultProfilePicture from '../images/defaultProfilePicture.png';
import RSText from './RSText';
import { colors } from '../theme/Colors';
import { refreshTokenReducer } from '../redux/reducers/tokenReducers';

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

  const [newImage, setNewImage] = useState<File>();

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

  //TEST CODE
  let testReader = new FileReader();
  testReader.onloadend = testReadFile;
  function testReadFile(event: any) {
    const content = testReader.result;
    console.log(content);
  }
  //END OF TEST CODE

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      setNewImage(event.target.files[0]);
      // testReader.readAsText(event.target.files[0]); //TEST CODE
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
  return <div className={styles.wrapper}>{renderImage()}</div>;
}

export default ProfilePicture;
