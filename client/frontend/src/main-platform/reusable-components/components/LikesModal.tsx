import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Button, Box } from '@material-ui/core';

import {connect} from 'react-redux';
import RSModal from './RSModal';

import { LeanUser } from '../../../helpers/types'
import ProfilePicture from '../../../base-components/ProfilePicture';
import RSText from '../../../base-components/RSText';
import { makeRequest } from '../../../helpers/functions';
import { colors } from '../../../theme/Colors';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  modal: {
    maxHeight: 500,
    overflow: 'scroll',
    width: 400,
  },
  loadingIndicator: {
    color: colors.primary
  },
  name: {
    color: 'inherit',
    textDecoration: 'none',
    marginLeft: 10,
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  singleUserWrapper: {
    display: 'flex', 
    justifyContent: 'space-between', 
    paddingLeft: 15, 
    paddingRight: 15,
    '&:hover': {
      background: colors.background
    },
    borderTop: `1px solid ${colors.background}`,
    paddingTop: 7,
    paddingBottom: 7
  },
  noLikesText: {
    marginLeft: 15,
    marginRight: 15,
    paddingBottom: 15
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
    return (
    <div>
      {users.length > 0 
      ? users.map(user => renderSingleUser(user)) 
      : <RSText className={styles.noLikesText} size={13}>
          There are no likes yet. Be the first
        </RSText>
      }
    </div>
    )
  }

  function renderSingleUser(user: LeanUser) {
    return <div style={{}} className={styles.singleUserWrapper}>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <a href={`/profile/${user._id}`}>
          <ProfilePicture 
            borderRadius={30} 
            height={45} 
            width={45} 
            type='profile' 
            _id={user._id} 
            currentPicture={user.profilePicture}
          />
        </a>
        <a href={`/profile/${user._id}`} className={styles.name}>
          <RSText size={13} bold>{user.firstName} {user.lastName}</RSText>
        </a>
      </div>
    </div>
  }
  
  return (
    <RSModal open={props.open} title="Likes" onClose={props.onClose} className={styles.modal}>
      <div>
        {loading 
          ? (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 15, paddingBottom: 15}}>
              <CircularProgress size={60} className={styles.loadingIndicator} />
            </div>
            )
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