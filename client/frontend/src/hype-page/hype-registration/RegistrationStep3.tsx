import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import PurdueLogo from '../../images/purdueLogo.png'

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    marginBottom: '5px'
  },
  allText: {
    fontSize: '13pt',
    textAlign: 'left',
    fontfamily: "Ubuntu",
    margin: '0px',
    marginLeft: "25px",
  },
  confirmText: {
    marginBottom: '20px',
  },
  emailText: {
    marginBottom: '20px',
  },
  logoStyle: {
    height: '100px',
    width: '100px'
  }
}));

type Props = {};

function RegistrationStep3(props: Props) {
  const styles = useStyles();

  return (
    <div className={styles.wrapper}>
      <p 
        className={`${styles.allText} ${styles.emailText}`}
      >
        An account has been created with the email: <b>mahesh.ashwin1998@gmail.com</b>.
      </p>
      <p 
        className={`${styles.allText} ${styles.confirmText}`}
      >
        A confirmation email has been sent with next steps to finish setting up your profile.
      </p>
      <p 
        className={`${styles.allText} ${styles.emailText}`}
      >
        We look forward to having you on our platform! <b>Boiler up</b>!
      </p>
      <img src={PurdueLogo} alt='Purdue Logo' className={styles.logoStyle} />
    </div>
  );
}

export default RegistrationStep3;
