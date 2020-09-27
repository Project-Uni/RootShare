import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    display: 'flex',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  selectedTab: {
    background: colors.bright,
  },
  notSelectedTab: {
    background: 'rgb(232, 232, 232)',
  },
  tab: {
    flexBasis: '100%',
    paddingTop: 15,
    paddingBottom: 15,
  },
  whiteText: {
    color: colors.primaryText,
  },
  grayText: {
    color: colors.secondaryText,
  },
}));

type Props = {
  tabs: { label: string; value: string }[];
  selected: string;
  onChange: (newTab: string) => any;
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
            size={12}
            className={
              props.selected === props.tabs[i].value
                ? styles.whiteText
                : styles.grayText
            }
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
