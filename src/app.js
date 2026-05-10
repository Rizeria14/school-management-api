const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const schoolRoutes = require('./routes/schoolRoutes');
const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(helmet({ contentSecurityPolicy: false })); // disabled so the frontend can load Google Fonts
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '..', 'public')));


app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});


app.use('/', schoolRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});



app.use((err, req, res, next) => {
  console.error('[GlobalErrorHandler]', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  });
});


const startServer = async () => {
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ Cannot start server: database connection failed.');
    console.error('   Run "npm run db:setup" to initialise the schema.');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};


if (require.main === module) {
  startServer();
}

module.exports = app;
