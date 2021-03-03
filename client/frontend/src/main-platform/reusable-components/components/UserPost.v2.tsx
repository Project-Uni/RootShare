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
import { MdSend } from 'react-icons/md';

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
  const [showComments, setShowComments] = useState(false);

  const handleSproutClick = () => {};

  const handleCommentIconClick = () => {
    setShowCommentField((prev) => !prev);
  };
  const handleCommentTextClick = () => {
    setShowComments((prev) => !prev);
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
          alignItems: 'flex-start',
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
          <Avatar src={undefined} style={{ height: 70, width: 70 }} />
          <div id="name-and-info" style={{ textAlign: 'left', marginLeft: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RSText bold>Dhruv Bhargava</RSText>
              <FaLeaf size={20} style={{ marginLeft: 15, marginRight: 15 }} />
              <RSText bold>RootShare Developers</RSText>
            </div>
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
          onClick={handleCommentTextClick}
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
        <DynamicIconButton onClick={handleCommentIconClick}>
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

      {showCommentField ? (
        <div
          style={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 10,
            display: 'flex',
          }}
        >
          <RSTextField label={'Add a comment...'} variant="outlined" fullWidth />
          <DynamicIconButton onClick={() => {}}>
            <MdSend size={22} color={Theme.bright} />
          </DynamicIconButton>
        </div>
      ) : (
        <></>
      )}

      {showComments ? (
        <div id="comments">
          <Comment />
          <Comment style={{ marginTop: 10 }} />
        </div>
      ) : (
        <></>
      )}
      <RSText
        className={styles.likes}
        size={13}
        style={{ textAlign: 'left', marginLeft: 20, marginRight: 20, marginTop: 20 }}
        color={Theme.secondaryText}
      >
        Load More Comments
      </RSText>
    </RSCard>
  );
};

type CommentProps = {
  className?: string;
  style?: React.CSSProperties;
};
const Comment = (props: CommentProps) => {
  const { className, style } = props;
  const styles = useStyles();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginLeft: 20,
        marginRight: 20,
        ...style,
      }}
    >
      <Avatar src={undefined} style={{ height: 50, width: 50 }} />
      <div
        style={{
          flex: 1,
          backgroundColor: Theme.background,
          textAlign: 'left',
          padding: 12,
          marginLeft: 10,
          borderTopRightRadius: 15,
          borderBottomRightRadius: 15,
          borderBottomLeftRadius: 15,
        }}
        id="comment-body"
      >
        <RSText size={11} bold>
          Smit Desai
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          Computer Science 2020 | Software Development Engineer @ Amazon
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          Mar 01
        </RSText>

        <RSText size={11} color={Theme.secondaryText} style={{ marginTop: 10 }}>
          Swine pork chop jowl pork belly boudin chuck, beef pastrami prosciutto
          burgdoggen doner. Spare ribs boudin prosciutto tail t-bone. Leberkas tail
          buffalo sausage kevin. Leberkas shoulder salami chislic pork loin, ham
          jerky turkey rump tenderloin meatloaf. Chislic meatloaf spare ribs strip
          steak hamburger bacon, pancetta burgdoggen corned beef sausage.
        </RSText>
      </div>
    </div>
  );
};
