import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { RSText } from '../../base-components';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    height: '100vh',
    width: '100%',
  },
}));

const MIN_WIDTH = 915;

type AccountType = 'student' | 'alumni' | 'faculty' | 'recruiter';

type Props = {};

const AccountTypeSelect = (props: Props) => {
  const styles = useStyles();

  const [isMobile, setIsMobile] = useState(window.innerWidth < MIN_WIDTH);

  const accountTypes: { type: AccountType; backgroundImage?: string }[] = [
    { type: 'student', backgroundImage: undefined },
    { type: 'alumni', backgroundImage: undefined },
    { type: 'faculty', backgroundImage: undefined },
    { type: 'recruiter', backgroundImage: undefined },
  ];

  const handleResize = () => {
    if (window.innerWidth < MIN_WIDTH && !isMobile) setIsMobile(true);
    else if (window.innerWidth >= MIN_WIDTH && isMobile) setIsMobile(false);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const handleClick = (type: AccountType) => {};

  return (
    <div
      className={styles.wrapper}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      {accountTypes.map((account) => (
        <Account
          type={account.type}
          onClick={handleClick}
          style={{ border: '1px solid red', flex: 0.25 }}
        />
      ))}
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
    >
      <RSText>{`${type.charAt(0).toUpperCase()}${type.slice(
        1,
        type.length
      )}`}</RSText>
    </div>
  );
};
