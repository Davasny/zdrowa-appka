export interface LoginPayload {
  username: string;
  password: string;
  network_id: "mfp";
}

export interface LoginResponse {
  access_token: string;
  destination: {
    id: string;
    type: string;
    off_all: boolean;
  };
}


