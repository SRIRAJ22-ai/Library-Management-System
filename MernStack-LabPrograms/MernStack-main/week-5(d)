const fs = require('fs');
const path = require('path');

// Create file in the same folder as this JS file
const filePath = path.join(__dirname, 'src.txt');

// Correct string (single line)
const content = "HTML, CSS, JavaScript, TypeScript, MongoDB, Express.js, React.js, Node.js";

fs.writeFile(filePath, content, (err) => {
    if (err) {
        console.error("Error:", err);
    } else {
        console.log("src.txt file created successfully");
    }
});
