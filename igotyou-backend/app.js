const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

const exceptionHandler = require('./middleware/exceptionHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

require('dotenv').config();
const connectDB = require('./config/db');
const appRoutes = require('./routes/appRoutes');
const swaggerDocument = require('./api-spec/openapi.json'); 
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.json());

// Serve Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', appRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Handle other errors
app.use(exceptionHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));