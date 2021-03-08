import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../../base-components';
import { Avatar } from '@material-ui/core';
import { RSLink } from '..';
import { formatPostTime } from './UserPost.v2';
import Theme from '../../../theme/Theme';

const useStyles = makeStyles((_: any) => ({ wrapper: {} }));

export type CommentType = {
  createdAt: string;
  _id: string;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    profilePicture?: string;
    major?: string;
    graduationYear: number;
    work?: string;
    position?: string;
  };
  updatedAt: string;
};

type CommentProps = {
  className?: string;
  style?: React.CSSProperties;
  comment: CommentType;
};
export const Comment = (props: CommentProps) => {
  const { className, style, comment } = props;
  const styles = useStyles();

  const getUserDescription = useCallback(() => {
    const {
      user: { major, graduationYear, position, work },
    } = comment;

    let description = '';
    if (major && graduationYear) description += `${major} ${graduationYear}`;

    if (major && graduationYear && position && work) description += '  |  ';
    if (position) description += position;
    if (position && work) description += ' @ ';
    if (work) description += work;

    return description;
  }, [comment]);

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
      <RSLink href={`/profile/${comment.user._id}`}>
        <Avatar
          src={comment.user.profilePicture}
          style={{ height: 50, width: 50 }}
        />
      </RSLink>
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
        <RSLink href={`/profile/${comment.user._id}`} underline="hover">
          <RSText size={11} bold>
            {comment.user.firstName} {comment.user.lastName}
          </RSText>
        </RSLink>
        <RSText size={10} color={Theme.secondaryText}>
          {getUserDescription()}
        </RSText>
        <RSText size={10} color={Theme.secondaryText}>
          {formatPostTime(comment.createdAt)}
        </RSText>

        <RSText size={11} color={Theme.secondaryText} style={{ marginTop: 10 }}>
          {comment.message}
        </RSText>
      </div>
    </div>
  );
};
