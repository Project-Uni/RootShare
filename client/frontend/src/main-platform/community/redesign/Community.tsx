import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { getCommunities } from '../../../api';
import { CommunityHead } from './CommunityHead';
import { RSText } from '../../../base-components';
import { CommunityAbout } from './CommunityAbout';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {};

export type CommunityTab = 'About' | 'Feed'; //For now, feed is just external

const Community = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { communityID } = useParams<{ communityID: string }>();

  const dispatch = useDispatch();
  const {} = useSelector((state: RootshareReduxState) => ({
    //Necessary state variables
  }));

  const [info, setInfo] = useState<any>(); //Community details as a dictionary
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<CommunityTab>('About');

  useEffect(() => {
    fetchCommunityInfo().then((data) => {
      setInfo(data);
      setLoading(false);
    });
  }, []);

  const fetchCommunityInfo = useCallback(async () => {
    const data = await getCommunities([communityID], {
      fields: [],
      options: {},
    });
    return data;
  }, [communityID, getCommunities]);

  const getTabContent = React.useCallback(() => {
    switch (currentTab) {
      case 'About':
        return <CommunityAbout admin={'12345'} />;
      case 'Feed':
        return <p>Feed</p>;
      default:
        return <RSText>An Error Occured</RSText>;
    }
  }, [currentTab]);

  return (
    <div className={styles.wrapper}>
      <CommunityHead
        style={{ marginTop: 20 }}
        communityID={communityID}
        tab={currentTab}
        onTabChange={setCurrentTab}
        profilePicture={undefined}
        banner={undefined}
      />
      {getTabContent()}
    </div>
  );
};
export default Community;
