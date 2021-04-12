import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { SearchField } from '../../main-platform/reusable-components';
import { useHistory } from 'react-router';
import Theme from '../../theme/Theme';
import { InputBase } from '@material-ui/core';
import { IoSearchOutline } from 'react-icons/io5';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {},
  searchbar: {
    maxWidth: 400,
  },
  // collapsedSearch: {
  //   maxWidth: 0,
  //   opacity: 0,
  // },
  // visibleSearch: {
  //   maxWidth: 400,
  //   opacity: 1,
  // },
  inputBase: {
    background: muiTheme.background.primary,
    borderRadius: 22,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 3,
    paddingBottom: 3,
    color: muiTheme.text.secondary,
  },
}));

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export const HeaderSearch = (props: Props) => {
  const { className, style } = props;

  const styles = useStyles();
  const history = useHistory();

  return (
    <SearchField
      style={{
        // transition: `max-width 0.75s ease, opacity ${
        //   showSearch ? 0.2 : 0.6
        // }s ease`,
        ...style,
      }}
      mode="both"
      name="header-search"
      placeholder="Search RootShare..."
      className={[
        styles.searchbar,
        className,
        // showSearch ? styles.visibleSearch : styles.collapsedSearch,
      ].join(' ')}
      fetchDataURL="/api/discover/search/v1/exactMatch"
      renderLimit={10}
      onAutocomplete={(selectedOption) => {
        history.push(
          `/${selectedOption.type === 'community' ? 'community' : 'profile'}/${
            selectedOption._id
          }`
        );
      }}
      fullWidth
      freeSolo
      groupByType
      variant="standard"
      bigText
      adornment={<IoSearchOutline size={18} color={Theme.secondaryText} />}
      InputComponent={<InputBase className={styles.inputBase} />}
    />
  );
};
