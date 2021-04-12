import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSLink, RSButtonV2, RSAvatar } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { putUpdateUserConnection } from '../../../api';
import { RIGHT_BAR_WIDTH } from '../RightSidebar';
import { capitalizeFirstLetter } from '../../../helpers/functions';

const MAX_DOCUMENTS = 4;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: RIGHT_BAR_WIDTH - 20,
    padding: 10,
    marginBottom: 20,
  },
  cardTitle: {
    paddingBottom: 15,
  },
  singleWrapper: {
    display: 'flex',
    width: RIGHT_BAR_WIDTH - 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  left: {},
  center: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 10,
  },
  accountType: {
    color: Theme.secondaryText,
    textAlign: 'left',
    wordWrap: 'break-word',
    maxWidth: 140,
  },
  name: {
    display: 'inline-block',
    color: Theme.primaryText,
    textAlign: 'left',
    wordWrap: 'break-word',
    maxWidth: 140,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: Theme.primaryText,
    },
  },
  right: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
  },
  button: {
    height: 20,
    marginTop: 7,
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.5s',
  },
}));

export type Document = {
  _id: string;
  entityID: string;
  fileName: string;
  url: string;
};

type Props = {
  // children?: JSX.Element | JSX.Element[] | string | number;
  documents: Document[];
  variant: 'user' | 'community';
  className?: string;
};

export const Documents = (props: Props) => {
  const styles = useStyles();
  const { variant, className } = props;

  const [documents, setDocuments] = useState(props.documents);

  useEffect(() => {
    setDocuments(props.documents);
  }, [props.documents]);

  const removeDocument = (documentID: string) => {
    // need an api call for this
    // let newDocuments = users.slice();
    // for (let i = 0; i < users.length; i++) {
    //   const currUser = users[i];
    //   if (currUser._id === userID) {
    //     newDocuments.splice(i, 1);
    //     setUsers(newDocuments);
    //     return;
    //   }
    // }
  };

  const renderDocuments = () => {
    const output: any = [];
    const limit = Math.min(MAX_DOCUMENTS, documents.length);

    for (let i = 0; i < limit; i++) {
      const currDocument = documents[i];
      output.push(
        <SingleDocument
          key={currDocument._id}
          fileName={currDocument.fileName}
          url={currDocument.url}
          // removeUser={removeUser}
        />
      );
    }
    return output;
  };

  if (documents.length === 0) return <></>;

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} background="secondary">
      <RSText className={styles.cardTitle} size={16} bold>
        {`${capitalizeFirstLetter(variant)} Documents`}
      </RSText>
      {renderDocuments()}
    </RSCard>
  );
};

type SingleProps = {
  fileName: string;
  url: string;
  // removeUser: (userID: string) => void;
};

const SingleDocument = (props: SingleProps) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const { fileName, url /*removeUser*/ } = props;

  const [visible, setVisible] = useState(true);

  // const requestConnection = async () => {
  //   removeSuggestion();

  //   const data = await putUpdateUserConnection('connect', user._id);

  //   if (data.success === 1)
  //     dispatch(
  //       dispatchSnackbar({
  //         message: `Connection request sent to ${user.firstName} ${user.lastName}`,
  //         mode: 'success',
  //       })
  //     );
  //   else
  //     dispatch(
  //       dispatchSnackbar({
  //         message: `There was an error sending a request to ${user.firstName} ${user.lastName}`,
  //         mode: 'error',
  //       })
  //     );
  // };

  const removeSuggestion = () => {
    setVisible(false);
    setTimeout(() => {
      // removeUser(user._id);
    }, 500);
  };

  return (
    <div className={[styles.singleWrapper, visible || styles.fadeOut].join(' ')}>
      <a href={url}></a>
      <div className={styles.left}>{/* <DocumentIcon/> */}</div>
      <div className={styles.center}>
        <RSText size={13} className={styles.name}>
          {fileName}
        </RSText>
      </div>

      {/* <div className={styles.right}>
        <RSButtonV2
          className={styles.button}
          onClick={requestConnection}
          variant="university"
        >
          <RSText size={10}>Connect</RSText>
        </RSButtonV2>
        <RSButtonV2
          className={styles.button}
          onClick={removeSuggestion}
          variant="universitySecondary"
        >
          <RSText size={10} weight="light">
            Remove
          </RSText>
        </RSButtonV2>
      </div> */}
    </div>
  );
};
