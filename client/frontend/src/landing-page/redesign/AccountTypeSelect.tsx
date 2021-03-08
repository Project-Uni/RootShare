import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { RootshareReduxState } from '../../redux/store/stateManagement';
import { updateRegistrationAccountType } from '../../redux/actions';

import { RSText } from '../../base-components';

import { AccountType } from '../../helpers/types';
import Theme, { addAlpha } from '../../theme/Theme';
import RootShareLogo from '../../images/RootShareLogoFull.png';
import { capitalizeFirstLetter } from '../../helpers/functions';

import {
  account_student,
  account_alumni,
  account_faculty,
  account_recruiter,
  account_student_mobile,
  account_alumni_mobile,
  account_faculty_mobile,
  account_recruiter_mobile,
} from '../../images/registration';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    width: '100%',
  },
  absolutePosContainer: {
    position: 'relative',
    height: 0,
    width: 0,
  },
  hover: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

const MIN_WIDTH = 915;

type Props = {};

const AccountTypeSelect = (props: Props) => {
  const styles = useStyles();
  const history = useHistory();
  const { accessToken, registration } = useSelector(
    (state: RootshareReduxState) => ({
      accessToken: state.accessToken,
      registration: state.registration,
    })
  );

  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  const accountTypes: {
    type: AccountType;
    backgroundImage: string;
    mobileBackground: string;
  }[] = [
    {
      type: 'student',
      backgroundImage: account_student,
      mobileBackground: account_student_mobile,
    },
    {
      type: 'alumni',
      backgroundImage: account_alumni,
      mobileBackground: account_alumni_mobile,
    },
    {
      type: 'faculty',
      backgroundImage: account_faculty,
      mobileBackground: account_faculty_mobile,
    },
    {
      type: 'recruiter',
      backgroundImage: account_recruiter,
      mobileBackground: account_recruiter_mobile,
    },
  ];

  const handleResize = () => {
    if (window.innerWidth !== innerWidth) setInnerWidth(window.innerWidth);
    if (window.innerHeight !== innerHeight) setInnerHeight(window.innerHeight);

    if (window.innerWidth < MIN_WIDTH && !isMobile) setIsMobile(true);
    else if (window.innerWidth >= MIN_WIDTH && isMobile) setIsMobile(false);
  };

  const checkAuth = useCallback(() => {
    if (Boolean(accessToken)) history.push('/home');
    else if (!registration?.verified) history.push('/account/verify');
  }, [accessToken, registration]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useLayoutEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleClick = (type: AccountType) => {
    dispatch(updateRegistrationAccountType(type));
    history.push('/account/initialize');
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
      {isMobile || (
        <div className={styles.absolutePosContainer}>
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: innerWidth / 2 - 250,
              width: 500,
            }}
          >
            <RSText size={20} color={Theme.white} bold>
              WE'RE EXCITED TO HAVE YOU!
            </RSText>
          </div>
        </div>
      )}
      {accountTypes.map((account) => (
        <Account
          type={account.type}
          onClick={handleClick}
          style={{ flex: 0.25 }}
          image={isMobile ? account.mobileBackground : account.backgroundImage}
          isMobile={isMobile}
          className={styles.hover}
        />
      ))}
      <div className={styles.absolutePosContainer}>
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
  isMobile?: boolean;
  onClick: (type: AccountType) => void;
};

const Account = (props: AccountTypeProps) => {
  const styles = useStyles();
  const { style, className, type, onClick, isMobile, image } = props;

  const [hovering, setHovering] = useState(false);
  const [rotation, setRotation] = useState(180);

  useEffect(() => {
    if (isMobile) setRotation(isMobile ? 90 : 180);
    console.log(isMobile);
  }, [isMobile]);

  return (
    <div
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: 'cover',
        ...style,
      }}
      className={className}
      onClick={() => onClick(type)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        style={{
          zIndex: 0,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: `linear-gradient(${rotation}deg, rgba(0, 0, 0, 0.65) 0%, rgba(97, 200, 127, 0.65) 269.39%)`,
          boxShadow: '6px 0px 23px rgba(0, 0, 0, 0.2)',
        }}
      >
        <RSText
          size={42}
          weight="light"
          color={hovering ? Theme.secondaryText : Theme.white}
        >
          {capitalizeFirstLetter(type)}
        </RSText>
      </div>
    </div>
  );
};
