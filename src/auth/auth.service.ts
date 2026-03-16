import { api } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  checkRequest,
} from "./auth.types";
import { tokenStorage } from "../lib/tokenStorage";

export const authService = {
  /* ---------------- LOGIN ---------------- */
  login: async (payload: LoginRequest) => {
    const { data } = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload);

    const access = (data as any)?.data?.accessToken;
    const refresh = (data as any)?.data?.refreshToken;

    if (!access || !refresh) {
      throw new Error("Invalid login response: missing tokens");
    }

    await tokenStorage.setTokens(access, refresh);
    return data;
  },

  /* ---------------- REGISTER ---------------- */
  register: async (payload: RegisterRequest) => {
    const { data } = await api.post<RegisterResponse>(ENDPOINTS.AUTH.REGISTER, payload);
    return data;
  },
  exists: async (payload: checkRequest) => {
    const { data } = await api.post<RegisterResponse>(ENDPOINTS.AUTH.EXISTS, payload);
    return data;
  },

  verifyEmailOtp: async (payload: VerifyEmailOtpRequest) => {
    const { data } = await api.post<VerifyEmailOtpResponse>(ENDPOINTS.AUTH.VERIFY_EMAIL, payload);
    return data;
  },

  resendEmailOtp: async (payload: ResendOtpRequest) => {
    const { data } = await api.post<ResendOtpResponse>(ENDPOINTS.AUTH.RESEND_OTP, payload);
    return data;
  },

  /* ---------------- ME ---------------- */
  me: async () => {
    const { data } = await api.get(ENDPOINTS.AUTH.ME);
    return data;
  },

  /* ---------------- PASSWORD RESET ---------------- */
  forgotPassword: async (payload: ForgotPasswordRequest) => {
    const { data } = await api.post<ForgotPasswordResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);
    return data;
  },

  resetPasswordVerifyOtp: async (payload: { email: string; code: string }) => {
    const { data } = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD_VERIFY, payload);
    return data;
  },

  resetPasswordConfirm: async (payload: ResetPasswordRequest) => {
    const { data } = await api.post<ResetPasswordResponse>(ENDPOINTS.AUTH.RESET_PASSWORD_CONFIRM, payload);
    return data;
  },

  /* ---------------- LOGOUT ---------------- */
  logout: async () => {
    await tokenStorage.clear();
  },
};
