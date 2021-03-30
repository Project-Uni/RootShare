import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useEffect, useState } from 'react';
import { ProfilePicture, RSText } from '../../../base-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { makeRequest } from '../../../helpers/functions';
import Theme from '../../../theme/Theme';
import { RSButtonV2, RSModal, RSTextField } from '../../reusable-components';
import Tag from './Tag';

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
    alignSelf: 'flex-start',
    height: 25,
    minWidth: 80,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 2,
    marginRight: 2,
    fontFamily: 'lato',
  },
  saveBtn: {
    marginLeft: '450px',
    marginBottom: '20px',
  },
  button: {
    height: 25,
    marginTop: 5,
    width: 150,
    marginBottom: 10,
  },
}));

type Props = {
  communityID: string;
  open: boolean;
  onClose: () => any;
  profilePicture?: string;
  banner?: string;
  editable: boolean;
  name: string;
  bio: string;
};

export const EditCommunityModal = (props: Props) => {
const styles = useStyles();
  const {
    communityID,
    profilePicture,
    banner,
  } = props;

  const [communityName, setCommunityName] = useState<string>(props.name);
  const [communityBio, setCommunityBio] = useState<string>(props.bio);
  const [loading, setLoading] = useState(false);
  const [editNameErr, setEditNameErr] = useState('');
  const [editBioErr, setEditBioErr] = useState('');


  async function handleSave() {
    await handleUpdate().then(props.onClose);
  }

  function handleClose() {
    return (props.onClose);
  }

  async function handleUpdate() {
    setLoading(true);
    handleName();
    handleBio();
    setLoading(false);
  }

  async function handleName() {
    const { data } = await makeRequest(
      'PUT',
      `/api/community/${props.communityID}/update?name=${communityName}`
    );

    if (data.success != 1) {
      setEditNameErr('There was an error updating the name');
    }
  }

  async function handleBio() {
    const { data } = await makeRequest(
      'PUT',
      `/api/community/${props.communityID}/update?description=${communityBio}`
    );

    if (data.success != 1) {
      setEditBioErr('There was an error updating the description');
    }
  }

  function renderTags() {
    //TODO add tag functionality 
    //filler to test formating for now
    return (
      <div className={styles.tagContainer}>
        <Tag className={styles.tag} tag={"#finance"} variant="university" weight="light" />
        <Tag className={styles.tag} tag={"#krannet"} variant="university" weight="light" />
        <Tag className={styles.tag} tag={"#managment"} variant="university" weight="light" />
        <RSButtonV2
          className={styles.tag}
          variant="universitySecondary"
        >
          <RSText> Add Tag + </RSText>
        </RSButtonV2>
      </div>
    );
  }

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
        onClose={handleClose()}
        className={styles.wrapper}
        >
        <ProfileBanner
          height={225}
          editable={props.editable}
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
            editable={props.editable}
            zoomOnClick
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
              defaultValue={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className={styles.textbox}
            />
            <RSTextField
              variant="outlined"
              label="Bio"
              className={styles.textbox}
              defaultValue={communityBio}
              onChange={(e) => setCommunityBio(e.target.value)}
              rows={3}
              multiline
            />
            {renderTags()}
          </div>
          <div className={styles.saveBtn}>
            <RSButtonV2
              variant="universitySecondary"
              className={styles.button}
              onClick={() => handleSave()}
            >
              <RSText size={11}>Save</RSText>
            </RSButtonV2>
          </div>
      </RSModal>
    </>
  );
}

export default EditCommunityModal;