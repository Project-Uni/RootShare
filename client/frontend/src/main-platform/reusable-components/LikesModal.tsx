import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import RSModal from './components/RSModal';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {
  open: boolean;
  onClose: () => any;
};

function LikesModal(props: Props) {
  const styles = useStyles();
  return (
    <RSModal open={props.open} title="Likes" onClose={props.onClose}>

    </RSModal>
  );
}

export default LikesModal;
