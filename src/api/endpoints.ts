export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME:"/auth/me",
    EXISTS:"/auth/exists",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD_VERIFY: "/auth/reset-password/verify",
    RESET_PASSWORD_CONFIRM: "/auth/reset-password/confirm",
    RESEND_OTP: "/auth/resend-otp",

  },
  PATH:{
    NEW: "/path",
    UPDATE: "/path",
    PATHDETAILS: "/path",
    DELETE: "/path",
    ALLPATH: "/path",
    SAVEPATH: "/path/saved",
    DELETESAVEPATH: "/path/saved",
    GETSAVEPATH: "/path/saved",
    CHEKSAVEPATH: "/path/saved/:pathId/check",
  },
  SESSION:{
    START: "/sessions/start",
    COMPLETEDSESSION: "/sessions",
    LEADERBOARD: "/sessions/leaderboard",
  },
  DEVICE:{
    STATUS: "/device/connected",
    LOADPRST: "/device/load-path",
    STARTGAME: "/device/start-game",
    PAUSEGAME: "/device/pause-game",
    RESUMEGAME: "/device/resume-game",
    LIVE: "/device/live"
  },
  USER: {
    PROFILE: "/user"
  }
};
