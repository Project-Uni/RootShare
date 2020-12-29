import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { SearchOption } from '../../../../reusable-components/components/UserSearch';
import { Avatar, IconButton } from '@material-ui/core';
import { RSText } from '../../../../../base-components';
import theme from '../../../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({
  speakerLabel: {
    marginLeft: 15,
  },
  hostLabel: {
    marginLeft: 10,
  },
}));

type Props = {
  speakers: SearchOption[];
  removeSpeaker: (idx: number) => void;
};

function MeetTheGreeksSpeakers(props: Props) {
  const styles = useStyles();

  const { speakers, removeSpeaker } = props;

  return (
    <>
      {speakers.map((speaker, idx) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar src={speaker.profilePicture} alt={speaker.label} sizes="50px" />
            <RSText size={13} bold className={styles.speakerLabel}>
              {speaker.label}
            </RSText>
            {idx === 0 && (
              <RSText
                size={12}
                italic
                color={theme.secondaryText}
                className={styles.hostLabel}
              >
                (Host)
              </RSText>
            )}
          </div>
          <IconButton onClick={() => removeSpeaker(idx)}>
            <RSText>X</RSText>
          </IconButton>
        </div>
      ))}
    </>
  );
}

export default MeetTheGreeksSpeakers;
