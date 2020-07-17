import log from '../../../../../helpers/logger';

export function createNewWebcamPublisher(
  name: string,
  updateVideoElements: (
    videoElement: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (screenElementID: string) => void
  ) => void
) {
  const publisher = OT.initPublisher(
    '',
    {
      publishVideo: false,
      publishAudio: false,
      insertDefaultUI: false,
    },
    (err) => {
      if (err) alert(err.message);
    }
  );

  publisher.on('videoElementCreated', function(event) {
    updateVideoElements(event.element, 'camera', '', () => {});
  });

  return publisher;
}

export function createNewScreensharePublisher(
  name: string,
  updateVideoElements: (
    videoElement: HTMLVideoElement | HTMLObjectElement,
    videoType: 'camera' | 'screen',
    otherID: string,
    updateStateInHelper: (
      screenElementID: string,
      session: OT.Session,
      screenPublisher: OT.Publisher
    ) => void
  ) => void,
  screenShareTearDown: (
    screenElementID: string,
    session: OT.Session,
    screenPublisher: OT.Publisher
  ) => void,
  stopLiveStream: (webinarID: string) => void
) {
  const publisher = OT.initPublisher(
    ``,
    {
      insertDefaultUI: false,
      videoSource: 'screen',
      resolution: '1280x720',
    },
    (err) => {
      if (err) {
        log('error', err.message);
      }
    }
  );

  publisher.on('videoElementCreated', function(event) {
    updateVideoElements(
      event.element,
      'screen',
      '',
      (screenElementID, session, screenPublisher) => {
        publisher.on('streamDestroyed', function(event) {
          screenShareTearDown(screenElementID, session, screenPublisher);
        });
      }
    );
  });

  return publisher;
}
