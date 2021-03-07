import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import RSText from '../../../base-components/RSText';

import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    display: 'flex',
  },
  tab: {
    flexBasis: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  selectedTab: {},
  notSelectedTab: {
    '&:hover': {},
  },
}));

type Props = {
  tabs: { label: string; value: string }[];
  selected: string;
  onChange: (newTab: string | any) => any;
  className?: string;
  style?: React.CSSProperties;
};

function RSTabsV2(props: Props) {
  const styles = useStyles();

  const { tabs, selected, onChange, className, style } = props;

  const { university } = useSelector((state: RootshareReduxState) => state.user);

  function renderTabs() {
    const output = [];
    for (let i = 0; i < tabs.length; i++) {
      const isSelected = selected === tabs[i].value;

      output.push(
        <div className={styles.tab} key={tabs[i].value}>
          <RSText
            className={[
              styles.tabItem,
              isSelected ? styles.selectedTab : styles.notSelectedTab,
            ].join(' ')}
            weight={isSelected ? 'bold' : 'light'}
            color={
              isSelected ? Theme.universityAccent[university] : Theme.primaryText
            }
            size={13}
            onClick={() => {
              onChange(tabs[i].value);
            }}
          >
            {tabs[i].label}
          </RSText>
        </div>
      );
    }
    return output;
  }
  return (
    <div className={[styles.wrapper, className].join(' ')} style={style}>
      {renderTabs()}
    </div>
  );
}

export default RSTabsV2;
