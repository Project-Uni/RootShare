import { UPDATE_ACCESS_TOKEN, UPDATE_REFRESH_TOKEN } from '../actions/token';

export function accessTokenReducer(
  state = '',
  data: { type: string; payload: { accessToken: string } }
): string {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_ACCESS_TOKEN:
      return payload.accessToken;
    default:
      return state;
  }
}

export function refreshTokenReducer(
  state = '',
  data: { type: string; payload: { refreshToken: string } }
): string {
  const { type, payload } = data;
  switch (type) {
    case UPDATE_REFRESH_TOKEN:
      return payload.refreshToken;
    default:
      return state;
  }
}
