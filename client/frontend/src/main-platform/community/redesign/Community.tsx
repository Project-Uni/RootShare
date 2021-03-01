import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CommunityHead } from './CommunityHead';
import { RSText } from '../../../base-components';
import { CommunityAbout } from './CommunityAbout';

import { getCommunities } from '../../../api';
import { Community as CommunityFields } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {};

export type CommunityTab = 'about' | 'feed'; // For now, feed is just external

const Community = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { communityID } = useParams<{ communityID: string }>();

  const dispatch = useDispatch();
  const {} = useSelector((state: RootshareReduxState) => ({
    //Necessary state variables
  }));

  const [info, setInfo] = useState<CommunityFields>({} as CommunityFields); //Community details as a dictionary
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<CommunityTab>('feed');

  useEffect(() => {
    fetchCommunityInfo().then((data) => {
      setLoading(false);
    });
  }, []);

  const fetchCommunityInfo = useCallback(async () => {
    const data = await getCommunities([communityID], {
      fields: [
        'admin',
        'name',
        'members',
        'externalPosts',
        'description',
        'members',
        'private',
        'type',
        'profilePicture',
        // 'bannerPicture',
      ],
      options: {
        getProfilePicture: true,
        getBannerPicture: true,
        getRelationship: true,
        limit: 1,
        includeDefaultFields: true,
      },
    });

    if (data.success === 1)
      return setInfo(data.content.communities[0] as CommunityFields);

    dispatch(
      dispatchSnackbar({
        message: 'There was an error retrieving this community',
        mode: 'error',
      })
    );
    return {};
  }, [communityID, getCommunities]);

  const getTabContent = React.useCallback(() => {
    switch (currentTab) {
      case 'about':
        return <CommunityAbout admin={'12345'} />;
      case 'feed':
        return <p>Feed</p>;
      default:
        return <RSText>An Error Occured</RSText>;
    }
  }, [currentTab]);

  return (
    <div className={styles.wrapper}>
      <CommunityHead
        style={{ marginTop: 20 }}
        communityInfo={info}
        currentTab={currentTab}
        handleTabChange={(newTab: CommunityTab) => setCurrentTab(newTab)}
      />
      {getTabContent()}
    </div>
  );
};

export default Community;
