import React, { useCallback, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../../../../base-components';
import theme from '../../../../../theme/Theme';
import { BsPlusCircle } from 'react-icons/bs';
import { Button, CircularProgress } from '@material-ui/core';
import { colors } from '../../../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  imageUploadBox: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  stageTwoHead: {
    marginTop: 10,
  },
  primaryButton: {
    background: theme.bright,
    color: theme.altText,
    '&:hover': {
      background: colors.ternary,
    },
  },
  disabledButton: { background: theme.disabledButton },
  middleButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: 300,
  },
}));

type Props = {
  onUpload: () => any;
  setServerErr: (message: string) => void;
  loading?: boolean;
  imageSrc?: string;
  updateImageSrc: (data: string) => any;
};

//TODO - Add image cropping
function MeetTheGreeksBannerUpload(props: Props) {
  const styles = useStyles();
  const fileUploader = useRef<HTMLInputElement>(null);

  const { onUpload, setServerErr, loading, updateImageSrc, imageSrc } = props;

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        if (event.target.files[0].size > 1440000) {
          setServerErr('The image file is too big.');
          event.target.value = '';
          return;
        }
        setServerErr('');
        const imageReader = new FileReader();

        imageReader.onloadend = (event: ProgressEvent) => {
          const resultBuffer = imageReader.result;
          updateImageSrc(resultBuffer as string);
        };

        imageReader.readAsDataURL(event.target.files[0]);
        event.target.value = '';
      }
    },
    []
  );

  return (
    <div>
      <div style={{ marginLeft: 15, marginRight: 15 }}>
        <RSText type="head" bold size={14} className={styles.stageTwoHead}>
          Upload Event Banner
        </RSText>
        {imageSrc ? (
          <div
            className={styles.imageUploadBox}
            onClick={() => fileUploader.current?.click()}
          >
            <img
              src={imageSrc}
              style={{ width: '100%', marginTop: 10, marginBottom: 10 }}
            />
          </div>
        ) : (
          <div
            className={styles.imageUploadBox}
            style={{
              height: 300, //Define based on ratio
              width: '100%',
              border: `1px dashed ${theme.secondaryText}`,
              marginTop: 10,
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => fileUploader.current?.click()}
          >
            <BsPlusCircle size={40} color="lightgrey" />
          </div>
        )}
        <input
          type="file"
          ref={fileUploader}
          style={{ display: 'none' }}
          accept="image/x-png, image/jpeg"
          onChange={handleImageUpload}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
        <Button
          className={[
            styles.middleButton,
            loading ? styles.disabledButton : styles.primaryButton,
          ].join(' ')}
          disabled={loading || !imageSrc}
          onClick={onUpload}
        >
          {loading ? <CircularProgress size={30} /> : 'Finish'}
        </Button>
      </div>
    </div>
  );
}

export default MeetTheGreeksBannerUpload;
