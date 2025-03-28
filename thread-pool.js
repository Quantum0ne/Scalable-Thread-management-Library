const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');

class ThreadPool {
    constructor(maxThreads = os.cpus().length) {
        this.maxThreads = maxThreads;
        this.workers = [];
        this.taskQueue = [];
        this.isPaused = false;
        this.metrics = {
            tasksCompleted: 0,
            tasksFailed: 0,
            avgTaskTime: 0,
            history: []
        };
        this.initializeWorkers();
    }

    initializeWorkers() {
        for (let i = 0; i < this.maxThreads; i++) {
            this.addWorker();
        }
    }

    addWorker() {
        const worker = new Worker(path.join(__dirname, 'worker.js'));
        const workerObj = {
            id: this.workers.length,
            worker,
            status: 'idle',
            currentTask: null,
            startTime: null,
            cpuUsage: 0
        };
        
        worker.on('message', (msg) => this.handleWorkerMessage(workerObj, msg));
        worker.on('error', (err) => this.handleWorkerError(workerObj, err));
        worker.on('exit', (code) => this.handleWorkerExit(workerObj, code));
        
        this.workers.push(workerObj);
        return workerObj;
    }

    // ... (keep all other ThreadPool methods exactly as before)
}

module.exports = ThreadPool;