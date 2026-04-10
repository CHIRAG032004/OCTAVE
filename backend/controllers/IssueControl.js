const Issue = require('../models/Issue');
const analyzeImage = require('../utils/analyseImage');
const getLocation = require('../utils/getLocation');
const { logAction } = require('./logControl');

const VALID_STATUSES = ['open', 'in progress', 'pending', 'closed', 'resolved'];

const normalizeStatus = (value, fallback = 'pending') => {
    if (!value || typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
    return VALID_STATUSES.includes(normalized) ? normalized : fallback;
};

const hasValidCoordinates = (coordinates) => {
    if (!coordinates || typeof coordinates !== 'object') {
        return false;
    }

    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);
    return Number.isFinite(latitude) && Number.isFinite(longitude);
};

const createIssue = async (req, res) => {
    try {
        const { userMessage, coordinates, imageUrl } = req.body;
        const userId = req.auth?.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!hasValidCoordinates(coordinates)) {
            return res.status(400).json({ error: 'Valid location is required' });
        }

        if (!imageUrl) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const analysis = await analyzeImage(imageUrl);
        const { city, state } = await getLocation(coordinates.latitude, coordinates.longitude);
        const newIssue = await Issue.create({
            userId,
            userMessage: userMessage || '',
            category: analysis.category || 'Unknown',
            title: analysis.title || 'Unknown Issue',
            coordinates,
            city,
            state,
            status: 'pending',
            votes: 0,
            voters: [],
            imageUrl: imageUrl || ''
        });

        await logAction({
            userType: 'user',
            userId,
            action: 'Create Issue',
            issueId: newIssue._id,
            details: `New issue "${newIssue.title}" reported in ${city}, ${state}`,
            severity: 'info',
            req
        });

        res.status(201).json(newIssue);
    } catch (error) {
        console.error('Error creating issue:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getAllIssues = async (req, res) => {
    try {
        const issues = await Issue.collection().orderBy('createdAt', 'desc').get();
        const allIssues = issues.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
        res.status(200).json(allIssues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUsersIssues = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (!req.auth?.isAdmin && req.auth?.userId !== userId) {
            return res.status(403).json({ error: 'You can only view your own issues' });
        }

        const userIssues = (await Issue.find({ userId }))
            .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0));

        res.status(200).json(userIssues);
    } catch (error) {
        console.error('Error fetching user issues:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getIssues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            city,
            state,
            sortBy = 'createdAt',
            order = 'desc',
        } = req.query;

        const filter = {};
        if (status) filter.status = normalizeStatus(status);
        if (city) filter.city = city;
        if (state) filter.state = state;

        const result = await Issue.findWithPagination(
            filter,
            Number.parseInt(page, 10),
            Number.parseInt(limit, 10),
            sortBy,
            order
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = normalizeStatus(req.body.status, null);

        if (!status) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const isAdmin = Boolean(req.auth?.isAdmin);
        const isOwner = req.auth?.userId === issue.userId;

        if (!isAdmin) {
            if (!isOwner || status !== 'resolved') {
                return res.status(403).json({ error: 'You are not allowed to update this issue status' });
            }
        }

        const previousStatus = issue.status;
        const updatedIssue = await Issue.update(id, { status });

        await logAction({
            userType: isAdmin ? 'admin' : 'user',
            userId: req.auth?.userId || 'system',
            action: 'Update Issue Status',
            issueId: id,
            details: `Issue status changed from "${previousStatus}" to "${status}"`,
            severity: status === 'resolved' ? 'info' : 'warning',
            req
        });

        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const issueTitle = issue.title;
        const issueCity = issue.city;

        await Issue.findByIdAndDelete(id);

        await logAction({
            userType: 'admin',
            userId: req.auth?.userId || 'system',
            action: 'Delete Issue',
            issueId: id,
            details: `Issue "${issueTitle}" deleted from ${issueCity}`,
            severity: 'warning',
            req
        });

        res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const searchIssues = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const issues = await Issue.search(query);
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const voteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const voters = issue.voters || [];
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required to vote' });
        }

        let voteAction;
        let newVotes = issue.votes || 0;
        let newVoters = [...voters];

        if (voters.includes(userId)) {
            newVotes = Math.max(0, newVotes - 1);
            newVoters = newVoters.filter((voter) => voter !== userId);
            voteAction = 'removed vote from';
        } else {
            newVotes += 1;
            newVoters.push(userId);
            voteAction = 'voted on';
        }

        const updatedIssue = await Issue.update(id, { votes: newVotes, voters: newVoters });

        await logAction({
            userType: 'user',
            userId,
            action: 'Vote on Issue',
            issueId: id,
            details: `User ${voteAction} issue "${issue.title}" (Total votes: ${newVotes})`,
            severity: 'info',
            req
        });

        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createIssue,
    getIssues,
    updateIssueStatus,
    deleteIssue,
    getAllIssues,
    searchIssues,
    getUsersIssues,
    voteIssue
};
