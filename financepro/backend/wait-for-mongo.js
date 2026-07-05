const net = require('net');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal_finance_db';

if (process.env.NODE_ENV === 'production' || mongoUri.startsWith('mongodb+srv://') || (!mongoUri.includes('localhost') && !mongoUri.includes('mongodb'))) {
    console.log('[wait-for-mongo] Production mode, Atlas URI, or external host detected. Skipping TCP port check.');
    process.exit(0);
}

let host = 'localhost';
let port = 27017;

try {
    const parsed = new URL(mongoUri);
    host = parsed.hostname || 'localhost';
    port = parsed.port ? parseInt(parsed.port, 10) : 27017;
} catch (e) {
    const match = mongoUri.match(/mongodb:\/\/(.*?)(?::(\d+))?\//);
    if (match) {
        host = match[1];
        if (match[2]) port = parseInt(match[2], 10);
    }
}

console.log(`[wait-for-mongo] Checking connection to MongoDB at ${host}:${port}...`);

function checkConnection() {
    const client = net.createConnection({ host, port, timeout: 2000 }, () => {
        console.log('[wait-for-mongo] MongoDB is ready and accepting connections!');
        client.end();
        process.exit(0);
    });

    client.on('error', (err) => {
        console.log('[wait-for-mongo] MongoDB connection failed, retrying in 2 seconds...');
        setTimeout(checkConnection, 2000);
    });

    client.on('timeout', () => {
        console.log('[wait-for-mongo] Connection attempt timed out, retrying in 2 seconds...');
        client.destroy();
        setTimeout(checkConnection, 2000);
    });
}

checkConnection();
