const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
const ThreadPool = require(path.join(__dirname, 'thread-pool.js'));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const threadPool = new ThreadPool();

// REST API Endpoints
app.get('/api/threads', (req, res) => {
    res.json({
        threads: threadPool.getThreadStates(),
        metrics: threadPool.getMetrics()
    });
});

app.post('/api/threads/add', (req, res) => {
    threadPool.addWorker();
    res.json({ success: true });
});

app.post('/api/threads/remove', (req, res) => {
    const success = threadPool.removeThread();
    res.json({ success });
});

app.post('/api/pool/pause', (req, res) => {
    threadPool.pause();
    res.json({ success: true });
});

app.post('/api/pool/resume', (req, res) => {
    threadPool.resume();
    res.json({ success: true });
});

app.post('/api/tasks', (req, res) => {
    const { code, priority } = req.body;
    try {
        const taskId = threadPool.addTask(code, priority);
        res.json({ success: true, taskId });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    const sendUpdate = () => {
        ws.send(JSON.stringify({
            threads: threadPool.getThreadStates(),
            metrics: threadPool.getMetrics()
        }));
    };

    // Send initial state
    sendUpdate();
    
    // Set up periodic updates
    const interval = setInterval(sendUpdate, 1000);
    
    ws.on('close', () => clearInterval(interval));
});