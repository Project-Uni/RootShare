import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { dispatchSnackbar } from '../../../redux/actions';
import { useDispatch } from 'react-redux';

import { RSCard } from '../../reusable-components';
import { RSText } from '../../../base-components';

import Theme from '../../../theme/Theme';
import { getCommunityAbout, CommunityAboutServiceResponse } from '../../../api/get';
import { LeanUser } from '../../../helpers/types';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginTop: 20,
  },
  aboutWrapper: {
    padding: 50,
    textAlign: 'left',
  },
  bodyText: {
    color: Theme.secondaryText,
  },
}));

type Props = {
  communityID: string;
  editable?: boolean;
};

export const CommunityAbout = (props: Props) => {
  const styles = useStyles();

  const { communityID, editable } = props;

  const [aboutInfo, setAboutInfo] = useState<CommunityAboutServiceResponse>();

  const dispatch = useDispatch();

  useEffect(() => {
    fetchCommunityAbout();
  });

  const fetchCommunityAbout = async () => {
    const data = await getCommunityAbout(communityID);
    if (data.success === 1) return setAboutInfo(data.content);

    dispatch(
      dispatchSnackbar({
        message: 'There was an error retrieving information about this community',
        mode: 'error',
      })
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* <AboutCard aboutDesc={aboutDesc} editable={editable} />
      <AdminsCard
        admin={admin}
        moderators={moderators}
        editable={editable}
        style={{ marginTop: 20 }}
      />
      <p>Members?</p> */}
    </div>
  );
};

// const AboutCard = (props: {
//   aboutDesc?: string;
//   editable?: boolean;
//   style?: React.CSSProperties;
//   className?: string;
// }) => {
//   const styles = useStyles();
//   const { aboutDesc, editable, className, style } = props;

//   return (
//     <RSCard style={style} className={[styles.aboutWrapper, className].join(' ')}>
//       <RSText bold type="head">
//         About
//       </RSText>
//       <RSText className={styles.bodyText}>{aboutDesc}</RSText>
//     </RSCard>
//   );
// };

// const AdminsCard = (props: {
//   admin: Props['admin'];
//   moderators: Props['moderators'];
//   editable?: boolean;
//   style?: React.CSSProperties;
//   className?: string;
// }) => {
//   const styles = useStyles();
//   const { admin, moderators, editable, className, style } = props;

//   return (
//     <RSCard
//       style={{ ...style, padding: 50, textAlign: 'left' }}
//       className={className}
//     >
//       <RSText bold type="head">
//         Admins
//       </RSText>
//       <span>Render admin area here</span>
//     </RSCard>
//   );
// };
