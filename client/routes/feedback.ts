import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { log, sendPacket } from '../helpers/functions';

const { GITHUB_OAUTH } = require('../../keys/keys.json');

import { request } from '@octokit/request';
import { Express } from 'express';

const PROJECT_OWNER = 'Project-Uni';
const REPO = 'RootShare-Bugs';

export default function feedbackRoutes(app: Express) {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: `token ${GITHUB_OAUTH}`,
    },
    org: 'Project-Uni',
  });

  app.post('/api/feedback/bug', isAuthenticatedWithJWT, async (req, res) => {
    //TODO - Decide how to handle images, its not a feature provided by the github api

    const { title, category, message } = req.body;
    if (!title || !category || !message)
      return res.json(
        sendPacket(-1, 'title, category, or message missing from request body')
      );

    const body = generateGithubIssueContent(category, message, req.user);

    try {
      const result = await requestWithAuth(
        `POST /repos/${PROJECT_OWNER}/${REPO}/issues`,
        {
          title,
          body,
          labels: ['Bug'],
          // assignees: ['caitecap'],
        }
      );

      log('github', `Created new reported bug: ${title}`);
      return res.json(sendPacket(1, 'Successfully reported your bug'));
    } catch (err) {
      log('error', err);
      return res.json(sendPacket(-1, 'There was an error reporting this bug'));
    }
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
