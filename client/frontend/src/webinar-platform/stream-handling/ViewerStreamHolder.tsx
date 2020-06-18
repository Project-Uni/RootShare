import React, { useState } from "react"
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
  const [src, setSrc] = useState('')

  async function setSourceToLatestWebinarID() {
    const webinarID = await axios.get('/webinar/latestWebinarID')
      .then((response) => {
        return response.data.content.webinarID
      }).catch((err) => {
        log('error', err)
      })

    axios.post('/webinar/getMuxPlaybackID', { webinarID })
      .then(async (response) => {
        const { success, message } = response.data
        if (success === 1) {
          const { muxPlaybackID } = response.data.content
          const source = `https://stream.mux.com/${muxPlaybackID}.m3u8`
          const streamExists = await checkStreamExists(source)
          if (streamExists) {
            setSrc(source)
          }
        } else {
          log('error', message)
        }
      }).catch((err) => {
        log('error', err)
      })
  }

  async function checkStreamExists(source: string) {
    return await axios.get(source)
      .then((response) => {
        return true
      }).catch((err) => {
        return false
      })
  }

  setSourceToLatestWebinarID()
  return (
    (src.localeCompare('') === 0) ?
      <div></div> :
      <div className={styles.wrapper}>
        <VideoPlayer
          src={src}
        />
      </div>
  )
}

export default ViewerStreamHolder
