import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { DiscoverUsers, DiscoverCommunities } from './components';

import { getSidebarData } from '../../api/get';
import { DiscoverUser, DiscoverCommunity } from './components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 320,
    marginLeft: 27,
    marginRight: 30,
    marginTop: 30,
    overflow: 'scroll',
  },
}));

export const COMPONENT_WIDTH = 300;

export type SidebarComponents =
  | 'discoverUsers'
  | 'discoverCommunities'
  | 'pinnedCommunities'
  | 'trending';

type Props = {
  // children?: JSX.Element | JSX.Element[] | string | number;
  className?: string;
  components: SidebarComponents[];
};

export const RightSidebar = (props: Props) => {
  const styles = useStyles();

  const { className, components } = props;

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverCommunities, setDiscoverCommunities] = useState<
    DiscoverCommunity[]
  >([]);
  // const [pinnedCommunities, setPinnedCommunities] = useState([])
  // const [trending, setTrending] = useState([])

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getSidebarData(components);
    const {
      discoverUsers,
      discoverCommunities,
      pinnedCommunities,
      trending,
    } = data.content;

    discoverUsers && setDiscoverUsers(discoverUsers);
    discoverCommunities && setDiscoverCommunities(discoverCommunities);
    // pinnedCommunities &&
    //   setPinnedCommunities(pinnedCommunities);
    // trending && setTrending(trending);
  };

  return (
    <div className={styles.wrapper}>
      {components.map((component) => {
        switch (component) {
          case 'discoverUsers':
            return <DiscoverUsers users={discoverUsers} />;
          case 'discoverCommunities':
            return <DiscoverCommunities communities={discoverCommunities} />;
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
