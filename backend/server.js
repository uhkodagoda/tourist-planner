require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const placesRouter = require('./src/routes/places');
const visitPlansRouter = require('./src/routes/visitPlans');
const authRouter = require('./src/routes/auth');
const uploadRouter = require('./src/routes/upload');
const reviewsRouter = require('./src/routes/reviews');
const photosRouter = require('./src/routes/photos');

const app = express();

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

const fileCount = fs.readdirSync(uploadsPath).filter((f) => f !== '.gitkeep').length;
console.log('Serving uploads from:', uploadsPath);
console.log('Found ' + fileCount + ' existing file(s) in that folder.');

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tourist-planner-backend' });
});

app.get('/api/config', (req, res) => {
  res.json({ mapsEnabled: Boolean(process.env.GOOGLE_MAPS_API_KEY) });
});

app.use('/api/places', placesRouter);
app.use('/api/places', photosRouter);
app.use('/api/visit-plans', visitPlansRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/reviews', reviewsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Tourist Planner API running on http://localhost:' + PORT);
});