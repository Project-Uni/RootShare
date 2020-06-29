import React, { useState } from 'react';
import OT, { Session, Publisher } from '@opentok/client';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import log from '../../helpers/logger';

const { OPENTOK_API_KEY } = require('../../keys.json');

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {};

function PublisherStreamHolder(props: Props) {
  function handleError(error: any) {
    if (error) {
      alert(error.message);
    }
  }

  function recordWebcam() {
    const publisher = OT.initPublisher(
      'publisher',
      {
        insertMode: 'append',
        width: '10%',
        height: '200px',
      },
      handleError
    );

    session.publish(publisher, handleError);
    return publisher;
  }

  function recordScreen() {
    const publisher = OT.initPublisher(
      'screen-preview',
      { videoSource: 'screen' },
      function(error) {
        if (error) {
          // Look at error.message to see what went wrong.
          return new Publisher();
        } else {
          session.publish(publisher, function(error) {
            if (error) {
              // Look error.message to see what went wrong.
              return new Publisher();
            }
          });
        }
      }
    );

    return publisher;
  }

  //Implemented
  async function connectStream(webinarID: string) {
    if (OT.checkSystemRequirements() !== 1) {
      // The client does not support WebRTC
      return;
    }

    OT.checkScreenSharingCapability(function(response: any) {
      if (!response.supported || response.extensionRegistered === false) {
        // This browser does not support screen sharing
      } else {
        setCanScreenShare(true);
      }
    });

    const { data: sessionData } = await axios.post('/webinar/getOpenTokSessionID', {
      webinarID,
    });
    if (sessionData['success'] !== 1) {
      // Could not find session id
      return;
    }
    const sessionID = sessionData.content.opentokSessionID;

    const { data: tokenData } = await axios.post('/webinar/getOpenTokToken', {
      opentokSessionID: sessionID,
    });
    if (tokenData['success'] !== 1) {
      // Could not get session token
      return;
    }

    const newSession = OT.initSession(OPENTOK_API_KEY, sessionID);

    newSession.on('streamCreated', function(event: any) {
      newSession.subscribe(event.stream);
    });

    newSession.connect(tokenData.content.token, function(error: any) {
      if (error) {
        log(error.name, error.message);
      } else {
        log('info', 'Connected to the session.');
        setSession(newSession);
      }
    });
  }

  async function getLatestWebinarID() {
    return await axios
      .get('/webinar/latestWebinarID')
      .then((response) => {
        return response.data.content.webinarID;
      })
      .catch((err) => {
        log('error', err);
      });
  }

  //Implemented
  async function startLiveStreaming() {
    const webinarID = await getLatestWebinarID();
    axios.post('/webinar/startStreaming', { webinarID });
  }

  //Implemented
  async function stopLiveStreaming() {
    const webinarID = await getLatestWebinarID();
    axios.post('/webinar/stopStreaming', { webinarID });
  }

  //Implemented
  async function createSession() {
    await axios
      .get('/webinar/createSession')
      .then((response) => {
        connectStream(response.data.content.webinarID);
      })
      .catch((err) => {
        log('error', err);
      });
  }

  const [canScreenShare, setCanScreenShare] = useState(false);
  const [webcamPublisher, setWebcamPublisher] = useState(new Publisher());
  const [screenPublisher, setScreenPublisher] = useState(new Publisher());
  const [session, setSession] = useState(new Session());

  function toggleWebcam() {
    setWebcamPublisher((prevState) => {
      if (session.sessionId === undefined) {
        return new Publisher();
      }

      if (prevState.session === undefined) {
        return recordWebcam();
      } else {
        session.unpublish(webcamPublisher);
        return new Publisher();
      }
    });
  }

  function toggleScreen() {
    setScreenPublisher((prevState) => {
      if (session.sessionId === undefined) {
        return new Publisher();
      }

      if (prevState.session === undefined) {
        return recordScreen();
      } else if (prevState.session === null) {
        return new Publisher();
      } else {
        session.unpublish(screenPublisher);
        return new Publisher();
      }
    });
  }

  return (
    <div>
      This is the Host page
      <button onClick={createSession}>Create New Session</button>
      <button onClick={startLiveStreaming}>Start Live Streaming</button>
      <button onClick={stopLiveStreaming}>Stop Live Streaming</button>
      {session.sessionId !== undefined ? (
        <button onClick={toggleWebcam}>Toggle Webcam</button>
      ) : (
        <div></div>
      )}
      {canScreenShare && session.sessionId !== undefined ? (
        <button onClick={toggleScreen}>Toggle Screen</button>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default PublisherStreamHolder;
