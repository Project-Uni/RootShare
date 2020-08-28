import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import log from '../helpers/logger';

import { request } from '@octokit/request';

import { Express } from 'express';

const PROJECT_OWNER = 'Project-Uni';
const REPO = 'RootShare';

export default function feedbackRoutes(app: Express) {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: 'token 5caa93d5d50ee0bf44a45e23d7fca5a2d544b337',
    },
    org: 'Project-Uni',
  });

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
}
