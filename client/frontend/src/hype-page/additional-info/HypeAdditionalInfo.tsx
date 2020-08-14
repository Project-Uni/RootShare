import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import axios from 'axios';

import HypeHeader from '../headerFooter/HypeHeader';
import HypeFooter from '../headerFooter/HypeFooter';
import HypeCard from '../hype-card/HypeCard';
import HypeInfoBody from './HypeInfoBody';
import HypeAdditionalComplete from './HypeAdditionalComplete';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '35px',
    marginBottom: '35px',
  },
  subheaderText: {
    fontFamily: 'Ubuntu',
    textAlign: 'left',
    marginLeft: '25px',
    fontSize: '11pt',
    marginTop: 10,
    color: 'rgb(100,100,100)',
  },
  buttonDiv: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginLeft: '20px',
    marginRight: '20px',
  },
  submitError: {
    marginLeft: 25,
    marginRight: 25,
    fontSize: '11pt',
    color: 'red',
    textAlign: 'left',
  },
}));

type Props = {};

function HypeAdditionalInfo(props: Props) {
  const styles = useStyles();

  const [landingRedirect, setLandingRedirect] = useState(false);
  const [externalRedirect, setExternalRedirect] = useState(false);
  const [loading, setLoading] = useState(false);

  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [work, setWork] = useState('');
  const [position, setPosition] = useState('');
  const [college, setCollege] = useState('');
  const [interests, setInterests] = useState('');
  const [organizations, setOrganizations] = useState('');
  const [graduateSchool, setGraduateSchool] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasGradDegree, setHasGradDegree] = useState('no');
  const [discoveryMethod, setDiscoveryMethod] = useState('');

  const [gradYearErr, setGradYearErr] = useState('');
  const [phoneNumErr, setPhoneNumErr] = useState('');
  const [updateErr, setUpdateErr] = useState(false);

  const [regCompleted, setRegCompleted] = useState(false);

  const [currentUser, setCurrentUser] = useState('');

  const redirectURL = '/event/5f30b4488e8fb07262044e9f';

  async function getCurrentUser() {
    const { data } = await axios.get('/auth/curr-user/load');
    if (data['success'] === 1) {
      if (!data['content']['externalComplete']) {
        setExternalRedirect(true);
      } else {
        setRegCompleted(data['content']['regComplete']);
        setCurrentUser(data['content']['email']);
      }
    } else setLandingRedirect(true);
  }

  useEffect(() => {
    getCurrentUser();
  }, []);

  function handleMajorChange(event: any) {
    setMajor(event.target.value);
  }

  function handleGraduationYearChange(event: any) {
    setGraduationYear(event.target.value);
  }

  function handleWorkChange(event: any) {
    setWork(event.target.value);
  }

  function handlePositionChange(event: any) {
    setPosition(event.target.value);
  }

  function handleCollegeChange(event: any) {
    setCollege(event.target.value);
  }

  function handleInterestsChange(event: any) {
    setInterests(event.target.value);
  }

  function handleOrganizationsChange(event: any) {
    setOrganizations(event.target.value);
  }

  function handleHasGradDegreeChange(event: any) {
    setHasGradDegree(event.target.value);
  }

  function handleGraduateSchoolChange(event: any) {
    setGraduateSchool(event.target.value);
  }

  function handlePhoneNumberChange(event: any) {
    setPhoneNumber(event.target.value);
  }

  function handleDiscoveryMethodChange(event: any) {
    setDiscoveryMethod(event.target.value);
  }

  function handleSubmit() {
    setLoading(true);

    setTimeout(async () => {
      setLoading(false);
      let hasErr = false;
      if (
        graduationYear !== '' &&
        (Number(graduationYear) > 2050 || Number(graduationYear) < 1920)
      ) {
        setGradYearErr('Graduation year is invalid');
        hasErr = true;
      } else setGradYearErr('');

      if (
        phoneNumber.length !== 0 &&
        (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber))
      ) {
        setPhoneNumErr('Invalid phone number');
        hasErr = true;
      } else setPhoneNumErr('');

      if (hasErr) return;
      const { data } = await axios.post('/auth/complete-registration/details', {
        email: currentUser,
        major: major,
        graduationYear: graduationYear,
        work: work,
        position: position,
        department: college,
        organizations: organizations.split(','),
        interests: interests.split(','),
        phoneNumber: phoneNumber,
        graduateSchool: hasGradDegree ? graduateSchool : '',
        discoveryMethod: discoveryMethod,
      });
      if (data['success'] !== 1) {
        setUpdateErr(true);
      } else {
        setUpdateErr(false);
        setRegCompleted(true);
      }
    }, 1000);
  }

  function handleContinue() {
    window.location.href = redirectURL;
  }

  const mode = 'question';

  const modePrompts = {
    question: {
      major: 'What was your major?',
      graduation: 'What year did you graduate?',
      work: 'Where do you currently work?',
      position: 'What is your current role?',
      college:
        'Which college of Purdue did you graduate from (Krannert, Engineering, etc)?',
      interests: 'What are your interests (use comma-separated list)?',
      organizations:
        'What organizations were you involved with on campus (use comma-separated list)?',
      graduateDegree: 'Did you get a graduate degree?',
      graduateSchool: 'What university did you obtain your graduate degree from?',
      phoneNumber: 'Add Your Phone Number (Digits Only):',
      discoveryMethod: 'How did you hear about us?',
    },
    demand: {
      major: 'Major:',
      graduation: 'Graduation Year:',
      work: 'Current Place of Employment:',
      position: 'Current Position:',
      college: 'College of Study (Krannert, Engineering, etc):',
      interests: 'Interests (Comma-Separated List):',
      organizatins: 'Organizations You Were Involved With (Comma Separated List):',
      graduateDegree: 'Do you have a graduate degree?',
      graduateSchool: 'Graduate University:',
      phoneNumber: 'Phone Number (Digits Only):',
      discoveryMethod: 'How did you hear about us?',
    },
  };

  return (
    <div className={styles.wrapper}>
      {landingRedirect && <Redirect to="/" />}
      {externalRedirect && <Redirect to="/profile/externalRegister" />}

      <HypeHeader />
      <div className={styles.body}>
        <HypeCard
          width={450}
          loading={loading}
          headerText="Complete your profile"
          backArrow="link"
          backArrowLink="/"
        >
          {!regCompleted ? (
            <>
              <Typography className={styles.subheaderText}>
                All of this information is completely optional, adding it will help
                us curate the best information for you once our platform goes live!
              </Typography>
              <HypeInfoBody
                modePrompts={modePrompts}
                mode={mode}
                major={major}
                handleMajorChange={handleMajorChange}
                graduationYear={graduationYear}
                handleGraduationYearChange={handleGraduationYearChange}
                work={work}
                handleWorkChange={handleWorkChange}
                position={position}
                handlePositionChange={handlePositionChange}
                college={college}
                handleCollegeChange={handleCollegeChange}
                interests={interests}
                handleInterestsChange={handleInterestsChange}
                organizations={organizations}
                handleOrganizationsChange={handleOrganizationsChange}
                graduateSchool={graduateSchool}
                handleGraduateSchoolChange={handleGraduateSchoolChange}
                phoneNumber={phoneNumber}
                handlePhoneNumberChange={handlePhoneNumberChange}
                hasGradDegree={hasGradDegree}
                handleHasGradDegreeChange={handleHasGradDegreeChange}
                discoveryMethod={discoveryMethod}
                handleDiscoveryMethodChange={handleDiscoveryMethodChange}
                gradYearErr={gradYearErr}
                phoneNumErr={phoneNumErr}
              />
            </>
          ) : (
            <HypeAdditionalComplete />
          )}

          {updateErr && (
            <p className={styles.submitError}>
              There was an error processing your request.
            </p>
          )}
          <div className={styles.buttonDiv}>
            {regCompleted ? (
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={handleContinue}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                Finish
              </Button>
            )}
          </div>
        </HypeCard>
      </div>

      <HypeFooter />
    </div>
  );
}

export default HypeAdditionalInfo;
