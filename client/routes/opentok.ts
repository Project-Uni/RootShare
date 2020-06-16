import sendPacket from "../helpers/sendPacket";
import log from "../helpers/logger";
const isAuthenticated = require('../passport/middleware/isAuthenticated')
const { createSession, getOpenTokSessionID, getOpenTokToken, startStreaming, stopStreaming, getLatestWebinarID } = require('../interactions/streaming/opentok')

module.exports = (app) => {
  app.get('/webinar/createSession', isAuthenticated, async (req, res) => {
    const { id } = req.user
    const packet = await createSession(id)
    res.json(packet)
  })

  app.get('/webinar/latestWebinarID', isAuthenticated, async (req, res) => {
    const { id } = req.user
    const packet = await getLatestWebinarID(id)
    res.json(packet)
  })

  app.post('/webinar/getOpenTokSessionID', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body
    const packet = await getOpenTokSessionID(webinarID)
    res.json(packet)
  })

  app.post('/webinar/getOpenTokToken', isAuthenticated, async (req, res) => {
    const { opentokSessionID } = req.body
    const packet = await getOpenTokToken(opentokSessionID)
    res.json(packet)
  })

  app.post('/webinar/startStreaming', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body
    const packet = await startStreaming(req.body.webinarID)
    res.json(packet)
  })

  app.post('/webinar/stopStreaming', isAuthenticated, async (req, res) => {
    const { webinarID } = req.body
    const packet = await stopStreaming(req.body.webinarID)
    res.json(packet)
  })
}