export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  address: string;
}
export interface SafeUser extends TokensResponse {
  user: AuthUser;
}
export interface MessageResponse {
  readonly message: string;
}

export interface TokensResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface TokenResponse {
  readonly accessToken: string;
}