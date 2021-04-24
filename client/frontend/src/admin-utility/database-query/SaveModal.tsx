import React, { useEffect, useState } from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';
import {
  RSButton,
  RSModal,
  RSTextField,
} from '../../main-platform/reusable-components';

import { TwitterPicker } from 'react-color';
import Theme from '../../theme/Theme';
import { RSText } from '../../base-components';
import { Model } from '../../helpers/constants/databaseQuery';
import { postSaveAdminDBQuery } from '../../api';
import { useDispatch } from 'react-redux';
import { dispatchSnackbar } from '../../redux/actions';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  wrapper: {
    width: '400px',
  },
  mt10: {
    marginTop: 10,
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
  model: Model;
  selectedFields: string[];
  populates: {
    path: string;
    select: string[];
    populate?: { path: string; select: string[] };
  }[];
  query: string;
  limit: string;
  sort: { field: string; order: 1 | -1 };
};

export const SaveModal = (props: Props) => {
  const { open, onClose, ...saveValues } = props;
  const styles = useStyles();

  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(Theme.bright);

  const [titleErr, setTitleErr] = useState('');
  const [descErr, setDescErr] = useState('');

  const [loading, setLoading] = useState(false);

  const reset = () => {
    if (title) setTitle('');
    if (description) setDescription('');
    if (titleErr) setTitleErr('');
    if (descErr) setDescErr('');
  };

  const validate = () => {
    let valid = true;
    if (!title) {
      valid = false;
      setTitleErr('Title is required');
    }
    if (!description) {
      valid = false;
      setDescErr('Description is required');
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);

    const data = await postSaveAdminDBQuery({
      ...saveValues,
      displayColor: color,
      title,
      description,
    });

    if (data.success === 1) {
      onClose();
      dispatch(
        dispatchSnackbar({ mode: 'notify', message: 'Successfully saved query' })
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  return (
    <>
      <RSModal
        open={open}
        onClose={onClose}
        title="Save Query"
        helperText="Save your query for easy reuse"
        className={styles.wrapper}
      >
        <div style={{ padding: 15 }}>
          <RSTextField
            label="Title"
            helperText="Query Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
            className={styles.mt10}
          />
          <RSTextField
            label="Description"
            helperText="Description for the query"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            variant="outlined"
            rows={4}
            fullWidth
            className={styles.mt10}
          />
          <RSText bold type="head">
            Display Color
          </RSText>
          <TwitterPicker
            color={color}
            onChangeComplete={(newColor) => setColor(newColor.hex)}
            className={styles.mt10}
          />
          <RSButton
            style={{ width: '100%', background: loading ? undefined : color }}
            className={styles.mt10}
            onClick={handleSave}
            loading={loading}
            disabled={loading}
          >
            Save
          </RSButton>
        </div>
      </RSModal>
    </>
  );
};
