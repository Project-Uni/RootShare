import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import log from '../helpers/logger';
import sendPacket from '../helpers/sendPacket';
const { GITHUB_OAUTH } = require('../../keys/keys.json');

import { request } from '@octokit/request';

import { Express } from 'express';

const PROJECT_OWNER = 'Project-Uni';
const REPO = 'RootShare';

export default function feedbackRoutes(app: Express) {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: `token ${GITHUB_OAUTH}`,
    },
    org: 'Project-Uni',
  });

  //TODO - Remove this route after integrating with UI
  app.get('/api/feedback/testCreateIssues', async (req, res) => {
    const result = await requestWithAuth(
      `POST /repos/${PROJECT_OWNER}/${REPO}/issues`,
      {
        title: 'Test New Issue',
        body: 'I am testing to see if I can programmatically create a new issue',
        labels: ['Bug'],
        assignees: ['caitecap'],
      }
    );
    log('github', `Created new reported bug: title`);
    return res.json({ result });
  });

  app.post('/api/feedback/bug', isAuthenticatedWithJWT, async (req, res) => {
    //TODO - Decide how to handle images, its not a feature provided by the github api

    const { title, category, message } = req.body;
    if (!title || !category || !message)
      return res.json(
        sendPacket(-1, 'title, category, or message missing from request body')
      );

    const body = generateGithubIssueContent(category, message, req.user);

    //TODO - Figure out failure responses for the API request
    const result = await requestWithAuth(
      `POST /repos/${PROJECT_OWNER}/${REPO}/issues`,
      {
        title,
        body,
        labels: ['Bug'],
        assignees: ['caitecap'],
      }
    );

    log('github', `Created new reported bug: ${title}`);
    return res.json(sendPacket(1, 'Successfully reported your bug'));
  });
}

function generateGithubIssueContent(
  category: string,
  message: string,
  user: { [key: string]: any }
) {
  const output = `
  **Category - ${category}**\n
  
  **Description**
  ${message}\n\n

  **Reporter**
  ${user.firstName} ${user.lastName}\n
  **Contact:**
  ${user.email}
  ${user.phoneNumber || ''}
  `;

  return output;
}
