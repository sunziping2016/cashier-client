export enum NetworkStatus {
  Connecting = 0, // sync
  Disconnected = 1, // cloud-alert
  Connected = 2, // cloud-check
}

export interface RootState {
  websocketUrl: string;
  websocketRetryInterval: number;
  websocketRetryIntervalId?: number;
  networkStatus: number;
  offlineMode: boolean;
  myPermissions: MyPermission[];
  myAvailableSubjects: {[subject: string]: boolean};
  mySubjects: {[subject: string]: boolean};
  token?: string;
  routerTransition?: string;
}

export interface MyPermission {
  id: number;
  subject: string;
  action: string;
}

export interface SnackbarState {
  snackbar: boolean;
  snackbarText: string;
  snackbarButtonAction: () => void;
  snackbarButtonText: string;
  snackbarButtonColor: string;
}

export interface OpenSnackbarPayload {
  text: string;
  buttonAction?: () => void;
  buttonText?: string;
  buttonColor?: string;
}

export enum UserAccessLevel {
  Public = 'public',
  WithoutRoles = 'without-roles', // without roles
  All = 'all',
}

export function mergeUserAccessLevel(a: UserAccessLevel, b: UserAccessLevel) {
  if (a === UserAccessLevel.All || b === UserAccessLevel.All) {
    return UserAccessLevel.All;
  }
  if (a === UserAccessLevel.WithoutRoles || b === UserAccessLevel.WithoutRoles) {
    return UserAccessLevel.WithoutRoles;
  }
  return UserAccessLevel.Public;
}

export interface UserPublic {
  access: UserAccessLevel.Public;
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  avatar128?: string;
  createdAt: Date;
}

export interface UserWithoutRoles {
  access: UserAccessLevel.WithoutRoles;
  id: number;
  username: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  avatar128?: string;
  blocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAll {
  access: UserAccessLevel.All;
  id: number;
  username: string;
  roles: [number];
  email?: string;
  nickname?: string;
  avatar?: string;
  avatar128?: string;
  blocked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type User = UserPublic | UserWithoutRoles | UserAll;

export interface UsersState {
  users: {
    [id: number]: User;
  };
}
