import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../base-components/RSText';

import { colors } from '../../theme/Colors';

import DiscoverySinglePerson from './DiscoverySinglePerson';
import {
  AshwinHeadshot,
  SmitHeadshot,
  JacksonHeadshot,
  DhruvHeadshot,
  ChrisHeadshot,
} from '../../images/team';

const HEADER_HEIGHT = 60;
const VERTICAL_PADDING_TOTAL = 40;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 270,
    background: colors.primary,
    textAlign: 'left',
    padding: 20,
    overflow: 'scroll',
  },
}));

type PEOPLE = {
  name: string;
  profilePic: any;
  _id: string;
  position: string;
  company: string;
  mutualConnections: number;
};
type Props = {};

function DiscoverySidebar(props: Props) {
  const styles = useStyles();

  const [height, setHeight] = useState(
    window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL
  );
  const [recommendedPeople, setRecommendedPeople] = useState<PEOPLE[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    getRecommendations();
  }, []);

  function handleResize() {
    setHeight(window.innerHeight - HEADER_HEIGHT - VERTICAL_PADDING_TOTAL);
  }

  function getRecommendations() {
    const recPeople: PEOPLE[] = [];
    recPeople.push({
      name: 'Ashwin Mahesh',
      profilePic: AshwinHeadshot,
      position: 'Head of Product',
      company: 'RootShare',
      mutualConnections: 32,
      _id: 'testID1',
    });
    recPeople.push({
      name: 'Smit Desai',
      profilePic: SmitHeadshot,
      position: 'Head of Architecture',
      company: 'RootShare',
      mutualConnections: 78,
      _id: 'testID2',
    });
    recPeople.push({
      name: 'Jackson McCluskey',
      profilePic: JacksonHeadshot,
      position: 'Head of Digital Strategy',
      company: 'RootShare',
      mutualConnections: 64,
      _id: 'testID3',
    });
    recPeople.push({
      name: 'Dhruv Patel',
      profilePic: DhruvHeadshot,
      position: 'Chief Operating Officer',
      company: 'RootShare',
      mutualConnections: 400,
      _id: 'testID4',
    });
    recPeople.push({
      name: 'Chris Hartley',
      profilePic: ChrisHeadshot,
      position: 'Chief Executive Officer',
      company: 'RootShare',
      mutualConnections: 500,
      _id: 'testID5',
    });
    setRecommendedPeople(recPeople);
  }

  function renderCommunities() {
    //Test code
    const communities = [];
    for (let i = 0; i < 5; i++) {
      communities.push(
        <RSText type="body" color={colors.primaryText}>
          Community {i}
        </RSText>
      );
    }

    return (
      <div>
        <RSText size={18} type="head" bold color={colors.primaryText}>
          Communities for you
        </RSText>
        {communities}
      </div>
    );
  }

  function renderPeople() {
    const people = [];
    for (let i = 0; i < recommendedPeople.length; i++) {
      people.push(
        <DiscoverySinglePerson
          name={recommendedPeople[i]['name']}
          profilePic={recommendedPeople[i]['profilePic']}
          position={recommendedPeople[i]['position']}
          company={recommendedPeople[i]['company']}
          mutualConnections={recommendedPeople[i]['mutualConnections']}
          _id={recommendedPeople[i]['_id']}
          onRemove={(key: string) => {
            console.log('Clicking remove for', key);
          }}
          onConnect={(key: string) => {
            console.log('Clicking connect for', key);
          }}
        />
      );
    }
    //End of test code
    return (
      <div>
        <RSText size={18} type="head" bold color={colors.primaryText}>
          People for you
        </RSText>
        {people}
      </div>
    );
  }
  return (
    <div className={styles.wrapper} style={{ height: height }}>
      {renderCommunities()}
      {renderPeople()}
    </div>
  );
}

export default DiscoverySidebar;
