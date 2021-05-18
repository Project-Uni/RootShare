import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';

import RSText from '../../../base-components/RSText';

import Theme, { addAlpha } from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    flex: 1,
    display: 'flex',
  },
  underlineWrapper: {
    boxShadow: `0px 3px 3px -3px ${addAlpha(Theme.primaryText, 0.5)}`,
  },
  tab: {
    flexBasis: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      cursor: 'pointer',
    },
  },
  selectedTab: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    borderBottomColor: addAlpha('#000000', 0.5),
  },
  notSelectedTab: {},
}));

type Props = {
  tabs: { label: string; value: string }[];
  selected: string;
  onChange: (newTab: string | any) => any;
  size: number;
  variant: 'primary' | 'underlinedTabs' | 'underlinedWhole';
  theme: 'rootshare' | 'university';
  className?: string;
  style?: React.CSSProperties;
};

function RSTabsV2(props: Props) {
  const styles = useStyles();

  const { tabs, selected, onChange, size, variant, theme, className, style } = props;

  const { university } = useSelector((state: RootshareReduxState) => state.user);

  function renderTabs() {
    const output = [];
    for (let i = 0; i < tabs.length; i++) {
      const isSelected = selected === tabs[i].value;

      output.push(
        <div
          className={[
            styles.tab,
            variant === 'underlinedTabs' &&
              (isSelected ? styles.selectedTab : styles.notSelectedTab),
          ].join(' ')}
          key={tabs[i].value}
        >
          <RSText
            className={styles.tabItem}
            weight={isSelected ? 'bold' : 'light'}
            color={
              isSelected
                ? theme === 'rootshare'
                  ? Theme.bright
                  : Theme.universityAccent[university]
                : Theme.primaryText
            }
            size={size}
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
    <div
      className={[
        styles.wrapper,
        variant === 'underlinedWhole' && styles.underlineWrapper,
        className,
      ].join(' ')}
      style={style}
    >
      {renderTabs()}
    </div>
  );
}

RSTabsV2.defaultProps = {
  size: 13,
  variant: 'primary',
  theme: 'rootshare',
};

export default RSTabsV2;
