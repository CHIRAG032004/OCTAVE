const { requireAuth } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { createOfficer, getOfficers, updateOfficer, deleteOfficer } = require('../controllers/officerControl');

router.post('/officers', requireAuth({ admin: true }), createOfficer);
router.get('/officers', requireAuth({ admin: true }), getOfficers);
router.put('/officers/:id', requireAuth({ admin: true }), updateOfficer);
router.delete('/officers/:id', requireAuth({ admin: true }), deleteOfficer);

module.exports = router;
