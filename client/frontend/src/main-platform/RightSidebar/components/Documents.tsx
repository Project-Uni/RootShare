import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard, RSAvatar } from '../../reusable-components';
import { RSText } from '../../../base-components';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import { GrDocumentPdf } from 'react-icons/gr';

import { deleteDocuments } from '../../../api';
import { RIGHT_BAR_WIDTH } from '../RightSidebar';
import { capitalizeFirstLetter } from '../../../helpers/functions';
import { NoDocumentsIcon } from '../../../images';
import Theme from '../../../theme/Theme';

const MAX_DOCUMENTS = 4;

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    width: RIGHT_BAR_WIDTH - 20,
    padding: 10,
    paddingBottom: 20,
    marginBottom: 20,
  },
  cardTitle: {
    alignSelf: 'center',
    paddingBottom: 15,
  },
  link: {
    display: 'flex',
    color: 'inherit',
    margin: 5,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  documentContainer: {
    display: 'flex',
    width: '100%',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  removeButton: {
    '&:hover': {
      cursor: 'pointer',
    },
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
  editable: boolean;
  className?: string;
};

export const Documents = (props: Props) => {
  const styles = useStyles();
  const { variant, editable, className } = props;

  const [documents, setDocuments] = useState(props.documents);

  useEffect(() => {
    setDocuments(props.documents);
  }, [props.documents]);

  const removeDocument = (documentID: string) => {
    console.log(documents);
    setDocuments((prevDocuments) => {
      const newDocuments = prevDocuments.slice();
      for (let i = 0; i < newDocuments.length; i++)
        if (newDocuments[i]._id === documentID) {
          newDocuments.splice(i, 1);
          return newDocuments;
        }
      return prevDocuments;
    });
  };

  const renderDocuments = () => {
    const output: any = [];
    const limit = Math.min(MAX_DOCUMENTS, documents.length);

    for (let i = 0; i < limit; i++) {
      const currDocument = documents[i];
      output.push(
        <SingleDocument
          key={currDocument._id}
          documentID={currDocument._id}
          fileName={currDocument.fileName}
          entityID={currDocument.entityID}
          entityType={variant}
          url={currDocument.url}
          editable={editable}
          removeDocument={removeDocument}
        />
      );
    }
    return output;
  };

  return (
    <RSCard className={[styles.wrapper, className].join(' ')} background="secondary">
      <RSText className={styles.cardTitle} size={16} bold>
        {`${capitalizeFirstLetter(variant)} Documents`}
      </RSText>
      {documents.length === 0 ? (
        <div
          style={{
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <RSAvatar
            style={{ padding: 5 }}
            variant="square"
            size={100}
            src={NoDocumentsIcon}
          />

          <RSText color={Theme.secondaryText} weight="light">
            No documents uploaded yet
          </RSText>
        </div>
      ) : (
        renderDocuments()
      )}
    </RSCard>
  );
};

type SingleProps = {
  documentID: string;
  fileName: string;
  entityID: string;
  entityType: 'user' | 'community';
  url: string;
  editable: boolean;
  removeDocument: (documentID: string) => void;
};

const SingleDocument = (props: SingleProps) => {
  const styles = useStyles();

  const dispatch = useDispatch();

  const { documentID, fileName, entityID, entityType, url, editable } = props;

  const [visible, setVisible] = useState(true);

  const removeDocument = async () => {
    transitionDocument();

    const data = await deleteDocuments(entityID, entityType, [documentID]);

    if (data.success === 1)
      dispatch(
        dispatchSnackbar({
          message: `Successfully deleted document`,
          mode: 'success',
        })
      );
    else
      dispatch(
        dispatchSnackbar({
          message: `There was an error deleting the document`,
          mode: 'error',
        })
      );
  };

  const transitionDocument = () => {
    setVisible(false);
    setTimeout(() => {
      props.removeDocument(documentID);
    }, 500);
  };

  return (
    <div className={[styles.documentContainer, visible || styles.fadeOut].join(' ')}>
      <a target="_blank" href={url} className={styles.link}>
        <GrDocumentPdf style={{ paddingTop: 2, paddingRight: 5 }} />
        <RSText
          weight="bold"
          style={{ wordWrap: 'break-word', maxWidth: 220, textAlign: 'left' }}
        >
          {fileName}
        </RSText>
      </a>
      <div style={{ flex: 1 }} />
      {editable && (
        <DeleteOutlineIcon
          className={styles.removeButton}
          onClick={() => removeDocument()}
        />
      )}
    </div>
  );
};
