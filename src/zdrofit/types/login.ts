export interface LoginPayload {
  username: string;
  password: string;
  network_id: "mfp";
}

export type AccessToken = string;

export interface LoginResponse {
  access_token: AccessToken;
  destination: {
    id: string;
    type: string;
    off_all: boolean;
  };
}


