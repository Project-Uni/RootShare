import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    display: 'flex',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  selectedTab: {
    background: Theme.white,
    color: Theme.primary,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  notSelectedTab: {
    background: Theme.primaryHover,
    color: Theme.white,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    '&:hover': {
      background: Theme.primary,
      color: Theme.white,

    },
  },
  tab: {
    flexBasis: '100%',
    paddingTop: 15,
    paddingBottom: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

type Props = {
  tabs: { label: string; value: string }[];
  selected: string;
  onChange: (newTab: string | any) => any;
  className?: string;
};

function RSTabs(props: Props) {
  const styles = useStyles();

  function renderTabs() {
    const output = [];
    for (let i = 0; i < props.tabs.length; i++) {
      output.push(
        <div
          className={[
            styles.tab,
            props.selected === props.tabs[i].value
              ? styles.selectedTab
              : styles.notSelectedTab,
          ].join(' ')}
          key={props.tabs[i].value}
          onClick={() => {
            props.onChange(props.tabs[i].value);
          }}
        >
          <RSText
            size={11}
          >
            {props.tabs[i].label.toUpperCase()}
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

export default RSTabs;
