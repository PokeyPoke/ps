const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { createLogger } = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const logger = createLogger();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

io.on('connection', (socket) => {
    logger.info('New client connected');

    socket.on('disconnect', () => {
        logger.info('Client disconnected');
    });
});

const PORT = config.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});