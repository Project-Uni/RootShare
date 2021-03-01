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
};

function RSTabsV2(props: Props) {
  const styles = useStyles();

  const { university } = useSelector((state: RootshareReduxState) => state.user);

  function renderTabs() {
    const output = [];
    for (let i = 0; i < props.tabs.length; i++) {
      const isSelected = props.selected === props.tabs[i].value;

      output.push(
        <div className={styles.tab} key={props.tabs[i].value}>
          <RSText
            className={[
              styles.tabItem,
              isSelected ? styles.selectedTab : styles.notSelectedTab,
            ].join(' ')}
            bold={isSelected}
            color={
              isSelected ? Theme.universityAccent[university] : Theme.primaryText
            }
            size={13}
            onClick={() => {
              props.onChange(props.tabs[i].value);
            }}
          >
            {props.tabs[i].label}
          </RSText>
        </div>
      );
    }
    return output;
  }
  return (
    <div className={[styles.wrapper, props.className].join(' ')}>{renderTabs()}</div>
  );
}

export default RSTabsV2;
