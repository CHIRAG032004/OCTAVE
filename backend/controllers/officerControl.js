const Officer = require('../models/Officer');

const normalizeOfficerRecord = (officer) => ({
    ...officer,
    createdAt: officer.createdAt?.toDate ? officer.createdAt.toDate() : officer.createdAt,
    updatedAt: officer.updatedAt?.toDate ? officer.updatedAt.toDate() : officer.updatedAt,
});

const createOfficer = async (req, res) => {
    try {
        const { fullName, email, role, assignedCategories, assignedLocations, phone } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        const existingOfficer = (await Officer.find()).find((officer) => {
            return String(officer.email || '').trim().toLowerCase() === normalizedEmail;
        });

        if (existingOfficer) {
            return res.status(400).json({ message: 'Officer with this email already exists' });
        }

        const newOfficer = await Officer.create({
            fullName,
            email,
            role: role || 'officer',
            assignedCategories: assignedCategories || [],
            assignedLocations: assignedLocations || [],
            phone
        });

        res.status(201).json({ message: 'Officer created successfully', officer: newOfficer });
    } catch (error) {
        res.status(500).json({ message: 'Error creating officer', error: error.message });
    }
};

const getOfficers = async (req, res) => {
    try {
        const { email, location, startDate, endDate, date } = req.query;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        let exactDayStart = null;
        let exactDayEnd = null;

        if (date) {
            const exactDate = new Date(date);
            if (!Number.isNaN(exactDate.valueOf())) {
                exactDayStart = new Date(exactDate);
                exactDayStart.setHours(0, 0, 0, 0);
                exactDayEnd = new Date(exactDate);
                exactDayEnd.setHours(23, 59, 59, 999);
            }
        }

        const officers = (await Officer.find())
            .map(normalizeOfficerRecord)
            .filter((officer) => {
                if (email && !String(officer.email || '').toLowerCase().includes(String(email).toLowerCase())) {
                    return false;
                }

                if (location) {
                    const locations = Array.isArray(officer.assignedLocations) ? officer.assignedLocations : [];
                    const hasMatch = locations.some((entry) =>
                        String(entry || '').toLowerCase().includes(String(location).toLowerCase())
                    );

                    if (!hasMatch) {
                        return false;
                    }
                }

                const createdAt = officer.createdAt ? new Date(officer.createdAt) : null;
                if (start && (!createdAt || createdAt < start)) return false;
                if (end && (!createdAt || createdAt > end)) return false;
                if (exactDayStart && (!createdAt || createdAt < exactDayStart || createdAt > exactDayEnd)) return false;

                return true;
            });

        res.status(200).json({ message: 'Officers retrieved successfully', officers });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving officers', error: error.message });
    }
};

const updateOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedOfficer = await Officer.findByIdAndUpdate(id, updates);
        if (!updatedOfficer) {
            return res.status(404).json({ message: 'Officer not found' });
        }
        res.status(200).json({ message: 'Officer updated successfully', officer: updatedOfficer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating officer', error: error.message });
    }
};

const deleteOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedOfficer = await Officer.findByIdAndDelete(id);
        if (!deletedOfficer) {
            return res.status(404).json({ message: 'Officer not found' });
        }
        res.status(200).json({ message: 'Officer deleted successfully', officer: deletedOfficer });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting officer', error: error.message });
    }
};

module.exports = {
    createOfficer,
    getOfficers,
    updateOfficer,
    deleteOfficer
};
