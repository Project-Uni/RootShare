import sendPacket from "../helpers/sendPacket";
import log from "../helpers/logger";
const isAuthenticated = require('../passport/middleware/isAuthenticated')
const { createSession, getOpenTokSessionID, getOpenTokToken } = require('../interactions/opentok/sessions')

module.exports = (app) => {
  app.get('/webinar/createSession', isAuthenticated, async (req, res) => {
    const { id } = req.user
    const packet = await createSession(id)
    res.json(packet)
  })

  app.post('/webinar/getOpenTokSessionID', async (req, res) => {
    const { webinarID } = req.body
    const packet = await getOpenTokSessionID(webinarID)
    res.json(packet)
  })

  app.post('/webinar/getOpenTokToken', async (req, res) => {
    const { opentokSessionID } = req.body
    const packet = await getOpenTokToken(opentokSessionID)
    res.json(packet)
  })
}