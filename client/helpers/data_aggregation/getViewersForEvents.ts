import { Webinar } from '../../models';
import { log } from '../functions';
import json2csv = require('json2csv');

const { Parser } = json2csv;
const {
  transforms: { unwind },
} = json2csv;

export const getViewersForEvents = async (
  eventIDs: string[] = [],
  flags: { isMTG?: boolean } = {},
  fields: string[] = [
    'firstName',
    'lastName',
    '_id',
    'email',
    'phoneNumber',
    'major',
    'graduationYear',
    'work',
    'position',
  ]
) => {
  const query: { [k: string]: unknown } = { isDev: false, ...flags };
  if (eventIDs.length > 0) query._id = { $in: eventIDs };

  try {
    let result = Webinar.find(
      { ...query },
      [
        'title',
        'full_description',
        'brief_description',
        'attendees_V2',
        flags.isMTG ? 'hostCommunity' : undefined,
      ].concat(' ')
    ).populate({ path: 'attendees_V2', select: fields.concat(' ') });

    if (flags.isMTG)
      result = result.populate({ path: 'hostCommunity', select: 'name' });

    const events = await result.lean().exec();
    console.log(events);

    const getEventsManual = events.some((event) => !event.attendees_V2);
    if (getEventsManual) {
      getViewsFromUsers();
    }

    const reshapedEvents = reshapeEvents(events);
    const csv = convertToCSV(reshapedEvents);
    return csv;
    // return events;
  } catch (err) {
    log('error', err);
    return false;
  }
};

const getViewsFromUsers = () => {};

type Attendee = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  major?: string;
  graduationYear?: string;
  work?: string;
  position?: string;
};

type ReshapedEvent = {
  title: string;
  description: string;
  attendees: Attendee[];
};

const reshapeEvents = (
  events: {
    _id: string;
    title?: string;
    brief_description?: string;
    full_description: string;
    hostCommunity?: { _id: string; name: string };
    attendees_V2?: Attendee[];
    attendees_V1?: Attendee[];
  }[]
): ReshapedEvent[] => {
  const output: ReshapedEvent[] = events.map((event) => ({
    title: event.title || `${event.hostCommunity?.name} - Meet The Greeks`,
    description: event.brief_description || event.full_description,
    attendees: (event.attendees_V1 || event.attendees_V2 || []).map((attendee) => {
      const copy = Object.assign({}, attendee);
      delete copy._id;
      return copy;
    }),
  }));

  console.log('Reshaped events:', output);
  return output;
};

const convertToCSV = (events: ReshapedEvent[]) => {
  const parser = new Parser({
    fields: [
      { label: 'Title', value: 'title' },
      { label: 'Description', value: 'description' },
      { label: 'First Name', value: 'attendees.firstName' },
      { label: 'Last Name', value: 'attendees.lastName' },
      { label: 'Email', value: 'attendees.email' },
      { label: 'Phone Number', value: 'attendees.phoneNumber' },
      { label: 'Major', value: 'attendees.major' },
      { label: 'Graduation Year', value: 'attendees.graduationYear' },
      { label: 'Company', value: 'attendees.work' },
      { label: 'Job Title', value: 'attendees.position' },
    ],
    transforms: [unwind({ paths: 'attendees', blankOut: true })],
  });

  try {
    const csv = parser.parse(events);
    return csv;
  } catch (err) {
    console.log('Failed to parse CSV');
    console.log('Error:', err);
    return false;
  }
};
