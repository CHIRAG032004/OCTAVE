const { Client, Account, Users } = require('node-appwrite');

const isValidAppwriteValue = (value) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    const placeholderPatterns = [/^your_/i, /^<.*>$/, /^none$/i, /^default$/i];
    return !placeholderPatterns.some((pattern) => pattern.test(trimmed));
};

const hasAppwriteClientConfig = Boolean(
    isValidAppwriteValue(process.env.APPWRITE_ENDPOINT) &&
    isValidAppwriteValue(process.env.APPWRITE_PROJECT_ID)
);

const hasAppwriteAdminConfig = Boolean(
    hasAppwriteClientConfig &&
    isValidAppwriteValue(process.env.APPWRITE_API_KEY)
);

let client = null;
let account = null;
let users = null;

if (hasAppwriteAdminConfig) {
    client = new Client();
    client
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    account = new Account(client);
    users = new Users(client);
}

module.exports = {
    client,
    account,
    users,
    hasAppwriteConfig: hasAppwriteClientConfig,
    hasAppwriteAdminConfig,
    createSessionAccount: (sessionId) => {
        if (!hasAppwriteClientConfig || !sessionId) {
            return null;
        }

        const sessionClient = new Client();
        sessionClient
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setSession(sessionId);

        return new Account(sessionClient);
    },
    createJwtAccount: (jwt) => {
        if (!hasAppwriteClientConfig || !jwt) {
            return null;
        }

        const jwtClient = new Client();
        jwtClient
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setJWT(jwt);

        return new Account(jwtClient);
    }
};
