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
  changeNumSpeakers: (value: 1 | -1) => void,
  accessToken: string,
  refreshToken: string
) {
  let canScreenshare = false;

  if (OT.checkSystemRequirements() !== 1) {
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'This browser is not yet supported',
      sessionID: false,
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
      sessionID: false,
    };

  const eventToken = await getOpenTokToken(sessionID, accessToken, refreshToken);
  if (!eventToken)
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'Could not authenticate user',
      sessionID: false,
    };

  const eventSession = await createEventSession(
    sessionID,
    eventToken,
    updateVideoElements,
    removeVideoElement,
    setCameraPublisher,
    setPublisherLoading,
    changeNumSpeakers
  );

  if (!((eventSession as unknown) as boolean))
    return {
      screenshare: canScreenshare,
      eventSession: false,
      message: 'Could not create event session',
      sessionID: false,
    };

  return {
    screenshare: canScreenshare,
    eventSession: eventSession,
    message: 'Connecting to event',
    sessionID,
  };
}
