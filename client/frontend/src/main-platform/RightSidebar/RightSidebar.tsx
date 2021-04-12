import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { usePrevious } from '../../helpers/hooks';

import { DiscoverUsers, DiscoverCommunities, Documents } from './components'; // Components

import { getSidebarData } from '../../api/get';
import { DiscoverUser, DiscoverCommunity, Document } from './components'; // Types

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 320,
    marginLeft: 27,
    marginRight: 30,
    marginTop: 30,
    overflow: 'scroll',
  },
}));

export const RIGHT_BAR_WIDTH = 300;

export type SidebarComponentTypes =
  | 'discoverUsers'
  | 'discoverCommunities'
  | 'communityDocuments'
  | 'userDocuments'
  | 'pinnedCommunities'
  | 'trending';

export type SidebarComponents = {
  names: SidebarComponentTypes[];
  communityID?: string;
  userID?: string;
};

type Props = {
  // children?: JSX.Element | JSX.Element[] | string | number;
  className?: string;
};

export const RightSidebar = (props: Props) => {
  const styles = useStyles();

  const { sidebarComponents } = useSelector((state: RootshareReduxState) => ({
    sidebarComponents: state.sidebarComponents,
  }));
  const previousComponents = usePrevious(sidebarComponents);

  const { className } = props;

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverCommunities, setDiscoverCommunities] = useState<
    DiscoverCommunity[]
  >([]);
  const [communityDocuments, setCommunityDocuments] = useState<Document[]>([]);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  // const [pinnedCommunities, setPinnedCommunities] = useState([])
  // const [trending, setTrending] = useState([])

  useEffect(() => {
    fetchData();
  }, [sidebarComponents]);

  const fetchData = async () => {
    const newComponents = getNewComponents();
    if (newComponents.names.length === 0) return;

    const data = await getSidebarData(newComponents);
    if (data.success !== 1) return;

    const {
      discoverUsers,
      discoverCommunities,
      communityDocuments,
      userDocuments,
      pinnedCommunities,
      trending,
    } = data.content;

    discoverUsers && setDiscoverUsers(discoverUsers);
    discoverCommunities && setDiscoverCommunities(discoverCommunities);
    communityDocuments && setCommunityDocuments(communityDocuments);
    userDocuments && setUserDocuments(userDocuments);

    // pinnedCommunities &&
    //   setPinnedCommunities(pinnedCommunities);
    // trending && setTrending(trending);
  };

  const getNewComponents = () => {
    if (!previousComponents) return sidebarComponents;

    const newComponents: SidebarComponents = {
      names: [],
      communityID: sidebarComponents.communityID,
      userID: sidebarComponents.userID,
    };

    const prevNames = previousComponents.names;
    sidebarComponents.names.forEach((component) => {
      if (!prevNames.includes(component)) newComponents.names.push(component);
      else if (
        component === 'communityDocuments' &&
        previousComponents.communityID !== sidebarComponents.communityID
      )
        newComponents.names.push(component);
      else if (
        component === 'userDocuments' &&
        previousComponents.userID !== sidebarComponents.userID
      )
        newComponents.names.push(component);
    });

    return newComponents;
  };

  return (
    <div className={styles.wrapper}>
      {sidebarComponents.names.map((component) => {
        switch (component) {
          case 'discoverUsers':
            return <DiscoverUsers users={discoverUsers} />;
          case 'discoverCommunities':
            return <DiscoverCommunities communities={discoverCommunities} />;
          case 'communityDocuments':
            return <Documents variant="community" documents={communityDocuments} />;
          case 'userDocuments':
            return <Documents variant="user" documents={userDocuments} />;
          case 'pinnedCommunities':
            return <div />; //<PinnedCommunities />;
          case 'trending':
            return <div />; //<Trending />;
        }
      })}
    </div>
  );
};

RightSidebar.defaultProps = {
  components: [],
};
