const { initializeFirebase } = require('./firebase');

let connectionPromise = null;

const connectDatabase = async () => {
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = initializeFirebase().catch((error) => {
        console.error('Database connection error:', error.message);
        connectionPromise = null;
        throw error;
    });

    return connectionPromise;
};

module.exports = {
    connectDatabase,
};
