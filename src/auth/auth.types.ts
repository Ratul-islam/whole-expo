export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
export type LoginResponse = AuthTokens & {
   status: string;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

export type ForgotPasswordRequest = {
  email: string;
}
export type ForgotPasswordResponse = {
  status: Number;
  message: string;
}
export type ResetPasswordRequest = {
  resetToken:string;
  password: string;
};

export type ResetPasswordResponse = {
  email: string;
  password: string;
};


export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type checkRequest = {
  email: string;
};

export type RegisterResponse = {
  message: string;
  data: {
    id: string;
    email: string;
  };
};



export type VerifyEmailOtpRequest = {

  email: string;
  code: string;
};

export type VerifyEmailOtpResponse = {
  message: string;
};

export type ResendOtpRequest = {
  email: string;
  type: string;
};

export type ResendOtpResponse = {
  message: string;
};