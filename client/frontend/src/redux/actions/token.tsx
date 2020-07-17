export const UPDATE_ACCESS_TOKEN = 'tokens:updateAccess';
export const UPDATE_REFRESH_TOKEN = 'tokens:updateRefresh';

export function updateAccessToken(accessToken: string) {
  return {
    type: UPDATE_ACCESS_TOKEN,
    payload: {
      accessToken,
    },
  };
}

export function updateRefreshToken(refreshToken: string) {
  return {
    type: UPDATE_REFRESH_TOKEN,
    payload: { refreshToken },
  };
}
