export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/user/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME:"/auth/me",
    EXISTS:"/auth/user/exists",
    REGISTER: "/auth/user/register",
    VERIFY_EMAIL: "/auth/user/verify",
    FORGOT_PASSWORD: "/auth/user/forgot-password",
    RESET_PASSWORD_VERIFY: "/auth/user/reset-password/verify",
    RESET_PASSWORD_CONFIRM: "/auth/user/reset-password/confirm",
    RESEND_OTP: "/auth/user/resend-otp",

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
    START: "/session/start",
    COMPLETEDSESSION: "/session",
    LEADERBOARD: "/session/leaderboard",
  },
  DEVICE:{
    STATUS: "/device/connected",
    LOADPRST: "/session/load-path",
    STARTGAME: "/session/start-game",
    PAUSEGAME: "/session/pause-game",
    RESUMEGAME: "/session/resume-game",
    ENDGAME: "/session/end-game",
    LIVE: "/device/live",
    MODULES:{
      GET_ALL_CONNECTED: "/device/:macAddress/modules"
    }
  },
  USER: {
    PROFILE: "/user"
  }
};
