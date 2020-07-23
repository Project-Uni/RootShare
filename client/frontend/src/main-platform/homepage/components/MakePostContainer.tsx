import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Button } from '@material-ui/core';
import { FaCamera } from 'react-icons/fa';

import { colors } from '../../../theme/Colors';

//FOR TESTING PURPOSE
import { AshwinHeadshot } from '../../../images/team';

const useStyles = makeStyles((_: any) => ({
  postProfilePic: {
    height: 50,
    borderRadius: 50,
    marginTop: 10,
  },
  messageAreaWrapper: {
    background: colors.secondary,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 20,
  },
  messageArea: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  newPostTextField: {
    width: '100%',
    background: colors.primaryText,
    borderRadius: 15,
  },
  textFieldContainer: {
    flex: 1,
    marginLeft: 10,
  },
  button: {
    background: colors.bright,
    color: colors.primaryText,
    marginLeft: 10,
    marginRight: 10,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
}));

type Props = {
  postValue: string;
  onChange: (event: any) => void;
  onPost: () => any;
  onUploadImage: () => any;
};

function MakePostContainer(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.messageAreaWrapper}>
      <div className={styles.messageArea}>
        <img src={AshwinHeadshot} className={styles.postProfilePic} alt="Profile" />
        {/* TODO - Update Style of this textfield */}
        <div className={styles.textFieldContainer}>
          <TextField
            variant="outlined"
            placeholder="Whats on your mind Ashwin?"
            multiline
            className={styles.newPostTextField}
            value={props.postValue}
            onChange={props.onChange}
          />
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <Button className={styles.button} onClick={props.onUploadImage}>
          <FaCamera size={12} color={colors.primaryText} />
          <span style={{ marginLeft: 10 }} />
          Image
        </Button>
        <Button className={styles.button} onClick={props.onPost}>
          Post
        </Button>
      </div>
    </div>
  );
}

export default MakePostContainer;
