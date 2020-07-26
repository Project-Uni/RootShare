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
  setPublisherLoading: (newLoading: boolean) => void,
  accessToken: string,
  refreshToken: string
) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'This browser is not yet supported',
    };
  }
  OT.checkScreenSharingCapability((response: any) => {
    if (response.supported && response.extensionRegistered) canScreenshare = true;
  });

  const sessionID = await validateSession(webinarID, accessToken, refreshToken);
  if (!sessionID)
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message:
        'The event has not started yet. Please wait until 30 minutes before the event start time.',
    };

  const eventToken = await getOpenTokToken(sessionID, accessToken, refreshToken);
  if (!eventToken)
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'Could not authenticate user',
    };

  const eventSession = await createEventSession(
    sessionID,
    eventToken,
    updateVideoElements,
    removeVideoElement,
    setCameraPublisher,
    setPublisherLoading
  );

  if (!((eventSession as unknown) as boolean))
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'Could not create event session',
    };

  return {
    screenshare: canScreenshare,
    eventSession: eventSession,
    message: 'Connecting to event',
  };
}
