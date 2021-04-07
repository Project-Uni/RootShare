import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import { RSButton, RSModal, SearchField } from '../../../reusable-components';
import { FaSearch } from 'react-icons/fa';
import Theme from '../../../../theme/Theme';
import { FcInvite } from 'react-icons/fc';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: 450,
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
  communityName: string;
  communityID: string;
};

export const CommunityInviteModal = (props: Props) => {
  const styles = useStyles();
  const { open, onClose, communityName, communityID } = props;

  return (
    <RSModal
      open={open}
      onClose={onClose}
      title={`Invite to Community`}
      helperText={`Select users to invite to ${communityName}`}
      className={styles.wrapper}
      helperIcon={<FcInvite size={80} />}
    >
      <div
        style={{ marginTop: 30, marginBottom: 30, marginLeft: 20, marginRight: 20 }}
      >
        <SearchField
          fullWidth
          label="Invite Users"
          freeSolo
          variant="outlined"
          adornment={<FaSearch size={24} color={Theme.secondaryText} />}
          renderLimit={15}
          mode="user"
          fetchDataURL="/api/discover/communityInvite"
          fetchDataAdditionalParams={{ communityID }}
        />
        {/* <SearchField
          style={{
            // transition: `max-width 0.75s ease, opacity ${
            //   showSearch ? 0.2 : 0.6
            // }s ease`,
            marginLeft: window.innerWidth >= 767 ? 55 : undefined,
          }}
          mode="both"
          name="header-search"
          placeholder="Search RootShare..."
          className={[
            styles.searchbar,
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
          adornment={<FaSearch size={24} color={theme.secondaryText} />}
        /> */}
        <RSButton style={{ width: '100%', marginTop: 20 }}>Invite</RSButton>
      </div>
    </RSModal>
  );
};
