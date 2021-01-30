import { Webinar, User } from '../../models';
import { log } from '../functions';
import json2csv = require('json2csv');
const fs = require('fs');

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

    const reshapedEvents = reshapeEvents(events);
    const csv = convertToCSV(reshapedEvents);
    return csv;
  } catch (err) {
    log('error', err);
    return false;
  }
};

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
  }[]
): ReshapedEvent[] => {
  const output: ReshapedEvent[] = events.map((event) => ({
    title: event.title || `${event.hostCommunity?.name} - Meet The Greeks`,
    description: event.brief_description || event.full_description,
    attendees: (event.attendees_V2 || []).map((attendee) => {
      const copy = Object.assign({}, attendee);
      delete copy._id;
      return copy;
    }),
  }));

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
    log('error', `Failed to parse CSV: ${err.message}`);
    return false;
  }
};

/**
 * Reads all of the attendees for events from the user models
 * and write to a JSON file
 */
const getViewersFromOldEventsAsJSON = async (): Promise<boolean> => {
  const startTime = Date.now();

  const eventAttendees: { [k: string]: string[] } = {};
  try {
    const users: { _id: string; attendedWebinars?: string[] }[] = await User.find(
      {},
      ['attendedWebinars']
    ).exec();
    users.forEach((user) => {
      user.attendedWebinars.forEach((eventID) => {
        if (!(eventID in eventAttendees)) eventAttendees[eventID] = [];
        eventAttendees[eventID].push(user._id);
      });
    });

    const stringifiedEvents = JSON.stringify(eventAttendees);
    fs.writeFileSync('../eventAttendees.json', stringifiedEvents);

    return true;
  } catch (err) {
    console.log('Failed to write to file:', err);
    return false;
  } finally {
    const duration = Date.now() - startTime;
    console.log(`Retrieving and writing duration: ${duration / 1000}s.`);
  }
};

/**
 * Takes the JSON information from @method getViewersFromOldEventsAsJSON
 * and updates the webinar models using it
 */
const updateModelsWithAttendees = async (): Promise<boolean> => {
  const startTime = Date.now();

  try {
    const eventAttendees: { [k: string]: string[] } = JSON.parse(
      fs.readFileSync('../eventAttendees.json')
    );
    const eventIDs = Object.keys(eventAttendees);

    const updatePromises: Promise<unknown>[] = eventIDs.map((eventID) =>
      Webinar.updateOne(
        { _id: eventID },
        { $addToSet: { attendees_V2: { $each: eventAttendees[eventID] } } }
      )
    );

    await Promise.all(updatePromises);
    return true;
  } catch (err) {
    console.log('There was an unexpected error:', err);
    return false;
  } finally {
    const duration = Date.now() - startTime;
    console.log(`Reading file and updating models duration: ${duration / 1000}s.`);
  }
};
