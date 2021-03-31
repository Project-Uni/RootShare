import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { CircularProgress, Grid } from '@material-ui/core';
import Carousel, { Modal, ModalGateway } from 'react-images';

import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { RSCard, RSTabsV2 } from '../../reusable-components';

import { getCommunityMedia } from '../../../api';
import { ImageType } from '../../../helpers/types';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  cardWrapper: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 30,
    marginBottom: 30,
    textAlign: 'left',
  },
  tabs: {
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
    width: '100%',
  },
  imageContainer: {
    padding: 15,
  },
  image: {
    objectFit: 'cover',
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
  const [imageWidth, setImageWidth] = useState(0);
  const [imageViewerIndex, setImageViewerIndex] = useState(-1);

  const [currentTab, setCurrentTab] = useState('photos');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchMedia().then(() => {
      setLoading(false);
      handleResize();
    });
  }, []);

  const handleResize = () => {
    setImageWidth(document.getElementById('image')?.offsetWidth || 0);
  };

  const getColSize = () => {
    return window.innerWidth < 700 ? 6 : 4;
  };

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
        <RSCard className={styles.cardWrapper}>
          <RSTabsV2
            tabs={[
              { label: 'Photos', value: 'photos' },
              { label: 'Links', value: 'links' },
              { label: 'Files', value: 'files' },
            ]}
            size={18}
            variant="underlined"
            onChange={(newTab) => setCurrentTab(newTab)}
            selected={currentTab}
            className={styles.tabs}
          />

          <Grid container>
            {images?.map((image, i) => (
              <Grid
                item
                xs={getColSize()}
                justify="center"
                alignContent="center"
                alignItems="center"
                className={styles.imageContainer}
              >
                <img
                  src={image.fileName}
                  id="image"
                  style={{
                    width: '100%',
                    height: imageWidth,
                  }}
                  className={styles.image}
                  onClick={() => setImageViewerIndex(i)}
                />
              </Grid>
            ))}
          </Grid>
        </RSCard>
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
