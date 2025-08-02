# Start from the official Node.js v14 image on Docker Hub.
# This image comes pre-installed with Node.js 14 and npm,
# so you don’t have to install Node yourself.
FROM node:14

# Set /app inside the container as the working directory.
# All subsequent RUN, COPY, and CMD commands will execute
# relative to /app.
WORKDIR /app

# Copy your local server.js file into the container’s
# current working directory (/app).
# This adds your application’s entry-point script.
COPY server.js .

# Copy your local index.html file into /app.
# Makes your HTML available for serving.
COPY index.html .

# Copy the entire local images directory (and its contents)
# into /app/images in the container.
# Useful for static assets like pictures, icons, etc.
COPY images ./images

# Copy your local packages.json file (which lists your
# npm dependencies) into /app.
# Note: If this is meant to be package.json, double-check the filename!
COPY package.json .

# Run npm install inside the container.
# Reads packages.json and downloads all dependencies
# into node_modules. This creates a new image layer with
# your dependencies installed.
RUN npm install

# Tell Docker (and anyone reading the Dockerfile) that
# the container listens on port 300 at runtime.
# This doesn’t actually publish the port—use `docker run -p`
# to map it to the host.
EXPOSE 300

# Define the default command to run when the container starts.
# In this case, launch your Node.js server via server.js.
# Uses the exec form (JSON array) so signals are forwarded correctly.
CMD ["node", "server.js"]
