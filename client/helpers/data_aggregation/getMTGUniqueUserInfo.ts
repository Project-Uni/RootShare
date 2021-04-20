import { MeetTheGreekInterest, Webinar } from '../../models';

export async function getUniqueInterested() {
  const data: any[] = await MeetTheGreekInterest.find({}, 'answers user')
    .populate({ path: 'user', select: 'firstName lastName email phoneNumber' })
    .exec();

  const reducedData = {};
  data.forEach((currentInterest) => {
    if (!(currentInterest.user._id in reducedData)) {
      reducedData[
        currentInterest.user._id
      ] = `${currentInterest.user.firstName} ${currentInterest.user.lastName}`;
    }
  });

  return reducedData;
}

export async function getTotalMTGViewers() {
  const events = await Webinar.find(
    { scaleEventType: 'mtg', isDev: false },
    'attendees_V2'
  )
    .populate({ path: 'attendees_V2', select: 'firstName lastName email _id' })
    .lean()
    .exec();

  const output = {};
  const chain = events
    .map((event) => event.attendees_V2)
    .forEach((event) => {
      if (event) {
        event.forEach((attendee) => {
          if (attendee._id && !(attendee._id in output)) {
            output[attendee._id] = {
              firstName: attendee.firstName,
              lastName: attendee.lastName,
            };
          }
        });
      }
    });

  const filteredOutput = Object.keys(output).map(
    (key) => `${output[key].firstName} ${output[key].lastName}`
  );
  return filteredOutput;
}
