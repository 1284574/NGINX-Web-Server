// Import the Express framework to build the HTTP server
const express = require('express');

// Import Node’s built-in path module for handling and transforming file paths
const path = require('path');

// Create a new Express application instance
const app = express();

// Define the port number on which the server will listen for incoming connections
const port = 3000;

// access environment variables
const replicaApp = process.env.APP_NAME

/**
 * Middleware to serve static files (images) from the local "images" directory.
 * 
 * - When the client requests any URL beginning with "/images",
 *   Express will look for a matching file under "<project_root>/images".
 * - e.g. a GET to "/images/logo.png" will serve "<project_root>/images/logo.png".
 */
app.use(
  '/images',                                 // Virtual path prefix in the URL
  express.static(path.join(__dirname, 'images'))  // Real filesystem path to serve
);

/**
 * Catch-all middleware for the root URL ("/").
 *
 * - For any HTTP method (GET, POST, etc.) targeting URLs that start with "/",
 *   this handler will run—because we used `app.use` without restricting to GET.
 * - It sends back the "index.html" file as the response body.
 * - After sending the file, it logs a message to the console for debugging/monitoring.
 */
app.use('/', (req, res) => {
  // Construct the absolute path to "index.html" in the project root
  const indexPath = path.join(__dirname, 'index.html');
  
  // Send the HTML file as the response (automatically sets Content-Type to text/html)
  res.sendFile(indexPath);

  // Log to the server console so you can see when requests are being served
  console.log(`Request for ${replicaApp} served by node app`);
});

/**
 * Start the HTTP server:
 *
 * - Binds the Express app to the specified port on all network interfaces.
 * - Once the server is listening, the callback runs exactly once to notify us.
 */
app.listen(port, () => {
  console.log(`${replicaApp} is listening on port ${port}`);
});
