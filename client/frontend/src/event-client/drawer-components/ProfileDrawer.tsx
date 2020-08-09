import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import RSText from '../../base-components/RSText';
import { connect } from 'react-redux';
import { updateUser } from '../../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../../redux/actions/token';
import { makeRequest } from '../../helpers/makeRequest';
import { colors } from '../../theme/Colors';
import { TextField } from '@material-ui/core';

import ProfilePicture from '../../base-components/ProfilePicture';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '400px',
  },
  profilePicture: {
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameWrapper: {
    marginTop: 20,
  },
  name: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  static: {
    marginTop: 10,
    marginLeft: 20,
  },
  staticIndividual: {
    marginTop: 20,
  },
  update: {
    marginTop: 10,
    marginLeft: 20,
  },
  button: {
    marginRight: 20,
    marginTop: 20,
    color: colors.primaryText,
    background: colors.bright,
  },
  buttonWrapper: {
    textAlign: 'right',
  },
}));

type Props = {
  user: { [key: string]: any };
};

function ProfileDrawer(props: Props) {
  const styles = useStyles();
  const [currentPicture, setCurrentPicture] = useState<string>();
  const [imageLoaded, setImagedLoaded] = useState(false);
  const [edit, setEdit] = useState(false);

  function editOnClick() {
    setEdit(!edit);
  }

  useEffect(() => {
    getCurrentProfilePicture();
  }, []);

  async function getCurrentProfilePicture() {
    const { data } = await makeRequest(
      'GET',
      `/api/getProfilePicture/${props.user._id}`
    );

    if (data['success'] === 1) {
      setCurrentPicture(data['content']['imageURL']);
    }
    setImagedLoaded(true);
  }

  function updateCurrentPicture(imageData: string) {
    setCurrentPicture(imageData);
  }

  function returnSaveButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button
          onClick={() => {
            editOnClick();
          }}
          className={styles.button}
        >
          SAVE
        </Button>
      </div>
    );
  }

  function returnEditButton() {
    return (
      <div className={styles.buttonWrapper}>
        <Button
          onClick={() => {
            editOnClick();
          }}
          className={styles.button}
        >
          EDIT
        </Button>
      </div>
    );
  }

  function returnNameAndEmail() {
    return (
      <div className={styles.nameWrapper}>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.name}
          bold
        >
          First Last
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.name}
        >
          email@email.com
        </RSText>
      </div>
    );
  }

  function returnUpdate() {
    return (
      <div>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        {returnSaveButton()};
      </div>
    );
  }
  function returnStatic() {
    return (
      <div className={styles.static}>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Major:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduation Year:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Current Employer:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Current Role:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          College:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Interests:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Organizations:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Graduate Degree:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Phone Number:
        </RSText>
        <RSText
          type="body"
          size={12}
          color={colors.primaryText}
          className={styles.staticIndividual}
        >
          Discovery Method:
        </RSText>
        {returnEditButton()};
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      {imageLoaded && (
        <ProfilePicture
          className={styles.profilePicture}
          editable
          height={150}
          width={150}
          borderRadius={150}
          currentPicture={currentPicture}
          updateCurrentPicture={updateCurrentPicture}
        />
      )}
      {returnNameAndEmail()};{!edit && returnStatic()};{edit && returnUpdate()};
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileDrawer);
