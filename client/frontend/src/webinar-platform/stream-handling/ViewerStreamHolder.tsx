import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import axios from 'axios'

import VideoPlayer from './VideoPlayer'

import log from '../../helpers/logger'

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
}));

type Props = {}

function ViewerStreamHolder(props: Props) {
  const styles = useStyles()
  const autoplay = true
  const controls = true
  let src = 'http://www.streambox.fr/playlists/test_001/stream.m3u8'
  const type = 'application/x-mpegURL'

  async function setSourceToLatestWebinarID() {
    const webinarID = await axios.get('/webinar/latestWebinarID')
      .then((response) => {
        return response.data.content.webinarID
      }).catch((err) => {
        log('error', err)
      })

    axios.post('/webinar/getMuxPlaybackID', { webinarID })
      .then((response) => {
        const { success, message } = response.data
        if (success === 1) {
          const { muxPlaybackID } = response.data.content
          src = `https://stream.mux.com/${muxPlaybackID}.m3u8`
        } else {
          log('error', message)
        }
      }).catch((err) => {
        log('error', err)
      })
  }

  function testFunction() {
    src = `http://www.streambox.fr/playlists/test_001/stream.m3u8`
  }


  setSourceToLatestWebinarID()
  return (
    <div className={styles.wrapper}>
      <VideoPlayer
        autoplay={autoplay}
        controls={controls}
        src={src}
        type={type}
      />
      <button onClick={testFunction}>TEST</button>
    </div>
  )
}

export default ViewerStreamHolder
