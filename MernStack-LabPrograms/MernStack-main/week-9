const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
 res.render('index', {
 name: "Manikanta",
 course: "MERN Stack"
 });
});
app.listen(3000, () => {
 console.log("Server running on http://localhost:3000");
});


App9.ejs
<!DOCTYPE html>
<html>
<head>
 <title>Templating Example</title>
</head>
<body>
 <h1>Welcome <%= name %></h1>
 <h2>Course: <%= course %></h2>
</body>
</html> 
