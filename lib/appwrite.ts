import { Client, Account } from 'appwrite';

const client = new Client();

if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '');
}

const account = new Account(client);

export { client, account };
