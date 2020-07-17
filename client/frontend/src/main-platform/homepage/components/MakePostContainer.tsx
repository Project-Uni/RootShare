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
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 15,
    paddingBottom: 15,
    marginTop: 20,
  },
  messageArea: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  newPostTextField: {
    color: 'white',
    marginLeft: 20,
    flex: 1,
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

function Template(props: Props) {
  const styles = useStyles();
  return (
    <div className={styles.messageAreaWrapper}>
      <div className={styles.messageArea}>
        <img src={AshwinHeadshot} className={styles.postProfilePic} alt="Profile" />
        {/* TODO - Update Style of this textfield */}
        <TextField
          variant="outlined"
          placeholder="Whats on your mind Ashwin?"
          multiline
          className={styles.newPostTextField}
          helperText="Share with the world whats on your mind!"
          value={props.postValue}
          onChange={props.onChange}
        />
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

export default Template;
