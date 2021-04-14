import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import {
  RSAvatar,
  RSButton,
  RSModal,
  SearchField,
} from '../../../reusable-components';

import { FaSearch } from 'react-icons/fa';
import { FcInvite } from 'react-icons/fc';
import { IoRemove } from 'react-icons/io5';

import Theme from '../../../../theme/Theme';
import { SearchOption } from '../../../reusable-components/components/SearchField';
import { RSText } from '../../../../base-components';
import { putCommunityInvite } from '../../../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../../../redux/actions';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: 400,
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

  const removeUser = (_id: string) => {
    const idx = selectedUsers.findIndex((u) => u._id === _id);
    const clone = [...selectedUsers];
    clone.splice(idx, 1);
    setSelectedUsers(clone);
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
        style={{ marginTop: 10, marginBottom: 30, marginLeft: 20, marginRight: 20 }}
      >
        {selectedUsers.map((selectedUser, idx) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            key={selectedUser._id}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSAvatar
                src={selectedUser.profilePicture}
                size={30}
                primaryName={selectedUser.label.split(' ')[0]}
                secondaryName={selectedUser.label.split(' ')[1]}
              />
              <RSText bold style={{ marginLeft: 10 }}>
                {selectedUser.label}
              </RSText>
            </div>
            <IconButton onClick={() => removeUser(selectedUser._id)}>
              <IoRemove color={Theme.secondaryText} />
            </IconButton>
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
          style={{ marginTop: 20 }}
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
