const express = require('express');
const cors = require('cors');
const config = require('./config/index.js');
const container = require('./di-container');

const app = express();

// 1. Basic middleware
app.use(cors());
app.use(express.json());

// 2. Inject global middleware from your DI container
app.use(container.globalMiddleware);
app.use(container.responseTimeMiddleware);

// 3. Mount your route registry (which handles /health and /apis)
app.use(container.registry);

// 4. Catch-all for 404 Route Not Found
app.use(container.routeNotFoundMiddleware);

app.listen(config.port, () => {
  console.log(`Server successfully started on port ${config.port}`);
});