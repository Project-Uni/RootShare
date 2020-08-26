import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button } from '@material-ui/core';
import { FaCamera } from 'react-icons/fa';

import { connect } from 'react-redux';

import RSText from '../../../base-components/RSText';
import { colors } from '../../../theme/Colors';

//FOR TESTING PURPOSE
import { AshwinHeadshot } from '../../../images/team';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  postProfilePic: {
    height: 50,
    borderRadius: 50,
    marginTop: 1,
  },
  messageAreaWrapper: {
    background: colors.primaryText,
    borderRadius: 1,
    marginLeft: 1,
    marginRight: 1,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 0,
    marginBottom: 1,
  },
  messageArea: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  newPostTextField: {
    width: '100%',
    background: colors.primaryText,
    borderRadius: 10,
    [`& fieldset`]: {
      borderRadius: 10,
    },
  },
  textFieldContainer: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    background: colors.bright,
    color: colors.primaryText,
    marginLeft: 10,
    marginRight: 1,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    background: 'lightgrey',
    color: colors.primaryText,
    marginLeft: 10,
    marginRight: 1,
  },
}));

type Props = {
  accessToken: string;
  refreshToken: string;
};

function MakePostContainer(props: Props) {
  const styles = useStyles();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<{
    status: 0 | 1;
    message: string;
  }>();

  function handleMessageChange(event: any) {
    setMessage(event.target.value);
  }

  async function handlePostClicked() {
    setLoading(true);
    setServerMessage(undefined);

    const { data } = await makeRequest(
      'POST',
      '/api/posts/create',
      { message },
      true,
      props.accessToken,
      props.refreshToken
    );

    setLoading(false);

    console.log(data);

    if (data.success === 1) {
      setMessage('');
      setServerMessage({ status: 1, message: 'Successfully created post.' });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 5000);
    } else {
      setServerMessage({
        status: 0,
        message: 'There was an error creating your post.',
      });
      setTimeout(() => {
        setServerMessage(undefined);
      }, 10000);
    }
  }

  function handleImageClicked() {
    console.log('Clicked image');
  }

  return (
    <div className={styles.messageAreaWrapper}>
      <div className={styles.messageArea}>
        <img src={AshwinHeadshot} className={styles.postProfilePic} alt="Profile" />
        <div className={styles.textFieldContainer}>
          <TextField
            variant="outlined"
            placeholder="Whats on your mind Ashwin?"
            multiline
            className={styles.newPostTextField}
            value={message}
            onChange={handleMessageChange}
          />
        </div>
      </div>
      <div className={styles.buttonContainer}>
        {serverMessage ? (
          <RSText
            color={serverMessage.status === 1 ? colors.success : colors.brightError}
            italic
          >
            {serverMessage.message}
          </RSText>
        ) : (
          <span />
        )}
        <div>
          <Button
            className={loading ? styles.disabledButton : styles.button}
            onClick={handleImageClicked}
            disabled={loading}
          >
            <FaCamera size={12} color={colors.primaryText} />
            <span style={{ marginLeft: 10 }} />
            Image
          </Button>
          <Button
            className={
              loading || message === '' ? styles.disabledButton : styles.button
            }
            onClick={handlePostClicked}
            disabled={loading || message === ''}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(MakePostContainer);
