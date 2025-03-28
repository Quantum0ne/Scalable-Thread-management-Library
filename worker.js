const { parentPort } = require('worker_threads');

parentPort.on('message', async (task) => {
    try {
        const taskFunc = new Function('return ' + task.func)();
        await taskFunc();
        parentPort.postMessage({ 
            type: 'task_complete', 
            taskId: task.id 
        });
    } catch (err) {
        parentPort.postMessage({ 
            type: 'task_error', 
            taskId: task.id,
            error: err.message 
        });
    }
});