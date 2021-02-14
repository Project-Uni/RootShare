import { UPDATE_USER } from '../actions/user';

export default function userReducer(
  state = {},
  data: { type: string; payload: { [key: string]: any } }
): { [k: string]: any } {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_USER:
      return payload.user;
    default:
      return state;
  }
}
