import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Avatar } from '@material-ui/core';

import { RSLink } from './RSLink';
import { RSText } from '../../../base-components';

import { getInitials } from '../../../helpers/functions';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    display: 'inline-block',
  },
}));

type Props = {
  src?: string;
  size: number;
  primaryName?: string;
  secondaryName?: string;
  variant: 'circle' | 'circular' | 'rounded' | 'square';
  className?: string;
  href?: string;
};

const RSAvatar = (props: Props) => {
  const styles = useStyles();

  const { src, size, primaryName, secondaryName, variant, className, href } = props;

  const style = { height: size, width: size };

  const renderAvatar = () => (
    <div className={styles.wrapper}>
      <Avatar
        className={[className].join(' ')}
        src={src}
        variant={variant}
        style={style}
      >
        <RSText size={size / 3} caps="uppercase" weight="light">
          {getInitials(primaryName, secondaryName)}
        </RSText>
      </Avatar>
    </div>
  );

  return (
    <>
      {href ? (
        <RSLink href={href} underline="noUnderline">
          {renderAvatar()}
        </RSLink>
      ) : (
        renderAvatar()
      )}
    </>
  );
};

RSAvatar.defaultProps = {
  variant: 'circle',
};

export default RSAvatar;
