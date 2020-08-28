import { isAuthenticatedWithJWT } from '../passport/middleware/isAuthenticated';
import { Express } from 'express';
import { request } from '@octokit/request';

const PROJECT_OWNER = 'Project-Uni';
const REPO = 'RootShare';

export default function feedbackRoutes(app: Express) {
  const requestWithAuth = request.defaults({
    headers: {
      authorization: 'token 5caa93d5d50ee0bf44a45e23d7fca5a2d544b337',
    },
    org: 'Project-Uni',
  });

  app.get('/api/feedback/test', async (req, res) => {
    const result = await requestWithAuth('GET /orgs/:org/repos');
    return res.json({ message: 'Hello', result });
  });

  app.get('/api/feedback/testGetIssues', async (req, res) => {
    const result = await requestWithAuth(
      `GET /repos/${PROJECT_OWNER}/${REPO}/issues`
    );
    return res.json({ result });
  });

  app.get('/api/feedback/testCreateIssues', async (req, res) => {
    const result = await requestWithAuth(
      `POST /repos/${PROJECT_OWNER}/${REPO}/issues`,
      {
        title: 'Test New Issue',
        body: 'I am testing to see if I can programmatically create a new issue',
        label: 'Bug',
      }
    );
    return res.json({ result });
  });
}
