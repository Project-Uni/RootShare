import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import {
  RSAvatar,
  RSButton,
  RSModal,
  SearchField,
} from '../../../reusable-components';
import { FaSearch } from 'react-icons/fa';
import Theme from '../../../../theme/Theme';
import { FcInvite } from 'react-icons/fc';
import { SearchOption } from '../../../reusable-components/components/SearchField';
import { RSText } from '../../../../base-components';
import { putCommunityInvite } from '../../../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../../redux/actions';

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

  const dispatch = useDispatch();

  const [selectedUsers, setSelectedUsers] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setSelectedUsers([]);
  }, [open]);

  const onInvite = async () => {
    setLoading(true);
    const invitedIDs = selectedUsers.map((s) => s._id);
    const data = await putCommunityInvite({ invitedIDs, communityID });
    if (data.success === 1) {
      dispatch(
        dispatchSnackbar({
          mode: 'notify',
          message: 'Selected users have been invited!',
        })
      );
      onClose();
    } else {
      dispatch(
        dispatchSnackbar({
          mode: 'error',
          message: 'There was an error trying to invite the users',
        })
      );
    }
    setLoading(false);
  };

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
        {selectedUsers.map((selectedUser) => (
          <div style={{ display: 'flex' }}>
            <RSAvatar src={selectedUser.profilePicture} />
            <RSText>{selectedUser.label}</RSText>
          </div>
        ))}
        <SearchField
          fullWidth
          label="Invite Users"
          variant="outlined"
          adornment={<FaSearch size={24} color={Theme.secondaryText} />}
          renderLimit={10}
          mode="user"
          fetchDataURL="/api/discover/communityInvite"
          fetchDataAdditionalParams={{ communityID }}
          onAutocomplete={(selected) =>
            setSelectedUsers((prev) => [...prev, selected])
          }
        />
        <RSButton
          style={{ width: '100%', marginTop: 20 }}
          disabled={loading || selectedUsers.length === 0}
          onClick={onInvite}
        >
          Invite
        </RSButton>
      </div>
    </RSModal>
  );
};
