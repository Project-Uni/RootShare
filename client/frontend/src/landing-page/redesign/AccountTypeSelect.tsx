import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../base-components';
import Theme from '../../theme/Theme';
import RootShareLogo from '../../images/RootShareLogoFull.png';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  absolutePosContainer: {
    position: 'relative',
    height: 0,
    width: 0,
  },
}));

const MIN_WIDTH = 915;

type AccountType = 'student' | 'alumni' | 'faculty' | 'recruiter';

type Props = {};

const AccountTypeSelect = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { accessToken } = useSelector((state: RootshareReduxState) => ({
    accessToken: state.accessToken,
  }));

  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  const accountTypes: { type: AccountType; backgroundImage?: string }[] = [
    { type: 'student', backgroundImage: undefined },
    { type: 'alumni', backgroundImage: undefined },
    { type: 'faculty', backgroundImage: undefined },
    { type: 'recruiter', backgroundImage: undefined },
  ];

  const handleResize = () => {
    if (window.innerWidth !== innerWidth) setInnerWidth(window.innerWidth);
    if (window.innerHeight !== innerHeight) setInnerHeight(window.innerHeight);

    if (window.innerWidth < MIN_WIDTH && !isMobile) setIsMobile(true);
    else if (window.innerWidth >= MIN_WIDTH && isMobile) setIsMobile(false);
  };

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
  }, [accessToken]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleClick = (type: AccountType) => {
    console.log('Clicking on account type:', type);
  };

  return (
    <div
      className={styles.wrapper}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: innerHeight,
      }}
    >
      <div className={styles.absolutePosContainer}>
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: innerWidth / 2 - 100,
            width: 200,
          }}
        >
          <RSText bold>We're excited to have you!</RSText>
        </div>
      </div>
      {accountTypes.map((account) => (
        <Account
          type={account.type}
          onClick={handleClick}
          style={{ border: '1px solid red', flex: 0.25 }}
          image={account.backgroundImage}
        />
      ))}
      <div
        className={styles.absolutePosContainer}
        style={{ border: '1px solid red' }}
      >
        <img
          src={RootShareLogo}
          style={{
            width: isMobile ? 225 : 300,
            position: 'absolute',
            bottom: isMobile ? 5 : -window.innerHeight + 30,
            right: isMobile ? undefined : innerWidth / 2 - 150,
            left: isMobile ? innerWidth / 2 - 113 : undefined,
          }}
        />
      </div>
    </div>
  );
};
export default AccountTypeSelect;

type AccountTypeProps = {
  image?: string;
  style?: React.CSSProperties;
  className?: string;
  type: AccountType;
  onClick: (type: AccountType) => void;
};

const Account = (props: AccountTypeProps) => {
  const { style, className, type, onClick, image } = props;
  const [hovering, setHovering] = useState(false);

  return (
    <div
      style={{
        backgroundImage: image,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
      className={className}
      onClick={() => onClick(type)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <RSText
        size={32}
        color={hovering ? Theme.primaryHover : Theme.primaryText}
        bold
      >{`${type.charAt(0).toUpperCase()}${type.slice(1, type.length)}`}</RSText>
    </div>
  );
};
