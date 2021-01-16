import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';
import { updateAccessToken, updateRefreshToken } from '../redux/actions/token';
import { makeRequest } from '../helpers/functions';

import RSText from '../base-components/RSText';

import EventClientHeader from './EventClientHeader';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';

import EventWatcherVideoContainer from './event-video/event-watcher/EventWatcherVideoContainer';
import EventHostContainer from './event-video/event-host/EventHostContainer';
import EventWatcherMobile from './event-video/event-watcher/event-watcher-mobile/EventWatcherMobile';

import EventClientAdvertisement from './EventClientAdvertisement';
import EventMessageContainer from './event-messages/EventMessageContainer';
import EventWelcomeModal from './EventWelcomeModal';

import RootShareDefaultBanner from '../images/event/RootShareDefaultBanner.png';

import { colors } from '../theme/Colors';
import { EventType, MuxMetaDataType, SpeakRequestType } from '../helpers/types';

import socketIOClient from 'socket.io-client';
import SpeakingInviteDialog from './event-video/event-watcher/SpeakingInvitationDialog';

import ManageSpeakersSnackbar from './event-video/event-host/ManageSpeakersSnackbar';
import { slideLeft } from '../helpers/functions';
import { SnackbarMode, EventUserMode } from '../helpers/types';

const WEBINAR_CACHE_IP =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8003'
    : 'https://cache.rootshare.io';

const useStyles = makeStyles((_: any) => ({
  wrapper: {
    background: colors.secondaryText,
  },
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  right: { height: '100%' },
  adContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
}));

type Props = {
  match: {
    params: { [key: string]: any };
    [key: string]: any;
  };
  user: { [key: string]: any };
  accessToken: string;
  refreshToken: string;
  updateUser: (userInfo: { [key: string]: any }) => void;
  updateAccessToken: (accessToken: string) => void;
  updateRefreshToken: (refreshToken: string) => void;
};

var socket: SocketIOClient.Socket;
var speakingToken: string;
var sessionID: string;

