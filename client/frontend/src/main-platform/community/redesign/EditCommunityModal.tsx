import { TextField } from '@material-ui/core';
import { red } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useEffect, useState } from 'react';
import { ProfilePicture } from '../../../base-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { Community } from '../../../helpers/types';
import Theme from '../../../theme/Theme';
import { RSButton, RSModal, RSTextField } from '../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 600,
  },
  profilePicture: {
    border: `7px solid ${Theme.white}`,
  },
  profilePictureContainer: {
    marginTop: -82,
    display: 'inline-block',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  textbox: {
    width: '500px',
    marginTop: '20px',
  },
  tagContainer: {
    marginTop: '20px',
    width: '500px',
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    borderColor: '#FF0000',
  },
  tag:{
    height: '25px',
    marginLeft: '2px',
    marginRight: '2px',
  },

}));

type Props = {
  communityID: string;
  open: boolean;
  onClose: () => any;
  profilePicture?: string;
  banner?: string;
};

export const EditCommunityModal = (props: Props) => {
const styles = useStyles();
  const {
    communityID,
    profilePicture,
    banner,
  } = props;

  function handleSave(community: Community) {
    return (props.onClose);
  }

  function renderTags() {
    //TODO add tag functionality
    return (
      <div className={styles.tagContainer}>
        <RSButton
          variant='university'
          disabled={true}
          className={styles.tag}>
          Sport
        </RSButton>
        <RSButton
          className={styles.tag}
        >
          Add Tag +
        </RSButton>
      </div>
    );
  }
const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (props.open) {
      setLoading(true);
      setLoading(false);
    }
  }, [props.open]);

  return (
    <>
      <RSModal
        open={props.open}
        title="Edit Community Profile"
        onClose={props.onClose}
        className={styles.wrapper}
        >
        <RSButton
          variant="university"
          onClick={() => handleSave}
        >
          Save
        </RSButton>
        <ProfileBanner
          height={225}
          editable={false}
          type={'community'}
          _id={communityID}
          currentPicture={banner}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: 50,
            paddingRight: 50,
          }}
        >
          <ProfilePicture
            editable={false}
            type="community"
            height={150}
            width={150}
            pictureStyle={styles.profilePicture}
            className={styles.profilePictureContainer}
            borderRadius={100}
            _id={communityID}
            currentPicture={profilePicture}
          />
          </div>
          <div className={styles.form}>
            <RSTextField
              variant="outlined"
              label="Community Name"
              className={styles.textbox}
            />
            <RSTextField
              variant="outlined"
              label="Bio"
              className={styles.textbox}
              rows={3}
              multiline
            />
            {renderTags()}
          </div>
      </RSModal>
    </>
  );
}

export default EditCommunityModal;