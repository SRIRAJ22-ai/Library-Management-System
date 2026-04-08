const express = require('express');
const app = express();
const PORT = 3000;
app.set('view engine', 'ejs');
// Route to render template
app.get('/', (req, res) => {
 const user = {
 name: "Manikanta",
 course: "ExpressJS"
 };
 res.render('home', { user });
});
app.listen(PORT, () => {
 console.log(`Server running on port ${PORT}`);
});


//home.ejs

<!DOCTYPE html>
<html>
<head>
 <title>Home Page</title>
 <style>
 body {
 background-color: lightblue; /* change color here */
 }
 </style>
</head>
<body>
 <h1>Welcome to Express EJS Templating</h1>
</body>
</html> 
