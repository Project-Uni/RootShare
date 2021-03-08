import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, useParams } from 'react-router-dom';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import { CommunityHead } from './CommunityHead';
import { RSText } from '../../../base-components';
import { CommunityAbout, AboutPageUser } from './CommunityAbout';
import { UserPost } from '../../reusable-components';

import { getCommunities } from '../../../api';
import { Community as CommunityFields, PostType } from '../../../helpers/types';
import { makeRequest, formatDatePretty } from '../../../helpers/functions';

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
  const [externalPosts, setExternalPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<CommunityTab>('feed');

  useEffect(() => {
    fetchCommunityInfo().then(() => {
      setLoading(false);
    });
  }, []);

  const fetchCommunityInfo = useCallback(async () => {
    const communityPromise = getCommunities([communityID], {
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

    const postPromise = makeRequest(
      'GET',
      `/api/posts/community/${communityID}/external`
    );

    return Promise.all([communityPromise, postPromise]).then(
      ([communityData, postData]) => {
        if (communityData.success !== 1 || postData.data.success !== 1)
          dispatch(
            dispatchSnackbar({
              message: 'There was an error retrieving this community',
              mode: 'error',
            })
          );

        setInfo(communityData.content.communities[0]);
        setExternalPosts(postData.data.content.posts);
      }
    );
  }, [communityID, getCommunities]);

  const getTabContent = React.useCallback(() => {
    switch (currentTab) {
      case 'about':
        return (
          <CommunityAbout
            communityID={communityID}
            editable={info.relationship === 'admin'}
            aboutDesc={info.description}
            admin={info.admin as AboutPageUser}
            // moderators={info.moderators as AboutPageUser[]} // TODO: add this functionality later
            members={info.members as AboutPageUser[]}
          />
        );
      case 'feed': {
        return (
          <>
            {externalPosts && externalPosts.length > 0 ? (
              externalPosts.map((post) => {
                return (
                  <UserPost
                    postID={post._id}
                    posterID={post.user._id}
                    name={post.user.firstName}
                    timestamp={formatDatePretty(new Date(post.createdAt))}
                    profilePicture={post.user.profilePicture}
                    message={post.message}
                    likeCount={post.likes}
                    commentCount={post.comments}
                  />
                );
              })
            ) : (
              <div style={{ overflow: 'scroll' }}>
                <div style={{ width: 1500, height: 400 }}>No posts</div>
              </div>
            )}
          </>
        );
      }

      default:
        return <RSText>An Error Occured</RSText>;
    }
  }, [currentTab, info, externalPosts]);

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
          {getTabContent()}
        </div>
      )}
    </>
  );
};

export default Community;
