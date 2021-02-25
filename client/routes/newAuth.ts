import { Express } from 'express';
import sendPacket from '../../webinar/helpers/sendPacket';
import { getQueryParams } from '../helpers/functions';
import { AuthService } from '../interactions/auth';

export const authRoutes = (app: Express) => {
  app.get('/api/v2/auth/validate', async (req, res) => {
    const query = getQueryParams(req, {
      email: { type: 'string' },
      phoneNumber: { type: 'string' },
      password: { type: 'string' },
    });
    if (!query) return res.status(400).json(sendPacket(-1, 'Missing query params'));

    const { email, password, phoneNumber } = query;
    const { status, packet } = await new AuthService().validateRegistration({
      email: email as string,
      password: password as string,
      phoneNumber: phoneNumber as string,
    });
    return res.status(status).json(packet);
  });

  app.post('/api/v2/auth/register', async (req, res) => {
    const {
      email,
      phoneNumber,
      password,
      accountType,
      firstName,
      lastName,
      major,
      company,
      jobTitle,
      university,
      graduationYear,
      state,
    }: {
      email: string;
      phoneNumber: string;
      password: string;
      accountType: 'student' | 'alumni' | 'faculty' | 'recruiter';
      firstName: string;
      lastName: string;
      company?: string;
      jobTitle?: string;
      major?: string;
      university?: any; //TBD Decide how to do this as we add more universities,
      graduationYear: number;
      state: string;
    } = req.body;

    const { status, packet } = await new AuthService().register({
      email,
      phoneNumber,
      password,
      accountType,
      firstName,
      lastName,
      major,
      company,
      jobTitle,
      university,
      graduationYear,
      state,
    });
    return res.status(status).json(packet);
  });

  app.post('/api/v2/auth/login', async (req, res) => {
    const { email, password }: { email: string; password: string } = req.body;
    const { status, packet } = await new AuthService().login({ email, password });
    return res.status(status).json(packet);
  });

  app.put('/api/v2/auth/verify', async (req, res) => {
    const { code, email }: { code: string; email: string } = req.body;
    const { status, packet } = await new AuthService().verify({ code, email });
    return res.status(status).json(packet);
  });

  app.put('/api/v2/auth/resend', async (req, res) => {
    const { email, phoneNumber }: { email: string; phoneNumber: string } = req.body;
    const { status, packet } = await new AuthService().resendPhoneVerification({
      email,
      phoneNumber,
    });
    return res.status(status).json(packet);
  });
};
