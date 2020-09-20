import React, { useState, useEffect } from 'react';
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
    // border: `1px solid ${colors.secondaryText}`,
    paddingTop: 15,
    paddingBottom: 15,
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
  const [tabs, setTabs] = useState<JSX.Element[]>([]);

  // useEffect(() => {
  //   setTabs(generateTabs());
  // }, [props.selected]);

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
            color={
              props.selected === props.tabs[i].value
                ? colors.primaryText
                : colors.secondaryText
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
