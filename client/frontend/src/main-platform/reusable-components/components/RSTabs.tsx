import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../../base-components/RSText';
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
    background: Theme.primaryHover,
    borderRadius: 25,
  },
  notSelectedTab: {
    background: Theme.background,
    color: Theme.primaryHover,
    borderRadius: 25,
  },
  selectedText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: Theme.white,
    borderRadius: 25,
    fontStyle: 'bold',
    height: '200%',
    width: '100%',
  },
  notSelectedText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: Theme.primaryHover,
    borderRadius: 25,
    fontStyle: 'bold',
    height: '200%',
    width: '100%',
    '&:hover': {
      color: Theme.bright,
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
          {props.selected === props.tabs[i].value
          ? <RSText className={styles.selectedText} bold={true} size={16}>{props.tabs[i].label}</RSText>
          : <RSText className={styles.notSelectedText} bold={true} size={16}>{props.tabs[i].label}</RSText>}
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
