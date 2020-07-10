import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { updateUser } from '../redux/actions/user';

import RSText from '../base-components/RSText';

import EventClientHeader from './EventClientHeader';
import HypeHeader from '../hype-page/headerFooter/HypeHeader';
import HypeFooter from '../hype-page/headerFooter/HypeFooter';

import EventWatcherVideoContainer from './event-video/event-watcher/EventWatcherVideoContainer';
import EventHostContainer from './event-video/event-host/EventHostContainer';

import EventClientAdvertisement from './EventClientAdvertisement';
import EventClientMessageContainer from './event-messages/EventMessageContainer';

import SampleEventAd from '../images/sample_event_ad.png';
import SampleAd2 from '../images/sampleAd2.png';

const useStyles = makeStyles((_: any) => ({
  wrapper: {},
  body: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  right: {},
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
  updateUser: (userInfo: { [key: string]: any }) => void;
};

type EVENT_MODE = 'viewer' | 'speaker' | 'admin';

function EventClientBase(props: Props) {
  const styles = useStyles();

  const [advertisements, setAdvertisements] = useState(['black']);
  const [adLoaded, setAdLoaded] = useState(false);
  const [eventMode, setEventMode] = useState<EVENT_MODE>('viewer');
  const [loginRedirect, setLoginRedirect] = useState(false);

  const eventID = props.match.params['eventid'];
  const minHeaderWidth = getHeaderMinWidth();

  useEffect(() => {
    if (checkAuth()) {
      checkDevAuth();
      fetchAds();
      setDevPageMode();
    }
  }, []);

  async function checkAuth() {
    const { data } = await axios.get('/user/getCurrent');
    if (data['success'] !== 1) {
      setLoginRedirect(true);
      return false;
    }
    return true;
  }

  //TODO - Remove after actual auth implemented
  function checkDevAuth() {
    if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
      const { email } = props.user;
      const validTestEmails = [
        'smitdesai422@gmail.com',
        'mahesh.ashwin1998@gmail.com',
        'mahesh2@purdue.edu',
      ];
      if (!validTestEmails.includes(email)) setLoginRedirect(true);
    }
  }

  function fetchAds() {
    const ads = [SampleEventAd, SampleAd2];
    setAdvertisements(ads);
    setAdLoaded(true);
  }

  function setDevPageMode() {
    //TODO - Set this mode based on the webinar data. Pass it in from the server and continue.
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      switch (eventID.charAt(eventID.length - 1)) {
        case '0':
          return setEventMode('viewer');
        case '1':
          return setEventMode('speaker');
        case '2':
          return setEventMode('admin');
        default:
          return setEventMode('viewer');
      }
    }
  }

  function renderVideoArea() {
    if (eventMode === 'viewer') return <EventWatcherVideoContainer />;
    else return <EventHostContainer mode={eventMode as 'admin' | 'speaker'} />;
  }

  function getHeaderMinWidth() {
    if (eventMode === 'viewer') return 1102;
    else return 1102;
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
    return (
      <div className={styles.wrapper}>
        {loginRedirect && <Redirect to="/login" />}
        <HypeHeader />
        <RSText type="subhead" size={16}>
          The live event feature is currently not available on mobile. Please switch
          to a desktop.
        </RSText>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {loginRedirect && <Redirect to="/login" />}
      <EventClientHeader minWidth={minHeaderWidth} />
      <div className={styles.body}>
        <div className={styles.left}>
          {renderVideoArea()}
          {eventMode === 'viewer' && (
            <div className={styles.adContainer}>
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
          <EventClientMessageContainer />
        </div>
      </div>
      <HypeFooter minWidth={minHeaderWidth} />
    </div>
  );
}

const mapStateToProps = (state: { [key: string]: any }) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateUser: (userInfo: { [key: string]: any }) => {
      dispatch(updateUser(userInfo));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EventClientBase);
