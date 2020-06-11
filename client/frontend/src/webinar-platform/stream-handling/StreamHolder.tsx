import React from 'react'
import OT from '@opentok/client'
import axios from 'axios'
const { OPENTOK_API_KEY } = require('../../keys.json')


type Props = {}

function StreamHolder(props: Props) {
  const publisher = OT.initPublisher();

  function connectStream() {
    if (OT.checkSystemRequirements() !== 1) {
      // The client does not support WebRTC.
      // You can display your own message.
      return
    }



    let session = OT.initSession(OPENTOK_API_KEY, sessionID)
    session.connect(token, function (error) {
      if (error) {
        console.log("Error connecting: ", error.name, error.message);
      } else {
        console.log("Connected to the session.");
      }
    });
  }




  return (
    <div>
      This is the stream page
    </div>
  )
}

export default StreamHolder