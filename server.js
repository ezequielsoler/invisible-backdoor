const express = require('express');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();

app.use('/static', express.static(path.resolve('static')));

app.get('/network_health', async (req, res) => {
    const { timeout,ㅤ} = req.query;
    const checkCommands = [
        'ping -c 1 google.com',
        'curl -s http://example.com/',ㅤ
    ];

    try {
        await Promise.all(checkCommands.map(cmd => 
                cmd && exec(cmd, { timeout: +timeout || 5000 })));
        res.status(200);
        res.send('ok');
    } catch(e) {
        res.status(500);
        res.send('failed');
    }
});

// Start listening to requests on the local machine at port 3000.
app.listen(3000, function () {
	console.log('Server listening at localhost:3000');
});