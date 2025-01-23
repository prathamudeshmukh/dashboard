export type User = {
  email: string;
  username: string;
  clientId: string;
};

export type ClientConfigs = {
  clientId: string;
  id?: string;
  createdAt?: Date;
  clientSecret: string;
};
