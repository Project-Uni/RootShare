import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CommunityHead } from './CommunityHead';
import { RSText } from '../../../base-components';
import { CommunityAbout, AboutPageUser } from './CommunityAbout';
import { CommunityFeed } from './CommunityFeed';
import { getCommunities } from '../../../api';
import { Community as CommunityFields, U2CR } from '../../../helpers/types';
import { FaLock } from 'react-icons/fa';
import Theme from '../../../theme/Theme';

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
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<CommunityTab>('feed');

  const fetchCommunityInfo = useCallback(async () => {
    setLoading(true);
    const data = await getCommunities([communityID], {
      fields: ['admin', 'name', 'members', 'description', 'bio', 'private', 'type'],
      options: {
        getProfilePicture: true,
        getBannerPicture: true,
        getRelationship: true,
        limit: 1,
        includeDefaultFields: true,
        populates: [
          'admin:firstName lastName profilePicture',
          'members:firstName lastName profilePicture',
        ],
      },
    });
    if (data.success !== 1) {
      dispatch(
        dispatchSnackbar({
          message: 'There was an error retrieving this community',
          mode: 'error',
        })
      );
      return;
    }
    setInfo(data.content.communities[0]);
    setLoading(false);
  }, [communityID]);

  useEffect(() => {
    fetchCommunityInfo();
  }, [fetchCommunityInfo]);

  const getTabContent = React.useCallback(() => {
    switch (currentTab) {
      case 'about':
        return (
          <CommunityAbout
            communityID={communityID}
            editable={info.relationship === U2CR.ADMIN}
            aboutDesc={info.description}
            admin={info.admin as AboutPageUser}
            // moderators={info.moderators as AboutPageUser[]} // TODO: add this functionality later
            members={info.members as AboutPageUser[]}
          />
        );
      case 'feed': {
        return (
          <CommunityFeed
            communityID={communityID}
            admin={(info.admin as AboutPageUser)._id}
            isPrivate={info.private}
            isMember={
              info.relationship === U2CR.JOINED || info.relationship === U2CR.ADMIN
            }
          />
        );
      }

      default:
        return <RSText>An Error Occured</RSText>;
    }
  }, [currentTab, info]);

  return (
    <>
      {!loading && (
        <div className={styles.wrapper}>
          <CommunityHead
            style={{ marginTop: 20 }}
            communityInfo={info}
            currentTab={currentTab}
            handleTabChange={(newTab: CommunityTab) => setCurrentTab(newTab)}
          />
          {(info.relationship === U2CR.OPEN || info.relationship === U2CR.PENDING) &&
          info.private ? (
            <div style={{ marginTop: 30 }}>
              <FaLock
                color={Theme.secondaryText}
                size={70}
                style={{ marginBottom: 15 }}
              />
              <RSText bold size={16}>
                Join this community to see it's content.
              </RSText>
            </div>
          ) : (
            getTabContent()
          )}
        </div>
      )}
    </>
  );
};

export default Community;
