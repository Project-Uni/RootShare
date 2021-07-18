import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import { dispatchSnackbar, updateSidebarComponents } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CommunityHead } from './CommunityHead';
import { CommunityMedia } from './CommunityMedia';
import { RSText } from '../../../base-components';
import { CommunityAbout } from './CommunityAbout';
import { CommunityFeed } from './CommunityFeed';

import { getCommunityInformation } from '../../../api';
import {
  Community as CommunityFields,
  U2CR,
  UserAvatar,
  BoardMember,
} from '../../../helpers/types';
import { FaLock } from 'react-icons/fa';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

type Props = {};

export type CommunityTab = 'about' | 'feed' | 'media'; // For now, feed is just external

const Community = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { communityID } = useParams<{ communityID: string }>();

  const dispatch = useDispatch();
  const {} = useSelector((state: RootshareReduxState) => ({
    //Necessary state variables
  }));

  const [info, setInfo] = useState<CommunityFields>(); //Community details as a dictionary
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<CommunityTab>('feed');

  useEffect(() => {
    dispatch(
      updateSidebarComponents({
        names: ['discoverCommunities', 'communityDocuments', 'discoverUsers'],
        communityID,
      })
    );
    fetchCommunityInfo().then(() => {
      setLoading(false);
    });
  }, []);

  const fetchCommunityInfo = useCallback(async () => {
    setLoading(true);
    const data = await getCommunityInformation(communityID);
    if (data.success !== 1)
      return dispatch(
        dispatchSnackbar({
          message: 'There was an error retrieving this community',
          mode: 'error',
        })
      );

    setInfo(data.content.community);
    setLoading(false);
  }, [communityID]);

  useEffect(() => {
    fetchCommunityInfo();
  }, [fetchCommunityInfo]);

  const handleAddMember = (newMember: UserAvatar) => {
    setInfo((prevInfo) => {
      if (prevInfo)
        return {
          ...prevInfo,
          members: (prevInfo.members as UserAvatar[]).concat(newMember),
        };
    });
  };

  const getTabContent = React.useCallback(() => {
    if (!info) return;
    switch (currentTab) {
      case 'about':
        return (
          <CommunityAbout
            communityID={communityID}
            editable={info.relationship === U2CR.ADMIN}
            aboutDesc={info.description}
            admin={info.admin as UserAvatar}
            boardMembers={info.boardMembers as BoardMember[]}
            members={info.members as UserAvatar[]}
          />
        );
      case 'feed': {
        return (
          <CommunityFeed
            communityID={communityID}
            admin={(info.admin as UserAvatar)._id}
            isPrivate={info.private}
            isMember={
              info.relationship === U2CR.JOINED || info.relationship === U2CR.ADMIN
            }
            communityName={info.name}
            communityProfilePicture={info.profilePicture}
            scaleEventType={info.scaleEventType}
          />
        );
      }
      case 'media': {
        return (
          <CommunityMedia
            communityID={communityID}
            admin={(info.admin as UserAvatar)?._id}
            editable={info.relationship === 'admin'}
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
          {info ? (
            <div>
              <CommunityHead
                style={{ marginTop: 20 }}
                communityInfo={info}
                currentTab={currentTab}
                handleTabChange={(newTab: CommunityTab) => setCurrentTab(newTab)}
                handleAddMember={handleAddMember}
              />
              {(info.relationship === U2CR.OPEN ||
                info.relationship === U2CR.PENDING) &&
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
              )}{' '}
            </div>
          ) : (
            <RSText size={32} type="head" color={Theme.error}>
              THERE WAS AN ERROR GETTING THE COMMUNITY
            </RSText>
          )}
        </div>
      )}
    </>
  );
};

export default Community;
