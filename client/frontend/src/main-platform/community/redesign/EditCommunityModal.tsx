import { CircularProgress, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { useEffect, useState } from 'react';
import { ProfilePicture, RSText } from '../../../base-components';
import ProfileBanner from '../../../base-components/ProfileBanner';
import { makeRequest } from '../../../helpers/functions';
import { CommunityType, COMMUNITY_TYPES } from '../../../helpers/types';
import Theme from '../../../theme/Theme';
import { RSButtonV2, RSModal, RSSelect, RSTextField } from '../../reusable-components';
import Tag from './Tag';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: 650,
  },
  profilePicture: {
    border: `2px solid ${Theme.foreground}`,
  },
  profilePictureContainer: {
    marginTop: -70,
    alignSelf: 'start',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: '50px',
  },
  feild: {
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
  updateName: (name: string) => any;
  updateBio: (bio: string) => any;
  updateType: (type: CommunityType) => any;
  profilePicture?: string;
  banner?: string;
  editable: boolean;
  name: string;
  bio: string;
  type: CommunityType;
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
  const [communityType, setCommunityType] = useState<CommunityType>(props.type);
  const [loading, setLoading] = useState(false);
  const [editErr, setEditErr] = useState('');

  async function handleSave() {
    await handleUpdate().then(props.onClose);
    handleCallback();
  }

  function handleCallback() {
    if (props.name != communityName) {
      props.updateName(communityName);
    }
    if (props.bio != communityBio) {
      props.updateBio(communityBio);
    }
    if (props.type != communityType) {
      props.updateType(communityType);
    }
  }

  function handleClose() {
    return (props.onClose);
  }

  async function handleUpdate() {
    setLoading(true);
    if (props.name != communityName) {
      saveValue("name", communityName);
    }
    if (props.bio != communityBio) {
      saveValue("description", communityBio);
    }
    if (props.type != communityType) {
      saveValue("type", communityType);
    }
    setLoading(false);
  }

  async function saveValue(type: string, value: string | CommunityType) {
    const { data } = await makeRequest(
      'PUT',
      `/api/community/${props.communityID}/update?${type}=${value}`
    );

    if (data.success != 1) {
      setEditErr(`There was an error updating the ${type}`);
    }
  }

  function handleTypeChange(type: any) {
    setCommunityType(type.target.value);
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
              className={styles.feild}
            />
            <RSTextField
              variant="outlined"
              label="Bio"
              className={styles.feild}
              defaultValue={communityBio}
              onChange={(e) => setCommunityBio(e.target.value)}
              rows={3}
              multiline
            />
            <RSSelect
              label="Type"
              options={COMMUNITY_TYPES.map((type) => ({
                label: type,
                value: type,
              }))}
              defaultValue={props.type}
              onChange={handleTypeChange}
              className={styles.feild}/>
            {/* {renderTags()} PLACEHOLDER FUNCTION*/}
          </div>
          <div className={styles.saveBtn}>
            <RSButtonV2
              variant="universitySecondary"
              className={styles.button}
              onClick={() => handleSave()}
            >
              {loading ? <CircularProgress size={30} /> : 'Save'}
            </RSButtonV2>
          </div>
      </RSModal>
    </>
  );
}

export default EditCommunityModal;