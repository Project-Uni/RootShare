import { SINGLE_DIGIT } from '../../../../../types/types';
import {
  validateSession,
  getOpenTokToken,
  createEventSession,
} from './connectStreamHelpers';

export async function connectStream(
  webinarID: string,
  setSomeoneSharingScreen: (newState: false | SINGLE_DIGIT) => any,
  availablePositions: SINGLE_DIGIT[],
  eventStreamMap: { [key: string]: SINGLE_DIGIT }
) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    alert('This browser is not yet supported.');
    return { screenshare: canScreenshare, eventSessin: false };
  }
  OT.checkScreenSharingCapability((response: any) => {
    if (response.supported && response.extensionRegistered) canScreenshare = true;
  });

  const sessionID = await validateSession(webinarID);
  if (!sessionID) return { screenshare: canScreenshare, eventSession: false };

  const eventToken = await getOpenTokToken(sessionID);
  if (!eventToken) return { screenshare: canScreenshare, eventSession: false };

  const eventSession = await createEventSession(
    sessionID,
    eventToken,
    setSomeoneSharingScreen,
    availablePositions,
    eventStreamMap
  );

  if (!((eventSession as unknown) as boolean))
    return { screenshare: canScreenshare, eventSession: false };

  return { screenshare: canScreenshare, eventSession: eventSession };
}
