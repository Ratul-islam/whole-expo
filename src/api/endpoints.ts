export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME:"/auth/me",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD_VERIFY: "/auth/reset-password/verify",
    RESET_PASSWORD_CONFIRM: "/auth/reset-password/confirm",
    RESEND_OTP: "/auth/resend-otp",

  },
  PATH:{
    NEW: "/path",
    DELETE: "/path",
    ALLPATH: "/path",
    SAVEPATH: "/path/saved-paths",
    DELETESAVEPATH: "/path/saved-paths",
    GETSAVEPATH: "/path/saved-paths",
    CHEKSAVEPATH: "/path/saved-paths/:pathId/check",
  },
  SESSION:{
    START: "/sessions/start",
    COMPLETEDSESSION: "/sessions",
    LEADERBOARD: "/sessions/leaderboard",
  },
  DEVICE:{
    STATUS: "/device/connected",
    LOADPRST: "/device/load-path",
    LIVE: "/device/live"
  },
  USER: {
    PROFILE: "/user"
  }
};
