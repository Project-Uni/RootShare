import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useEffect, useState } from 'react';
import { ProfilePicture } from '../../../base-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import Theme from '../../../theme/Theme';
import { RSButton, RSModal, RSTextField } from '../../reusable-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 650,
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
    marginBottom: '50px',
  },
  textbox: {
    width: '550px',
    marginTop: '20px',
  },
  tagContainer: {
    marginTop: '20px',
    width: '550px',
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  tag: {
    height: '25px',
    marginLeft: '2px',
    marginRight: '2px',
    fontFamily: 'lato',
    color: Theme.primaryText,
  },
  saveBtn: {
    marginLeft: '550px',
    marginBottom: '20px',
  }

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

  function handleSave() {
    return (props.onClose);
  }

  function renderTags() {
    //TODO add tag functionality 
    //filler to test formating for now
    return (
      <div className={styles.tagContainer}>
        <RSButton
          variant='university'
          className={styles.tag}>
          #finance
        </RSButton>
        <RSButton
          variant='university'
          className={styles.tag}>
          #leadership
        </RSButton>
        <RSButton
          variant='university'
          className={styles.tag}>
          #buisness
        </RSButton>
        <RSButton
          variant='university'
          className={styles.tag}>
          #krannert
        </RSButton>
        <RSButton
          className={styles.tag}
          style={{
            fontFamily: 'lato',
            borderStyle: 'solid',
            borderWidth: '0.5px',
            borderColor: Theme.universityAccent,
            color: Theme.primaryText,
            background: Theme.white,
          }}
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
        title="Edit Profile"
        onClose={props.onClose}
        className={styles.wrapper}
        >
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
          <div className={styles.saveBtn}>
            <RSButton
              variant="universityRound"
              onClick={handleSave()}
            >
              Save
            </RSButton>
          </div>
      </RSModal>
    </>
  );
}

export default EditCommunityModal;