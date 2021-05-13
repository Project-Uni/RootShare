import React from 'react';
import { makeStyles, Theme as MuiTheme } from '@material-ui/core/styles';

import { RSModal } from '../../../main-platform/reusable-components';
import { RSText } from '../../../base-components';

import { RSLogoFull } from '../../../images';

const useStyles = makeStyles((muiTheme: MuiTheme) => ({
  modal: {
    padding: 10,
  },
  wrapper: {
    maxHeight: 600,
    overflow: 'scroll',
    padding: 30,
  },
}));

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PrivacyPolicyModal(props: Props) {
  const { open, onClose } = props;
  const styles = useStyles();

  return (
    <>
      <RSModal
        open={open}
        onClose={onClose}
        title="Privacy Policy"
        helperText=""
        className={styles.modal}
      >
        <div className={styles.wrapper}>
          <RSText>
            <strong>Rootshare, LLC, (Rootshare)</strong>, is committed to keeping any
            and all personal information collected of those individuals that visit
            our website and make use of our online facilities and services accurate,
            confidential, secure and private. Our privacy policy has been designed
            and created to ensure those affiliated with <strong>Rootshare</strong> of
            our commitment and realization of our obligation not only to meet but to
            exceed most existing privacy standards.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>THEREFORE</strong>, this Privacy Policy Agreement shall apply to{' '}
            <strong>Rootshare</strong>, and thus it shall govern any and all data
            collection and usage thereof. Through the use of{' '}
            <strong>https://rootshare.io</strong> you are herein consenting to the
            following data procedures expressed within this agreement.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            It is highly recommended and suggested that you review the privacy
            policies and statements of any website you choose to use or frequent as a
            means to better understand the way in which other websites garner, make
            use of and share information collected.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Collection of Information
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            This website collects various types of information, such as:
          </RSText>
          <RSText style={{ paddingTop: 20, paddingLeft: 20 }}>
            - Voluntarily provided information which may include your name, address,
            email address, billing and/or credit card information etc., which may be
            used when you purchase products and/or services and to deliver the
            services you have requested.
          </RSText>
          <RSText style={{ paddingTop: 20, paddingLeft: 20 }}>
            - Information automatically collected when visiting our website, which
            may include cookies, third party tracking technologies and server logs.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            Please rest assured that this site shall only collect personal
            information that you knowingly and willingly provide by way of surveys,
            completed membership forms, and emails. It is the intent of this site to
            use personal information only for the purpose for which it was requested
            and any additional uses specifically provided on this site.
          </RSText>
          <RSText>
            <strong>Rootshare</strong> may have the occasion to collect non-personal
            anonymous demographic information, such as age, gender, household income,
            political affiliation, race and religion, as well as the type of browser
            you are using, IP address, type of operating system, at a later time,
            that will assist us in providing and maintaining superior quality
            service.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Use of Information Collected
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            <strong>Rootshare</strong> may collect and may make use of personal
            information to assist in the operation of our website and to ensure
            delivery of the services you need and request. At times, we may find it
            necessary to use personally identifiable information as a means to keep
            you informed of other possible products and/or services that may be
            available to you from https://rootshare.io.{' '}
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Rootshare</strong> may also be in contact with you with regards
            to completing surveys and/or research questionnaires related to your
            opinion of current or potential future services that may be offered.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Rootshare</strong> may feel it necessary, from time to time, to
            make contact with you on behalf of our other external business partners
            with regards to a potential new offer which may be of interest to you. If
            you consent or show interest in presented offers, then, at that time,
            specific identifiable information, such as name, email address and/or
            telephone number, may be shared with the third party.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Rootshare</strong> may find it beneficial to all our customers to
            share specific data with our trusted partners in an effort to conduct
            statistical analysis, provide you with email and/or postal mail, deliver
            support and/or arrange for deliveries to be made. Those third parties
            shall be strictly prohibited from making use of your personal
            information, other than to deliver those services which you requested,
            and as such they are required, in accordance with this agreement, to
            maintain the strictest of confidentiality with regards to all your
            information.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Rootshare</strong> may deem it necessary to follow websites
            and/or pages that their users may frequent in an effort to gleam what
            types of services and/or products may be the most popular to customers or
            the general public.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Rootshare</strong> may disclose your personal information,
            without any prior notice to you, unless required to do in accordance to
            applicable laws and/or in a good faith belief that such action is deemed
            necessary or required in an effort to:
          </RSText>
          <RSText style={{ paddingTop: 20, paddingLeft: 20 }}>
            - Remain in conformance with any decrees, laws and/or statutes or in an
            effort to comply with any process which may be served upon{' '}
            <strong>Rootshare</strong> and/or its website;
          </RSText>
          <RSText style={{ paddingTop: 20, paddingLeft: 20 }}>
            - Maintain, safeguard and/or preserve all the rights and/or property of{' '}
            <strong>Rootshare</strong>;
          </RSText>
          <RSText style={{ paddingTop: 10, paddingLeft: 20 }}>and</RSText>
          <RSText style={{ paddingTop: 10, paddingLeft: 20 }}>
            - Perform under demanding conditions in an effort to safeguard the
            personal safety of users of <strong>https://rootshare.io</strong> and/or
            the general public.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Non-Marketing Purposes
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            <strong>Rootshare</strong> greatly respects your privacy. We do maintain
            and reserve the right to contact you if needed for non-marketing purposes
            (such as bug alerts, security breaches, account issues, and/or changes in{' '}
            <strong>Rootshare</strong> products and services). In certain
            circumstances, we may use our website, newspapers, or other public means
            to post a notice.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Children Under Age of 13
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            <strong>Rootshare</strong> does not knowingly collect personal
            identifiable information from children under the age of thirteen (13)
            without verifiable parental consent. If it is determined that such
            information has been inadvertently collected on anyone under the age of
            thirteen (13), we shall immediately take the necessary steps to ensure
            that such information is deleted from our system's database. Anyone under
            the age of thirteen (13) must seek and obtain parent or guardian
            permission to use this website.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Unsubscribe or Opt-Out
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            All users and/or visitors to our website have the option to discontinue
            receiving communication from us and/or reserve the right to discontinue
            receiving communications by way of email or newsletters. To discontinue
            or unsubscribe to our website please send an email that you wish to
            unsubscribe to <strong>support@rootshare.io</strong>. If you wish to
            unsubscribe or opt-out from any third party websites, you must go to that
            specific website to unsubscribe and/or opt-out.{' '}
            <strong>Rootshare</strong> will continue to adhere to the privacy policy
            described herein with respect to any personal information previously
            collected.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Links to Other Web Sites
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            Our website does contain links to affiliate and other websites.{' '}
            <strong>Rootshare</strong> does not claim nor accept responsibility for
            any privacy policies, practices and/or procedures of other such websites.
            Therefore, we encourage all users and visitors to be aware when they
            leave our website and to read the privacy statements of each and every
            website that collects personally identifiable information. The
            aforementioned <strong>Privacy Policy Agreement</strong> applies only and
            solely to the information collected by our website.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Security
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            <strong>Rootshare</strong> shall endeavor and shall take every precaution
            to maintain adequate physical, procedural and technical security with
            respect to its offices and information storage facilities so as to
            prevent any loss, misuse, unauthorized access, disclosure or modification
            of the user's personal information under our control.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            The company also uses <strong>Secure Socket Layer (SSL)</strong> for
            authentication and private communications in an effort to build users'
            trust and confidence in the internet and website use by providing simple
            and secure access and communication of credit card and personal
            information.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Changes to Privacy Policy Agreement
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            <strong>Rootshare</strong> reserves the right to update and/or change the
            terms of our privacy policy, and as such we will post those changes to
            our website, so that our users and/or visitors are always aware of the
            type of information we collect, how it will be used, and under what
            circumstances, if any, we may disclose such information. If at any point
            in time <strong>Rootshare</strong> decides to make use of any personally
            identifiable information on file, in a manner vastly different from that
            which was stated when this information was initially collected, the user
            or users shall be promptly notified by email. Users at that time shall
            have the option as to whether or not to permit the use of their
            information in this separate manner.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            Acceptance of Terms
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            Through the use of this website, you are hereby accepting the terms and
            conditions stipulated within the aforementioned{' '}
            <strong>Privacy Policy Agreement</strong>. If you are not in agreement
            with our terms and conditions, then you should refrain from further use
            of our sites. In addition, your continued use of our website following
            the posting of any updates or changes to our terms and conditions shall
            mean that you are in agreement and acceptance of such changes.
          </RSText>
          <RSText
            style={{ paddingTop: 20, textDecoration: 'underline' }}
            weight="bold"
          >
            How to Contact Us
          </RSText>
          <RSText style={{ paddingTop: 10 }}>
            If you have any questions or concerns regarding the{' '}
            <strong>Privacy Policy Agreement</strong> related to our website, please
            feel free to contact us at the following emai or mailing address.
          </RSText>
          <RSText style={{ paddingTop: 20 }}>
            <strong>Email:</strong> support@rootshare.io
          </RSText>
          {/* <RSText><strong>Telephone</strong>:</RSText> */}
          <RSText style={{ paddingTop: 20 }} weight="bold">
            Mailing Address:
          </RSText>
          <RSText style={{ paddingLeft: 20 }}>Rootshare, LLC</RSText>
          <RSText style={{ paddingLeft: 20 }}>221 N Broad St Ste 3A</RSText>
          <RSText style={{ paddingLeft: 20 }}>Middletown, Delaware 19709</RSText>
          <RSText style={{ paddingTop: 40 }}>March 15, 2021</RSText>
          <img style={{ paddingTop: 20, maxWidth: 200 }} src={RSLogoFull} />
        </div>
      </RSModal>
    </>
  );
}
