import { SINGLE_DIGIT } from '../../../../../types/types';

const VIDEO_UI_SETTINGS = {
  width: '100%',
  height: '100%',
};

// For styling guide refer to https://tokbox.com/developer/guides/customize-ui/js/

//TODO - If we decide not to use this function in the future, delete it
function initializeWebcam(
  eventSession: OT.Session,
  name: string,
  eventPos: SINGLE_DIGIT
) {
  const publisher = createNewWebcamPublisher(name, eventPos);
  eventSession.publish(publisher, (err) => {
    if (err) alert(err.message);
  });
  setTimeout(() => {
    publisher.publishAudio(true);
  }, 500);

  return publisher;
}

export function createNewWebcamPublisher(name: string, eventPos: SINGLE_DIGIT) {
  const publisher = OT.initPublisher(
    `pos${eventPos}`,
    {
      insertMode: 'append',
      name: name,
      // publishAudio: false,
      // publishVideo: false,
      ...VIDEO_UI_SETTINGS,
    },
    (err) => {
      if (err) alert(err.message);
    }
  );
  return publisher;
}

export function createNewScreensharePublisher(name: string, eventPos: SINGLE_DIGIT) {
  const publisher = OT.initPublisher(
    `pos${eventPos}`,
    {
      videoSource: 'screen',
      insertMode: 'append',
      name: name,
      ...VIDEO_UI_SETTINGS,
    },
    (err) => {
      if (err) alert(err.message);
    }
  );
  return publisher;
}
