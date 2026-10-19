export const sessionPeer = {
  loginUrl: () => process.env.LOGIN_FRONT_URL?.trim() ?? '',
  frontUrl: () => process.env.CALENDAR_FRONT_URL?.trim() ?? '',
};
