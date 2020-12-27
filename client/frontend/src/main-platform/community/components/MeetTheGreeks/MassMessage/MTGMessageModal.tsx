import React, { useCallback, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { BigButton, RSModal } from '../../../../reusable-components';
import { RSText } from '../../../../../base-components';
import theme from '../../../../../theme/Theme';

import { FiMessageSquare } from 'react-icons/fi';

import RichTextEditor from 'react-rte';
import { usePrevious } from '../../../../../hooks';
import { makeRequest } from '../../../../../helpers/functions';

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

  const [serverErr, setServerErr] = useState('');
  const [loading, setLoading] = useState(false);

  const [stage, setStage] = useState<Stage>('selection');
  const previousStage = usePrevious(stage);
  const [emailValue, setEmailValue] = useState(RichTextEditor.createEmptyValue());

  const selectionStage = () => (
    <>
      <BigButton label="Email" onClick={() => setStage('email')} />
      <BigButton label="Text" onClick={() => setStage('text')} />
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
          console.log('Email Message:', emailValue.toString('html'));
          setStage('confirmation');
        }}
      />
    </div>
  );

  const confirmationStage = () => (
    <div style={{ marginTop: 10, marginLeft: 15, marginRight: 15 }}>
      <RSText type="head" size={12} bold>
        Confirm the message that you are sending
      </RSText>
      <div
        dangerouslySetInnerHTML={{ __html: emailValue.toString('html') }}
        style={{ borderTop: `1px solid lightgrey`, marginTop: 15 }}
      />
      <BigButton label="next" onClick={sendMessage} loading={loading} />
    </div>
  );

  const sendMessage = async () => {
    setLoading(true);
    setServerErr('');
    const { data } = await makeRequest(
      'PUT',
      `/api/mtg/communications/${props.communityID}?mode=${previousStage}`,
      { message: previousStage === 'email' ? emailValue.toString('html') : '' }
    );
    if (data.success === 1) {
      setEmailValue(RichTextEditor.createEmptyValue());
      onClose();
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
        return <p>Text</p>;
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
      <RSModal
        open={open}
        title={`Messaging - ${communityName}`}
        onClose={onClose}
        className={styles.modal}
        helperText={
          'Send a message to everyone who is interested in your fraternity'
        }
        helperIcon={<FiMessageSquare size={60} />}
        onBackArrow={getBackArrowFunction()}
      >
        {chooseStage()}
      </RSModal>
    </>
  );
}

export default MTGMessageModal;
