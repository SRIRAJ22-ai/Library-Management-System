const http = require('http');

// Create Web Server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h2>Node.js Web Server</h2>');
    res.write('<p>JavaScript code executed on the server</p>');
    res.end();
});

// Server listens on port 3000
server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
