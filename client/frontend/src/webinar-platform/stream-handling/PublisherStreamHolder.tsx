import React from 'react'
import OT from '@opentok/client'
import axios from 'axios'
const { OPENTOK_API_KEY } = require('../../keys.json')


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
        console.log("Error connecting: ", error.name, error.message);
      } else {
        console.log("Connected to the session.");
        session.publish(publisher, handleError)
      }
    });
  }



  connectStream("5ee29b4b919e621712d22bee")
  return (
    <div>
      This is the stream page
    </div>
  )
}

export default PublisherStreamHolder