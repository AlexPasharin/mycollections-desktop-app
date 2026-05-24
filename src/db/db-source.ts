export enum DbSource {
  LocalDevDb = "localDevDb",
  LocalProdDb = "localProdDb",
  RemoteProdDb = "remoteProdDb",
}

export const DEFAULT_DB_SOURCE = DbSource.LocalProdDb;
