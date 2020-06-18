import React from 'react'
import OT from '@opentok/client'
import axios from 'axios'
import { makeStyles } from "@material-ui/core/styles"
import log from '../../helpers/logger'

const { OPENTOK_API_KEY } = require('../../keys.json')

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {}

function PublisherStreamHolder(props: Props) {

  function handleError(error: any) {
    if (error) {
      alert(error.message);
    }
  }

  function recordScreen() {
    const publisher = OT.initPublisher('publisher', {
      insertMode: 'append',
      width: '10%',
      height: '200px'
    }, handleError);

    return publisher
  }

  async function connectStream(webinarID: string) {
    if (OT.checkSystemRequirements() !== 1) {
      // The client does not support WebRTC.
      // You can display your own message.
      // log('error', "This device does not support WebRTC")
      return
    }

    const publisher = recordScreen()
    const { data: sessionData } = await axios.post(
      '/webinar/getOpenTokSessionID', {
      webinarID
    });
    if (sessionData["success"] !== 1) {
      // Could not find session id
      return
    }
    const sessionID = sessionData.content.opentokSessionID

    const { data: tokenData } = await axios.post(
      '/webinar/getOpenTokToken', {
      opentokSessionID: sessionID
    })
    if (tokenData["success"] !== 1) {
      // Could not get session token
      return
    }

    const session = OT.initSession(OPENTOK_API_KEY, sessionID)

    session.on("streamCreated", function (event) {
      session.subscribe(event.stream);
    });

    session.connect(tokenData.content.token, function (error) {
      if (error) {
        log(error.name, error.message);
      } else {
        log('info', 'Connected to the session.');
        session.publish(publisher, handleError)
      }
    });
  }

  async function getLatestWebinarID() {
    return await axios.get('/webinar/latestWebinarID')
      .then((response) => {
        return response.data.content.webinarID
      }).catch((err) => {
        log('error', err)
      })
  }

  async function startLiveStreaming() {
    const webinarID = await getLatestWebinarID()
    axios.post('/webinar/startStreaming', { webinarID })
  }

  async function stopLiveStreaming() {
    const webinarID = await getLatestWebinarID()
    axios.post('/webinar/stopStreaming', { webinarID })
  }

  async function createSession() {
    await axios.get('/webinar/createSession')
      .then((response) => {
        connectStream(response.data.content.webinarID)
      }).catch((err) => {
        log('error', err)
      })
  }

  return (
    <div>
      This is the Host page
      <button onClick={createSession}>Create New Session</button>
      <button onClick={startLiveStreaming}>Start Live Streaming</button>
      <button onClick={stopLiveStreaming}>Stop Live Streaming</button>
    </div>
  )
}

export default PublisherStreamHolder