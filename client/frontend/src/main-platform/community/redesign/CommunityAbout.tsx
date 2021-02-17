import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSCard } from '../../reusable-components';
import { RSText } from '../../../base-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 20,
  },
}));

type Props = {
  admin: any; //Populated admin type
  moderators?: any[]; //Populated Moderator type
  aboutDesc?: string;
  editable?: boolean;
};

export const CommunityAbout = (props: Props) => {
  const styles = useStyles();

  const { admin, moderators, aboutDesc, editable } = props;

  return (
    <div className={styles.wrapper}>
      <AboutCard aboutDesc={aboutDesc} editable={editable} />
      <AdminsCard
        admin={admin}
        moderators={moderators}
        editable={editable}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

const AboutCard = (props: {
  aboutDesc?: string;
  editable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const styles = useStyles();
  const { aboutDesc, editable, className, style } = props;

  return (
    <RSCard
      style={{ ...style, padding: 50, textAlign: 'left' }}
      className={className}
    >
      <RSText bold type="head">
        About
      </RSText>
      <RSText>About description</RSText>
    </RSCard>
  );
};

const AdminsCard = (props: {
  admin: Props['admin'];
  moderators: Props['moderators'];
  editable?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const styles = useStyles();
  const { admin, moderators, editable, className, style } = props;

  return (
    <RSCard
      style={{ ...style, padding: 50, textAlign: 'left' }}
      className={className}
    >
      <RSText bold type="head">
        Admins
      </RSText>
      <span>Render admin area here</span>
    </RSCard>
  );
};
