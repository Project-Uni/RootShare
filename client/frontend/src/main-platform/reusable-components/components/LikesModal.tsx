import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Button } from '@material-ui/core';

import {connect} from 'react-redux';
import RSModal from './RSModal';

import { LeanUser } from '../../../helpers/types'
import ProfilePicture from '../../../base-components/ProfilePicture';
import RSText from '../../../base-components/RSText';
import { makeRequest } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  modal: {
    maxHeight: 500
  },
  loadingIndicator: {
    marginTop: 50
  }
}));

type Props = {
  open: boolean;
  postID: string;
  onClose: () => any;
  accessToken: string;
  refreshToken: string;
};

function LikesModal(props: Props) {
  const styles = useStyles();
  
  const [loading, setLoading] = useState(true);
  const [serverErr, setServerErr] = useState(false);
  const [users, setUsers] = useState<LeanUser[]>([]);

  useEffect(()=> {
    if(props.open) {
      setLoading(true);
      fetchData();
    }
  }, [props.open]);

  async function fetchData() {
    const { data } = await makeRequest('GET', `/api/posts/likes/${props.postID}`, {}, true, props.accessToken, props.refreshToken);
    if(data.success === 1) {
      setUsers(data.content.likes);
      setServerErr(false);
    } else {
      setServerErr(true);
    }
    setLoading(false)
  } 

  function renderContent() {
    return <div></div>
  }

  function renderSingleUser(user: LeanUser) {
    return <div style={{display: 'flex', justifyContent: 'space-between'}}>
      <div>
        <ProfilePicture borderRadius={40} height={40} width={40} type='profile' _id={'xxx'} />
        <RSText size={11}>Ashwin Mahesh</RSText>
      </div>
      <Button>Connect</Button>
    </div>
  }
  
  return (
    <RSModal open={props.open} title="Likes" onClose={props.onClose} className={styles.modal}>
      <div>
        {loading 
          ? <CircularProgress size={100} className={styles.loadingIndicator} /> 
          : serverErr
          ? <RSText>There was an error loading the likes</RSText>
          : renderContent()
        }
      </div>
    </RSModal>
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

export default connect(mapStateToProps, mapDispatchToProps)(LikesModal);