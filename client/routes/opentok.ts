import sendPacket from "../helpers/sendPacket";
import log from "../helpers/logger";

const { createSession, getToken } = require('../interactions/opentok/sessions')

module.exports = (app) => {
  app.get('/webinar/createSession', async (req, res) => {
    const sessionID = await createSession()
    res.json(sessionID)
  })

  app.post('/webinar/joinSession', async (req, res) => {
    const { sessionID } = req.body
    let token = await getToken(sessionID)

    res.json(token)
  })
}