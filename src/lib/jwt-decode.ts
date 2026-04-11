import {jwtDecode} from "jwt-decode";

type TokenPayload = {
  id: string;
  email: string;
  exp: number;
};

export const getUserFromToken = (token: string): TokenPayload | null => {
    console.log("gg "+token)
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
};