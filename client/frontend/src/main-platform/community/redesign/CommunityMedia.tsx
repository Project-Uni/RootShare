import React, { useEffect, useState, createElement } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { CircularProgress, Grid, TextField } from '@material-ui/core';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { AiOutlineLink } from 'react-icons/ai';
import { SocialIcon } from 'react-social-icons';

import { useDispatch, useSelector } from 'react-redux';
import { dispatchSnackbar } from '../../../redux/actions';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import {
  RSCard,
  RSTabsV2,
  RSLink,
  RSAvatar,
  RSTextField,
} from '../../reusable-components';
import { RSText } from '../../../base-components';

import { getCommunityMedia, postUploadLinks } from '../../../api';
import { ImageType, Link, WebsiteDict } from '../../../helpers/types';
import { capitalizeFirstLetter } from '../../../helpers/functions';
import { ENTER_KEYCODE } from '../../../helpers/constants';
import Theme from '../../../theme/Theme';
import { RootShareIconPaleYellow, SocialMediaIcon } from '../../../images';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  cardWrapper: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 30,
    paddingBottom: 30,
    marginTop: 20,
    marginBottom: 20,
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
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 18,
  },
  editButton: { padding: 10 },
  editingButtonsWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  linkContainer: {
    display: 'flex',
    padding: 3,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  removeButton: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  link: {
    display: 'flex',
    color: 'inherit',
    margin: 5,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

type Props = {
  communityID: string;
  admin: string;
  editable?: boolean;
};

export const CommunityMedia = (props: Props) => {
  const styles = useStyles();
  const { communityID, admin, editable } = props;

  const dispatch = useDispatch();
  const user = useSelector((state: RootshareReduxState) => state.user);

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<ImageType[]>([]);
  // const [videos, setVideos] = useState<VideoType[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [editLinks, setEditLinks] = useState<Link[]>([]);
  const [addLinks, setAddLinks] = useState<Link[]>([]);
  const [removeLinks, setRemoveLinks] = useState<string[]>([]);
  const [currEditLink, setCurrEditLink] = useState('');
  const [mediaWidth, setMediaWidth] = useState(0);
  const [editing, setEditing] = useState(false);

  const [fetchErr, setFetchErr] = useState(false);

  // const [currentTab, setCurrentTab] = useState('photos');

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchMedia().then(() => {
      setLoading(false);
      handleResize();
    });
  }, []);

  const handleResize = () => {
    setMediaWidth(document.getElementById('media')?.offsetWidth || 0);
  };

  const fetchMedia = async () => {
    const data = await getCommunityMedia({ communityID });
    if (data.success === 1) {
      setImages(data.content.images);
      setLinks(data.content.links);
      setEditLinks(data.content.links);
    } else setFetchErr(true);
  };

  const saveLinks = async () => {
    setLinks(editLinks);
    setEditing(false);

    const data = await postUploadLinks(
      communityID,
      'community',
      addLinks,
      removeLinks
    );
    if (data.success === 1) {
      setAddLinks([]);
      setRemoveLinks([]);
    } else {
      dispatch(
        dispatchSnackbar({
          message: 'There was an error saving the external links',
          mode: 'error',
        })
      );
      startEditing();
    }
  };

  const cancelEditing = () => {
    setAddLinks([]);
    setRemoveLinks([]);
    setEditLinks(links);
    setCurrEditLink('');
    setEditing(false);
  };

  const startEditing = () => {
    setAddLinks([]);
    setRemoveLinks([]);
    setEditLinks(links);
    setCurrEditLink('');
    setEditing(true);
  };

  const removeLink = (link: Link) => {
    setEditLinks((prevEditLinks) => {
      let newEditLinks = prevEditLinks.slice();
      for (let i = 0; i < newEditLinks.length; i++) {
        if (newEditLinks[i].url === link.url) {
          newEditLinks.splice(i, 1);
          return newEditLinks;
        }
      }
      return prevEditLinks;
    });
    setAddLinks((prevAddLinks) => {
      let newAddLinks = prevAddLinks.slice();
      for (let i = 0; i < newAddLinks.length; i++) {
        if (newAddLinks[i].url === link.url) {
          newAddLinks.splice(i, 1);
          return newAddLinks;
        }
      }
      return prevAddLinks;
    });
    setRemoveLinks((prevRemoveLinks) => {
      if (link._id) return prevRemoveLinks.concat(link._id);
      return prevRemoveLinks;
    });
  };

  const addLink = () => {
    const newLink = {
      linkType: getLinkTypes(currEditLink),
      url: formatURL(currEditLink),
    };
    setEditLinks((prevEditLinks) => prevEditLinks.concat(newLink));
    setAddLinks((prevAddLinks) => prevAddLinks.concat(newLink));
    setCurrEditLink('');
  };

  const getLinkTypes = (url: string) => {
    for (let i = 0; i < WebsiteDict.length; i++)
      if (url.includes(WebsiteDict[i].url)) return WebsiteDict[i].name;
    return 'Other';
  };

  const formatURL = (url: string) => {
    return url.includes('http') ? url : `https://${url}`;
  };

  const getDomainName = (link: Link) => {
    if (link.linkType !== 'Other') return link.linkType;

    const split1 = link.url.split('.');
    if (split1.length < 2) return link.url;
    const split2 = split1[split1.length - 2].split('/');
    return capitalizeFirstLetter(split2[split2.length - 1]); // Split will be at least length 1
  };

  function renderEditButtons() {
    return editing ? (
      <div className={styles.editingButtonsWrapper}>
        <RSLink
          className={styles.editButton}
          underline="hover"
          onClick={cancelEditing}
        >
          <RSText size={11} weight="light" color={Theme.error}>
            Cancel
          </RSText>
        </RSLink>
        <RSLink className={styles.editButton} underline="hover" onClick={saveLinks}>
          <RSText size={11} weight="light">
            Save
          </RSText>
        </RSLink>
      </div>
    ) : (
      <RSLink
        className={styles.editButton}
        underline="hover"
        onClick={() => setEditing(true)}
      >
        <RSText size={11} weight="light">
          Edit
        </RSText>
      </RSLink>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loading ? (
        <CircularProgress size={90} style={{ color: Theme.bright, marginTop: 50 }} />
      ) : fetchErr ? (
        <RSText size={32} type="head" color={Theme.error}>
          THERE WAS AN ERROR GETTING THE COMMUNITY
        </RSText>
      ) : (
        <div>
          <RSCard className={styles.cardWrapper}>
            <div className={styles.cardHeader}>
              <RSText weight="light" size={18}>
                External Links
              </RSText>
              {editable && renderEditButtons()}
            </div>
            {editing ? (
              <div>
                {editLinks.map((link) => {
                  return (
                    <div className={styles.linkContainer}>
                      <a target="_blank" href={link.url} className={styles.link}>
                        <RSText>{link.url}</RSText>
                      </a>
                      <div style={{ flex: 1 }} />
                      <DeleteOutlineIcon
                        className={styles.removeButton}
                        onClick={() => removeLink(link)}
                      />
                    </div>
                  );
                })}
                <RSTextField
                  label="URL"
                  fullWidth
                  style={{ marginTop: 10 }}
                  value={currEditLink}
                  placeholder="https://rootshare.io/profile/user"
                  onKeyDown={(e) => e.keyCode === ENTER_KEYCODE && addLink()}
                  onChange={(e: any) => setCurrEditLink(e.target.value)}
                  // error={formErrors.major !== ''}
                  // helperText={formErrors.major}
                  fontSize={16}
                />
              </div>
            ) : links.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <RSAvatar
                  style={{ padding: 5 }}
                  src={SocialMediaIcon}
                  variant="square"
                  size={120}
                />
                <RSText color={Theme.secondaryText} weight="light">
                  No links uploaded yet
                </RSText>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', paddingBottom: 10 }}>
                  {links.map((link) => {
                    if (link.linkType === 'RootShare')
                      return (
                        <a target="_blank" href={link.url} className={styles.link}>
                          <RSAvatar
                            src={RootShareIconPaleYellow}
                            variant="rounded"
                            size={50}
                          />
                        </a>
                      );
                    else if (
                      link.linkType === 'Instagram' ||
                      link.linkType === 'Twitter' ||
                      link.linkType === 'Facebook' ||
                      link.linkType === 'LinkedIn'
                    )
                      return (
                        <a target="_blank" href={link.url} className={styles.link}>
                          <SocialIcon network={link.linkType.toLowerCase()} />
                        </a>
                      );
                  })}
                </div>
                <div>
                  {links.map((link) => {
                    if (
                      link.linkType !== 'RootShare' &&
                      link.linkType !== 'Instagram' &&
                      link.linkType !== 'Twitter' &&
                      link.linkType !== 'Facebook' &&
                      link.linkType !== 'LinkedIn'
                    )
                      return (
                        <div style={{ display: 'flex' }}>
                          <a target="_blank" href={link.url} className={styles.link}>
                            <AiOutlineLink
                              style={{ paddingTop: 2, paddingRight: 5 }}
                            />
                            <RSText weight="bold">{getDomainName(link)}</RSText>
                          </a>
                          <div style={{ flex: 1 }} />
                        </div>
                      );
                  })}
                </div>
              </div>
            )}
          </RSCard>
          <RSCard className={styles.cardWrapper}>
            <RSText weight="light" size={18}>
              Photos
            </RSText>

            {/* <RSTabsV2 // Use this when we add videos tab
            tabs={[{ label: 'Photos', value: 'photos' }]},
            tabs={[{ label: 'Videos', value: 'videos' }]}
            size={18}
            onChange={(newTab) => setCurrentTab(newTab)}
            selected={currentTab}
            className={styles.tabs}
          /> */}
            <MediaGrid media={images} width={mediaWidth} />
          </RSCard>
        </div>
      )}
    </div>
  );
};

const MediaGrid = (props: {
  media: ImageType[] /*| VideoType[] */;
  width: number;
}) => {
  const styles = useStyles();
  const { media, width } = props;

  const [viewerIndex, setViewerIndex] = useState(-1);

  const getColSize = () => {
    return window.innerWidth < 700 ? 6 : 4;
  };

  return (
    <Grid container>
      {media?.map((media, i) => (
        <Grid
          item
          xs={getColSize()}
          justify="center"
          alignContent="center"
          alignItems="center"
          className={styles.imageContainer}
        >
          <img
            src={media.url}
            id="media"
            style={{
              width: '100%',
              height: width,
            }}
            className={styles.image}
            onClick={() => setViewerIndex(i)}
          />
        </Grid>
      ))}
      <ModalGateway>
        {viewerIndex >= 0 && (
          <Modal onClose={() => setViewerIndex(-1)}>
            <Carousel
              views={media?.map((media) => ({ source: media.url })) || []}
              currentIndex={viewerIndex}
            />
          </Modal>
        )}
      </ModalGateway>
    </Grid>
  );
};
