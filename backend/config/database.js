const { initializeFirebase } = require('./firebase');

const connectDatabase = async () => {
    try {
        await initializeFirebase();
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = {
    connectDatabase,
};
