const Log = require('../models/Log');

const normalizeLogRecord = (log) => ({
    ...log,
    createdAt: log.createdAt?.toDate ? log.createdAt.toDate() : log.createdAt,
    updatedAt: log.updatedAt?.toDate ? log.updatedAt.toDate() : log.updatedAt,
});

const matchesText = (value, query) => {
    if (!query) return true;
    return String(value || '').toLowerCase().includes(String(query).toLowerCase());
};

const countBy = (items, key) => {
    const counts = new Map();
    items.forEach((item) => {
        const group = item[key] || 'unknown';
        counts.set(group, (counts.get(group) || 0) + 1);
    });

    return Array.from(counts.entries()).map(([group, count]) => ({ _id: group, count }));
};

const createLog = async (req, res) => {
    try {
        const log = await Log.create({
            userType: req.body.userType,
            userId: req.body.userId,
            action: req.body.action,
            issueId: req.body.issueId,
            details: req.body.details,
            severity: req.body.severity,
            ipAddress: req.body.ipAddress,
            deviceInfo: req.body.deviceInfo,
        });
        res.status(201).send(log);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            userType,
            action,
            severity,
            userId,
            startDate,
            endDate,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const parsedPage = Number.parseInt(page, 10) || 1;
        const parsedLimit = Number.parseInt(limit, 10) || 50;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        const sortDirection = order === 'asc' ? 1 : -1;

        const allLogs = (await Log.find()).map(normalizeLogRecord);
        const filteredLogs = allLogs.filter((log) => {
            if (userType && log.userType !== userType) return false;
            if (severity && log.severity !== severity) return false;
            if (userId && log.userId !== userId) return false;
            if (!matchesText(log.action, action)) return false;
            if (start && (!log.createdAt || new Date(log.createdAt) < start)) return false;
            if (end && (!log.createdAt || new Date(log.createdAt) > end)) return false;
            return true;
        });

        const sortedLogs = filteredLogs.sort((left, right) => {
            const leftValue = left[sortBy];
            const rightValue = right[sortBy];

            if (leftValue instanceof Date || rightValue instanceof Date) {
                return (new Date(leftValue || 0) - new Date(rightValue || 0)) * sortDirection;
            }

            if (typeof leftValue === 'string' || typeof rightValue === 'string') {
                return String(leftValue || '').localeCompare(String(rightValue || '')) * sortDirection;
            }

            return ((leftValue || 0) - (rightValue || 0)) * sortDirection;
        });

        const skip = (parsedPage - 1) * parsedLimit;
        const logs = sortedLogs.slice(skip, skip + parsedLimit);
        const total = filteredLogs.length;

        res.status(200).json({
            total,
            page: parsedPage,
            totalPages: Math.ceil(total / parsedLimit),
            count: logs.length,
            logs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getLogStats = async (req, res) => {
    try {
        const allLogs = (await Log.find()).map(normalizeLogRecord);
        const severityStats = countBy(allLogs, 'severity');
        const actionStats = countBy(allLogs, 'action')
            .sort((left, right) => right.count - left.count)
            .slice(0, 10);
        const userTypeStats = countBy(allLogs, 'userType');

        const recentActivity = [...allLogs]
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
            .slice(0, 10)
            .map(({ _id, action, userType, userId, createdAt, severity, issueId }) => ({
                _id,
                action,
                userType,
                userId,
                createdAt,
                severity,
                issueId,
            }));

        res.status(200).json({
            severityStats,
            topActions: actionStats,
            userTypeStats,
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const logAction = async (data) => {
    try {
        const {
            userType = 'user',
            userId,
            action,
            issueId,
            details,
            severity = 'info',
            ipAddress,
            deviceInfo,
            req
        } = data;

        let extractedIP = ipAddress;
        let extractedDevice = deviceInfo;

        if (req) {
            extractedIP = extractedIP || req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
            extractedDevice = extractedDevice || req.headers['user-agent'];
        }

        return await Log.create({
            userType,
            userId,
            action,
            issueId,
            details,
            severity,
            ipAddress: extractedIP,
            deviceInfo: extractedDevice
        });
    } catch (error) {
        console.error('Error creating log:', error.message);
        return null;
    }
};

const cleanupLogs = async (req, res) => {
    try {
        const { days = 90 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - Number.parseInt(days, 10));

        const result = await Log.deleteMany({
            createdAt: { $lt: cutoffDate },
            severity: { $ne: 'critical' }
        });

        res.status(200).json({
            message: `Deleted ${result.deletedCount} log entries older than ${days} days`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createLog,
    getLogs,
    getLogStats,
    logAction,
    cleanupLogs
};
