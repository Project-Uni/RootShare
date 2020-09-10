import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@material-ui/core';
import { Select, MenuItem } from '@material-ui/core';
import Draggable from 'react-draggable';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import RSText from '../base-components/RSText';
import { colors } from '../theme/Colors';
import BugTextField from './BugTextField';

const useStyles = makeStyles((_: any) => ({
  paper: {
    background: colors.second,
    width: 500,
    height: 400,
  },
  mobileText: {
    marginTop: 20,
  },
  okButton: {
    flex: 1,
    right: 0,
    bottom: 0,
    position: 'absolute',
    margin: 20,
    color: colors.primaryText,
  },
  select: {
    marginTop: 20,
    width: 450,
    background: colors.fourth,
    color: colors.primaryText,
    label: colors.primaryText,
  },
}));

type Props = {
  open: boolean;
  onClick: () => any;
};

function BugModal(props: Props) {
  const styles = useStyles();

  const BugTypes = [
    'Bug #1',
    'Bug #2',
    'Bug #3',
    'Bug #4',
    'Bug #5',
    'Bug #6',
    'Bug #7',
    'Bug #8',
    'Bug #9',
  ];

  const [title, setTitle] = useState('');
  const [type, setType] = useState('Bug #1');
  const [description, setDescription] = useState('');

  function changeTitle(event: any) {
    setTitle(event.target.value);
  }

  function changeType(event: any) {
    setType(event.target.value);
  }

  function changeDescription(event: any) {
    setDescription(event.target.value);
  }

  return (
    <Dialog open={props.open} PaperComponent={PaperComponent}>
      <DialogTitle>
        <RSText type="head" size={16} bold color={colors.primaryText}>
          Report A Bug
        </RSText>
      </DialogTitle>
      <DialogContent>
        <div>
          <BugTextField
            label="Title"
            value={title}
            onChange={changeTitle}
            width={450}
          ></BugTextField>
        </div>
        <Select
          className={styles.select}
          variant="outlined"
          value={type}
          onChange={changeType}
          label={type}
        >
          {BugTypes.map((singleBug) => (
            <MenuItem value={singleBug}>{singleBug}</MenuItem>
          ))}
        </Select>
        <div>
          <BugTextField
            label="Description"
            value={description}
            onChange={changeDescription}
            width={450}
          ></BugTextField>
        </div>
      </DialogContent>
      <DialogActions>
        <Button className={styles.okButton} onClick={props.onClick}>
          SUBMIT
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PaperComponent(props: PaperProps) {
  const styles = useStyles();
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} className={styles.paper} square={false} />
    </Draggable>
  );
}

export default BugModal;
