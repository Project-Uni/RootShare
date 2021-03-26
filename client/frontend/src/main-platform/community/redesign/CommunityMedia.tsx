import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CircularProgress } from '@material-ui/core';
import Carousel, { Modal, ModalGateway } from 'react-images';

import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { getCommunityMedia } from '../../../api';
import { ImageType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const IMAGE_SIZE = 150;

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

type Props = {
  communityID: string;
  admin: string;
};

export const CommunityMedia = (props: Props) => {
  const styles = useStyles();
  const { communityID, admin } = props;

  const dispatch = useDispatch();
  const user = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageType[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(-1);

  useEffect(() => {
    fetchMedia().then(() => setLoading(false));
  }, []);

  const fetchMedia = async () => {
    const data = await getCommunityMedia({ communityID });
    if (data.success === 1) {
      setImages(data.content.images);
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error retrieving posts',
        })
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <CircularProgress size={90} style={{ color: Theme.bright, marginTop: 50 }} />
      ) : (
        images?.map((image, i) => (
          <img
            src={image.fileName}
            style={{ height: IMAGE_SIZE, width: IMAGE_SIZE, objectFit: 'cover' }}
            className={styles.image}
            onClick={() => setImageViewerIndex(i)}
          />
        ))
      )}
      <ModalGateway>
        {imageViewerIndex >= 0 && (
          <Modal onClose={() => setImageViewerIndex(-1)}>
            <Carousel
              views={images?.map((image) => ({ source: image.fileName })) || []}
              currentIndex={imageViewerIndex}
            />
          </Modal>
        )}
      </ModalGateway>
    </div>
  );
};