function EventClientBase(props: Props) {
  const styles = useStyles();

  const [advertisements, setAdvertisements] = useState(['black']);
  const [adLoaded, setAdLoaded] = useState(false);
  const [eventMode, setEventMode] = useState<EventUserMode>('viewer');
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const [webinarData, setWebinarData] = useState<EventType | {}>({});
  const [muxMetaData, setMuxMetaData] = useState<MuxMetaDataType>();

  const [showSpeakingInvite, setShowSpeakingInvite] = useState(false);
  const [showRequestSpeakButton, setShowRequestSpeakButton] = useState(false);
  const [speakRequests, setSpeakRequests] = useState<SpeakRequestType[]>([]);

  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarMode, setSnackbarMode] = useState<
    'success' | 'error' | 'notify' | null
  >(null);
  const [transition, setTransition] = useState<any>();

  const webinarEvent = webinarData as EventType;
  const currConversationID = webinarEvent.conversation as string;

  const eventID = props.match.params['eventid'];
  const minHeaderWidth = getHeaderMinWidth();

  useEffect(() => {
    if (checkAuth()) {
      fetchEventInfo();
    }
  }, []);

  async function checkAuth() {
    const { data } = await makeRequest(
      'GET',
      '/user/getCurrent',
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] !== 1) {
      props.updateUser({});
      props.updateAccessToken('');
      props.updateRefreshToken('');
      setLoginRedirect(true);
      return false;
    }
    props.updateUser({ ...data['content'] });
    return true;
  }

  async function fetchEventInfo() {
    const { data } = await makeRequest(
      'GET',
      `/api/webinar/getDetails/${eventID}`,
      {},
      true,
      props.accessToken,
      props.refreshToken
    );
    if (data['success'] === 1) {
      const { webinar } = data['content'];
      console.log(webinar);
      setWebinarData(webinar);
      fetchAds(webinar.eventBanner);
      setMuxMetaData({
        viewerUserID: props.user._id,
        webinarID: webinar._id,
        eventTitle: webinar.title,
      });
      setTimeout(() => {
        setPageMode(webinar);
      }, 100);
    }
  }

  function fetchAds(eventBanner: any) {
    const ads = [eventBanner || RootShareDefaultBanner];
    setAdvertisements(ads);
    setAdLoaded(true);
  }

  function setPageMode(webinar: EventType) {
    if (props.user._id === webinar.host) {
      initializeHostSocket(webinar._id);
      setEventMode('host');
      return;
    } else {
      for (let i = 0; i < webinar.speakers.length; i++) {
        if (props.user._id === webinar.speakers[i]) {
          setEventMode('speaker');
          return;
        }
      }
    }
    updateAttendeeList(webinar['_id']);
    setEventMode('viewer');
  }

  function updateAttendeeList(webinarID: string) {
    initializeViewerSocket(webinarID);

    makeRequest(
      'POST',
      '/api/webinar/updateAttendeeList',
      {
        webinarID: webinarID,
      },
      true,
      props.accessToken,
      props.refreshToken
    );
  }

  async function initializeHostSocket(webinarID: string) {
    setSpeakRequests([]);
    socket = socketIOClient(WEBINAR_CACHE_IP);
    socket.emit('new-host', webinarID);

    socket.on('request-to-speak', (viewer: SpeakRequestType) => {
      setSpeakRequests((prevRequests) => prevRequests.concat(viewer));
    });
  }

  function removeSpeakRequest(viewerID: string) {
    setSpeakRequests((prevSpeakRequests) => {
      let newSpeakRequests = prevSpeakRequests.slice();
      for (let i = 0; i < newSpeakRequests.length; i++)
        if (newSpeakRequests[i]._id === viewerID) {
          newSpeakRequests.splice(i, 1);
          return newSpeakRequests;
        }

      return newSpeakRequests;
    });
  }

  function initializeViewerSocket(webinarID: string) {
    socket = socketIOClient(WEBINAR_CACHE_IP);
    socket.emit('new-user', {
      webinarID: webinarID,
      userID: props.user._id,
      firstName: props.user.firstName,
      lastName: props.user.lastName,
      email: props.user.email,
    });

    socket.on(
      'speaking-invite',
      (data: { speakingToken: string; sessionID: string }) => {
        speakingToken = data.speakingToken;
        console.log(
          'Received invitation to speak with speakingToken:',
          speakingToken
        );
        sessionID = data.sessionID;
        setShowSpeakingInvite(true);
      }
    );

    socket.on('speaking-revoke', () => {
      speakingToken = '';
      sessionID = '';
      // alert('You have been removed as a speaker');
      window.location.reload(true);
    });

    socket.on('speaking-token-rejected', () => {
      alert('There was an error adding you as a speaker');
    });

    socket.on('speaking-token-accepted', () => {
      setEventMode('speaker');
    });

    socket.on('event-started', () => {
      if (window.confirm('The event has started. Refresh the page?'))
        window.location.reload(true);
    });

    socket.on('removed-from-event', () => {
      window.location.href = '/';
    });
  }

  function onAcceptSpeakingInvite() {
    socket.emit('speaking-invite-accepted', { speakingToken });
    setShowSpeakingInvite(false);
  }

  function onRejectSpeakingInvite() {
    socket.emit('speaking-invite-rejected');
    setShowSpeakingInvite(false);
  }

  function onRequestToSpeak() {
    socket.emit('request-to-speak', webinarEvent._id);
    handleSnackbar('Requested Host to join as a speaker', 'notify');
  }

  function handleWelcomeModalAck() {
    setShowWelcomeModal(false);
  }

  function handleSnackbar(message: string, mode: SnackbarMode) {
    setSnackbarMessage(message);
    setSnackbarMode(mode);
    setTransition(() => slideLeft);
  }

  function renderVideoArea() {
    if (eventMode === 'viewer')
      return (
        <EventWatcherVideoContainer
          muxPlaybackID={
            webinarEvent.muxAssetPlaybackID || webinarEvent.muxPlaybackID
          }
          muxMetaData={muxMetaData as MuxMetaDataType}
          eventImage={webinarEvent.eventImage}
          onEventStart={() => setShowRequestSpeakButton(true)}
          // TODO: Add event flag for this later to allow host to specify if they want this
          // button/function available for the event or not */
        />
      );
    else
      return (
        <EventHostContainer
          mode={eventMode as 'host' | 'speaker'}
          webinar={webinarEvent}
          speakingToken={speakingToken}
          sessionID={sessionID}
          speakRequests={speakRequests}
          removeSpeakRequest={removeSpeakRequest}
          initializeHostSocket={initializeHostSocket}
        />
      );
  }

  function getHeaderMinWidth() {
    if (eventMode === 'viewer') return 1150;
    else return 1150;
  }

  function checkMobile() {
    let check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      )
        check = true;
    })(navigator.userAgent || navigator.vendor);
    return check;
  }

  if (checkMobile()) {
    if (eventMode === 'viewer')
      return (
        <div className={styles.wrapper}>
          {loginRedirect && <Redirect to={`/login?redirect=/event/${eventID}`} />}

          <EventWatcherMobile
            muxPlaybackID={
              webinarEvent.muxAssetPlaybackID || webinarEvent.muxPlaybackID
            }
            muxMetaData={muxMetaData as MuxMetaDataType}
            eventImage={webinarEvent.eventImage}
          />

          <div className={styles.adContainer}>
            {adLoaded && (
              <EventClientAdvertisement
                height={60}
                width={window.innerWidth}
                advertisements={advertisements}
              />
            )}
          </div>
        </div>
      );
    else
      return (
        <div className={styles.wrapper}>
          {loginRedirect && <Redirect to={`/login?redirect=/event/${eventID}`} />}
          <HypeHeader />
          <RSText type="subhead" size={16}>
            Video conference feature is currently not available on mobile. Please
            switch to a desktop.
          </RSText>
        </div>
      );
  }

  return (
    <div id="wrapper" className={styles.wrapper}>
      {loginRedirect && <Redirect to={`/login?redirect=/event/${eventID}`} />}
      <ManageSpeakersSnackbar
        message={snackbarMessage}
        transition={transition}
        mode={snackbarMode}
        handleClose={() => setSnackbarMode(null)}
      />
      <SpeakingInviteDialog
        open={showSpeakingInvite}
        onReject={onRejectSpeakingInvite}
        onAccept={onAcceptSpeakingInvite}
      />
      <EventClientHeader minWidth={minHeaderWidth} showNavigationMenuDefault />
      <div className={styles.body}>
        <div className={styles.left}>
          {renderVideoArea()}
          {eventMode === 'viewer' && (
            <div className={styles.adContainer}>
              <EventWelcomeModal
                open={showWelcomeModal}
                onAck={handleWelcomeModalAck}
              />

              {adLoaded && (
                <EventClientAdvertisement
                  height={125}
                  width={800}
                  advertisements={advertisements}
                />
              )}
            </div>
          )}
        </div>
        <div className={styles.right}>
          <EventMessageContainer
            conversationID={currConversationID}
            isHost={eventMode === 'host'}
            webinarID={webinarEvent._id}
            onRequestToSpeak={
              showRequestSpeakButton && eventMode === 'viewer'
                ? onRequestToSpeak
                : undefined
            }
            communityID={
              webinarEvent.hostCommunity ? webinarEvent.hostCommunity : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
    updateAccessToken: (accessToken: string) => {
      dispatch(updateAccessToken(accessToken));
    },
    updateRefreshToken: (refreshToken: string) => {
      dispatch(updateRefreshToken(refreshToken));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventClientBase);
