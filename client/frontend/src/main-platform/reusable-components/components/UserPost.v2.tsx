import React, { useRef, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSCard } from './RSCard';
import { Avatar, IconButton } from '@material-ui/core';
import { FaEllipsisH, FaLeaf, FaRegComment } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../../redux/store/stateManagement';
import { DynamicIconButton, RSText } from '../../../base-components';
import Theme from '../../../theme/Theme';
import mtgBanner from '../../../images/mtgBanner.png';
import { RSTextField } from './RSTextField';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  likes: {
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    zIndex: 2,
  },
}));

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export const UserPost = (props: Props) => {
  const styles = useStyles();
  const { className, style } = props;

  const user = useSelector((state: RootshareReduxState) => state.user);
  const [showCommentField, setShowCommentField] = useState(false);

  const handleSproutClick = () => {};

  const handleCommentClick = () => {
    setShowCommentField(true);
  };

  return (
    <RSCard
      variant="secondary"
      style={{ paddingTop: 20, paddingBottom: 20, ...style }}
      className={className}
    >
      <div
        id="top"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginLeft: 30,
          marginRight: 30,
        }}
      >
        <div
          id="avatar-and-name"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Avatar src={user.profilePicture} style={{ height: 70, width: 70 }} />
          <div id="name-and-info" style={{ textAlign: 'left', marginLeft: 15 }}>
            <RSText bold>Dhruv Bhargava</RSText>
            <RSText size={10} color={Theme.secondaryText}>
              Cybersecurity 2020 | Analyst @ Crowe
            </RSText>
            <RSText size={10} color={Theme.secondaryText}>
              Feb 28
            </RSText>
          </div>
        </div>
        <IconButton style={{ height: '100%' }}>
          <FaEllipsisH size={20} />
        </IconButton>
      </div>
      <RSText
        style={{
          marginLeft: 30,
          marginRight: 30,
          marginTop: 20,
          marginBottom: 25,
          textAlign: 'left',
        }}
        size={11}
        color={Theme.secondaryText}
      >
        Bacon ipsum dolor amet beef meatloaf ribeye short ribs boudin pork. Ribeye
        t-bone beef flank, doner hamburger kielbasa pork loin biltong chicken
        picanha. Ground round shankle short loin, spare ribs meatloaf short ribs pig
        tenderloin. Boudin buffalo shank brisket cupim. Pork biltong meatball, tail
        pig shank bacon alcatra pork belly turducken fatback venison pork loin.
        Biltong kielbasa tongue corned beef, hamburger tenderloin meatloaf drumstick
        alcatra pork belly pork loin tail strip steak. Flank landjaeger venison spare
        ribs andouille. <span style={{ display: 'block', marginTop: 10 }}></span>Pork
        chop flank porchetta strip steak, boudin ground round turkey ham salami
        chicken beef ribs hamburger. Beef ribs swine shank salami pork belly.
        Turducken buffalo capicola fatback short loin pancetta sausage swine.
        Porchetta ham hock meatloaf kielbasa ham jowl. Beef ribs leberkas buffalo
        boudin rump shank bresaola pig pork chop doner ham brisket.
      </RSText>
      <img
        src={mtgBanner}
        style={{ height: 300, width: '100%', objectFit: 'cover' }}
      />
      <div
        id="likes-and-comment-counts"
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginLeft: 30,
          marginRight: 30,
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        <RSText color={Theme.secondaryText} className={styles.likes}>
          87 Sprouts
        </RSText>
        <RSText
          color={Theme.secondaryText}
          className={styles.likes}
          style={{ marginLeft: 15 }}
        >
          15 Comments
        </RSText>
      </div>
      <div
        id="action-icons"
        style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'flex-start',
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        <DynamicIconButton onClick={handleSproutClick}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaLeaf />
            <RSText size={12} color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Sprout
            </RSText>
          </div>
        </DynamicIconButton>
        <DynamicIconButton onClick={handleCommentClick}>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
            }}
          >
            <FaRegComment />
            <RSText size={12} color={Theme.secondaryText} style={{ marginLeft: 10 }}>
              Comment
            </RSText>
          </div>
        </DynamicIconButton>
      </div>
      <div style={{ marginLeft: 20, marginRight: 20 }}>
        {showCommentField ? (
          <RSTextField label={'Add a comment...'} variant="outlined" fullWidth />
        ) : (
          <></>
        )}
      </div>
    </RSCard>
  );
};
