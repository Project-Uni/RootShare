import { CircularProgress } from '@material-ui/core';
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
    minWidth: 450,
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'scroll',
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
    width: '450px',
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
    marginLeft: '400px',
    marginRight: '50px',
    marginBottom: '20px',
  },
  button: {
    height: 25,
    marginTop: 5,
    width: 100,
    marginBottom: 10,
  },
}));

type Props = {
  communityID: string;
  open: boolean;
  onClose: () => any;
  updateName: (name: string) => any;
  updateBio: (bio: string) => any;
  updateDesc: (desc: string) => any;
  updateType: (type: CommunityType) => any;
  updateBanner: (banner: string | undefined) => any;
  updateProfile: (profile: string | undefined) => any;
  profilePicture?: string;
  banner?: string;
  editable: boolean;
  name: string;
  bio: string;
  desc: string;
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
  const [communityDesc, setCommunityDesc] = useState<string>(props.desc);
  const [communityType, setCommunityType] = useState<CommunityType>(props.type);
  const [communityBanner, setCommunityBanner] = useState<string | undefined>(banner);
  const [communityProfile, setCommunityProfile] = useState<string | undefined>(profilePicture);
  const [loading, setLoading] = useState(false);
  const [editErr, setEditErr] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [bioErr, setBioErr] = useState('');
  const [DescErr, setDescErr] = useState('');
  const [typeErr, setTypeErr] = useState('');

  async function handleSave() {
    const hasErrors = validateInput();
    if (hasErrors) {
      setLoading(false);
      return;
    }

    await handleUpdate().then(props.onClose);
    handleCallback();
  }

  function validateInput() {
    let hasErr = false;
    if (communityName === '') {
      setNameErr('Name is required.');
      hasErr = true;
    } else setNameErr('');

    if (communityBio === '') {
      setBioErr('Bio is required.');
      hasErr = true;
    } else setBioErr('');

    if (communityDesc === '') {
      setDescErr('Description is required.');
      hasErr = true;
    } else setDescErr('');

    if (!communityType) {
      setTypeErr('Community type is required.');
      hasErr = true;
    } else setTypeErr('');

    return hasErr;
  }

  function handleCallback() {
    if (props.name != communityName) {
      props.updateName(communityName);
    }
    if (props.bio != communityBio) {
      props.updateBio(communityBio);
    }
    if (props.desc != communityDesc) {
      props.updateDesc(communityDesc);
    }
    if (props.type != communityType) {
      props.updateType(communityType);
    }
    if (props.banner != communityBanner) {
      props.updateBanner(communityBanner);
    }
    if (props.profilePicture != communityProfile) {
      props.updateProfile(communityProfile);
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
      saveValue("bio", communityBio);
    }
    if (props.desc != communityDesc) {
      saveValue("description", communityDesc);
    }
    if (props.type != communityType) {
      saveValue("type", communityType);
    }
    if (props.banner != communityBanner) {
      saveValue("banner", communityBanner);
    }
    if (props.profilePicture != communityProfile) {
      saveValue("updateProfilePicture", communityProfile);
    }
    setLoading(false);
  }

  async function saveValue(type: string, value: string | CommunityType | undefined) {
    const { data } =
      type === 'banner' || type === 'updateProfilePicture'
      ? await makeRequest(
        'POST',
        `/api/images/community/${props.communityID}/${type}`,
        {image: value,}
      )
      : await makeRequest(
        'PUT',
        `/api/community/${props.communityID}/update?${type}=${value}`
      )

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
          currentPicture={communityBanner}
          preview={true}
          callback={setCommunityBanner}
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
            currentPicture={communityProfile}
            preview={true}
            callback={setCommunityProfile}
          />
          </div>
          <div className={styles.form}>
            <RSTextField
              variant="outlined"
              label="Community Name"
              defaultValue={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              error={nameErr !== ''}
              helperText={nameErr !== '' ? nameErr : null}
              className={styles.feild}
            />
            <RSTextField
              variant="outlined"
              label="Bio"
              className={styles.feild}
              defaultValue={communityBio}
              onChange={(e) => setCommunityBio(e.target.value)}
              error={bioErr !== ''}
              helperText={bioErr !== '' ? bioErr : null}
              rows={2}
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
            <RSTextField
              variant="outlined"
              label="Description"
              className={styles.feild}
              defaultValue={communityDesc}
              onChange={(e) => setCommunityDesc(e.target.value)}
              error={DescErr !== ''}
              helperText={DescErr !== '' ? DescErr : null}
              rows={3}
              multiline
            />
            {/* {renderTags()} PLACEHOLDER FUNCTION*/}
            <RSText color={Theme.error}>{editErr}</RSText>
          </div>
          <div className={styles.saveBtn}>
            <RSButtonV2
              variant="universitySecondary"
              className={styles.button}
              onClick={() => handleSave()}
            >
              {loading ? <CircularProgress size={30} /> : <RSText>Save</RSText>}
            </RSButtonV2>
          </div>
      </RSModal>
    </>
  );
}

export default EditCommunityModal;