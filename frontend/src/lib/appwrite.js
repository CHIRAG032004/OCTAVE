import { Account, Client, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('69d7ead700140df655f6');

const account = new Account(client);
const databases = new Databases(client);
const isAppwriteConfigured = true;

export { client, account, databases, ID, isAppwriteConfigured };
