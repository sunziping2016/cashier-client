export enum NetworkStatus {
  Connecting = 0, // sync
  Disconnected = 1, // cloud-alert
  Connected = 2, // cloud-check
  Downloading = 3, // cloud-download
  Uploading = 5, // cloud-upload
}

export interface RootState {
  websocketUrl: string;
  websocketConnectTimeout: number;
  websocketRetryInterval: number;
  websocketRetryIntervalId: number | undefined;
  networkStatus: number;
  offlineMode: boolean;
  myPermissions: MyPermission[];
  myAvailableSubjects: {[subject: string]: boolean};
  mySubjects: {[subject: string]: boolean};
}

export interface MyPermission {
  id: number;
  subject: string;
  action: string;
}
