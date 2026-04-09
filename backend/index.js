const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { connectDatabase } = require('./config/database');
const { hasAppwriteConfig } = require('./lib/appwrite');
const { getRuntimeStatus } = require('./config/runtime');

const app = express();
const port = process.env.PORT || 3000;
const frontendDistPath = path.join(__dirname, '../frontend/dist');

if (!hasAppwriteConfig) {
  console.log('Appwrite auth not configured. Running in demo auth mode.');
} else {
  console.log('Appwrite authentication configured');
}

const runtimeStatus = getRuntimeStatus();
runtimeStatus.warnings.forEach((warning) => {
  console.warn(`Warning: ${warning}`);
});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.use('/api', require('./routes/issue'));
app.use('/api', require('./routes/logs'));
app.use('/api', require('./routes/upload'));
app.use('/api', require('./routes/officer'));
app.get('/api/status', (req, res) => {
  res.json(getRuntimeStatus());
});

if (fs.existsSync(frontendDistPath)) {
  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Welcome to OCTAVE');
  });
}

connectDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
});
