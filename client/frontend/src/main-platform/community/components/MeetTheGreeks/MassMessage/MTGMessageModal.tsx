import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';

import { FiMessageSquare } from 'react-icons/fi';
import { AiOutlineMail } from 'react-icons/ai';
import { RiMessage2Line } from 'react-icons/ri';

import RichTextEditor from 'react-rte';

import theme from '../../../../../theme/Theme';

import { usePrevious } from '../../../../../helpers/hooks';
import { makeRequest, slideLeft } from '../../../../../helpers/functions';

import { BigButton, RSModal } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';

import ManageSpeakersSnackbar from '../../../../../event-client/event-video/event-host/ManageSpeakersSnackbar';

const useStyles = makeStyles((_: any) => ({
  modal: {
    maxHeight: 700,
    overflow: 'scroll',
    width: 500,
  },
  richEditor: {
    height: 300,
    marginTop: 10,
  },
  emailHeader: {
    marginLeft: 15,
    marginRight: 15,
  },
  confirmedMessage: {
    marginTop: 15,
  },
}));

type Props = {
  open: boolean;
  communityName: string;
  communityID: string;
  onClose: () => any;
};

type Stage = 'selection' | 'email' | 'text' | 'confirmation';

function MTGMessageModal(props: Props) {
  const styles = useStyles();

  const { open, communityName, communityID, onClose } = props;

  const [serverErr, setServerErr] = useState<string>();
  const [loading, setLoading] = useState(false);

  const [stage, setStage] = useState<Stage>('selection');
  const previousStage = usePrevious(stage);

  const [emailValue, setEmailValue] = useState(RichTextEditor.createEmptyValue());
  const [textValue, setTextValue] = useState('');
  const [textErr, setTextErr] = useState<string>();

  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();

  useEffect(() => {
    if (open) {
      setEmailValue(RichTextEditor.createEmptyValue());
      setTextValue('');
      setTextErr(undefined);
    }
  }, [open]);

  const selectionStage = () => (
    <>
      <BigButton
        label="Email"
        onClick={() => setStage('email')}
        icon={
          <AiOutlineMail
            color={theme.altText}
            size={24}
            style={{ marginRight: 10 }}
          />
        }
      />
      <BigButton
        label="Text"
        onClick={() => setStage('text')}
        icon={
          <FiMessageSquare
            color={theme.altText}
            size={24}
            style={{ marginRight: 10 }}
          />
        }
      />
    </>
  );

  const emailStage = () => (
    <div style={{ marginTop: 10 }}>
      <RSText type="head" size={12} bold className={styles.emailHeader}>
        Enter Email Message:
      </RSText>
      <RichTextEditor
        className={styles.richEditor}
        value={emailValue}
        onChange={(value) => setEmailValue(value)}
      />
      <BigButton
        label="next"
        onClick={() => {
          // console.log('Email Message:', emailValue.toString('html'));
          setStage('confirmation');
        }}
      />
    </div>
  );

  const textStage = () => (
    <div style={{ marginTop: 10, marginLeft: 15, marginRight: 15 }}>
      <RSText type="head" size={12} bold>
        Enter Text Message:
      </RSText>
      <TextField
        multiline
        rows={4}
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        fullWidth
        variant="outlined"
        style={{ marginTop: 10 }}
        label="Message"
        error={Boolean(textErr)}
        helperText={textErr}
      />
      <BigButton
        label="next"
        onClick={() => {
          if (textValue.length <= 5) {
            setTextErr('Please enter a longer message');
          } else {
            setTextErr(undefined);
            setStage('confirmation');
          }
        }}
      />
    </div>
  );

  const confirmationStage = () => (
    <div style={{ marginTop: 10, marginLeft: 15, marginRight: 15 }}>
      <RSText type="head" size={12} bold>
        Confirm the message that you are sending
      </RSText>
      {previousStage === 'email' ? (
        <div
          dangerouslySetInnerHTML={{ __html: emailValue.toString('html') }}
          style={{ borderTop: `1px solid lightgrey`, marginTop: 15 }}
        />
      ) : (
        <RSText className={styles.confirmedMessage}>{textValue}</RSText>
      )}
      <BigButton label="Send Message" onClick={sendMessage} loading={loading} />
    </div>
  );

  const sendMessage = async () => {
    setLoading(true);
    setServerErr(undefined);
    const { data } = await makeRequest(
      'PUT',
      `/api/mtg/communications/${communityID}?mode=${previousStage}`,
      {
        message: previousStage === 'email' ? emailValue.toString('html') : textValue,
      }
    );
    if (data.success === 1) {
      setEmailValue(RichTextEditor.createEmptyValue());
      onClose();
      setTransition(() => slideLeft);
      setSnackbarMode('notify');
      setStage('selection');
    } else {
      setServerErr(data.message);
    }
    setLoading(false);
  };

  const chooseStage = () => {
    switch (stage) {
      case 'email':
        return emailStage();
      case 'text':
        return textStage();
      case 'confirmation':
        return confirmationStage();
      case 'selection':
      default:
        return selectionStage();
    }
  };

  const getBackArrowFunction = useCallback(() => {
    switch (stage) {
      case 'email':
      case 'text':
        return () => setStage('selection');
      case 'confirmation':
        return () => setStage(previousStage as Stage);
      case 'selection':
      default:
        return undefined;
    }
  }, [stage]);

  return (
    <>
      <ManageSpeakersSnackbar
        message={'Successfully sent message!'}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <RSModal
        open={open}
        title={`Messaging - ${communityName}`}
        onClose={() => {
          setStage('selection');
          onClose();
        }}
        className={styles.modal}
        helperText={
          'Send a message to everyone who is interested in your community. Please keep in mind that all communications will have your organization name attached to it.'
        }
        helperIcon={<RiMessage2Line size={60} />}
        onBackArrow={getBackArrowFunction()}
        serverErr={serverErr}
      >
        {chooseStage()}
      </RSModal>
    </>
  );
}

export default MTGMessageModal;
