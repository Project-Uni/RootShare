import {
  validateSession,
  getOpenTokToken,
  createEventSession,
} from './connectStreamHelpers';

export async function connectStream(
  webinarID: string,
  updateVideoElements: (
    videoElement: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (screenElementID: string) => void
  ) => void,
  removeVideoElement: (
    elementID: string,
    videoType: 'camera' | 'screen',
    self: boolean
  ) => void,
  setCameraPublisher: (newPublisher: OT.Publisher) => void,
  increaseNumSpeakers: () => void,
  accessToken: string,
  refreshToken: string
) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    alert('This browser is not yet supported.');
    return { screenshare: canScreenshare, eventSession: false };
  }
  OT.checkScreenSharingCapability((response: any) => {
    if (response.supported && response.extensionRegistered) canScreenshare = true;
  });

  const sessionID = await validateSession(webinarID, accessToken, refreshToken);
  if (!sessionID) return { screenshare: canScreenshare, eventSession: false };

  const eventToken = await getOpenTokToken(sessionID, accessToken, refreshToken);
  if (!eventToken) return { screenshare: canScreenshare, eventSession: false };

  const eventSession = await createEventSession(
    sessionID,
    eventToken,
    updateVideoElements,
    removeVideoElement,
    setCameraPublisher,
    increaseNumSpeakers
  );

  if (!((eventSession as unknown) as boolean))
    return { screenshare: canScreenshare, eventSession: false };

  return { screenshare: canScreenshare, eventSession: eventSession };
}
