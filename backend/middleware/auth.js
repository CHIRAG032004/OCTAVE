const { createJwtAccount, createSessionAccount, hasAppwriteConfig } = require('../lib/appwrite');

const buildDemoAuth = (sessionId) => {
    const normalized = String(sessionId || '').trim();

    if (normalized.startsWith('demo:')) {
        try {
            const payload = normalized.slice(5);
            const parsed = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
            const labels = Array.isArray(parsed.labels) ? parsed.labels : [];

            return {
                sessionId: normalized,
                userId: parsed.userId,
                labels,
                isAdmin: labels.includes('admin'),
                mode: 'demo',
            };
        } catch (error) {
            console.warn('Invalid demo auth token:', error.message);
        }
    }

    const isAdmin = normalized.toLowerCase().includes('admin');

    return {
        sessionId: normalized,
        userId: normalized,
        labels: isAdmin ? ['admin'] : [],
        isAdmin,
        mode: 'demo',
    };
};

const requireAuth = (options = {}) => {
    const { admin = false } = options;

    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const sessionId = authHeader.substring(7).trim();
            if (!sessionId) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            let auth;

            if (hasAppwriteConfig) {
                let appwriteAccount = null;

                if (sessionId.startsWith('demo:')) {
                    auth = buildDemoAuth(sessionId);
                } else if (sessionId.startsWith('jwt:')) {
                    appwriteAccount = createJwtAccount(sessionId.substring(4).trim());
                } else {
                    appwriteAccount = createSessionAccount(sessionId);
                }

                if (!auth && !appwriteAccount) {
                    return res.status(401).json({ error: 'Authentication unavailable' });
                }

                if (!auth) {
                    const user = await appwriteAccount.get();
                    const labels = Array.isArray(user.labels) ? user.labels : [];

                    auth = {
                        sessionId,
                        userId: user.$id,
                        email: user.email,
                        labels,
                        isAdmin: labels.includes('admin'),
                        mode: 'appwrite',
                    };
                }
            } else {
                auth = buildDemoAuth(sessionId);
            }

            if (admin && !auth.isAdmin) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            req.auth = auth;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            return res.status(401).json({ error: 'Authentication failed' });
        }
    };
};

module.exports = { requireAuth };
