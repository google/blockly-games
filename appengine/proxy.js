// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const http = require('http');
const httpProxy = require('http-proxy');

/** @const {string} Name of backend server to proxy API requests to. */
const BACKEND_HOSTNAME = 'xhrserver-1.us-central1-a.c.blockly-games.internal'

/** @const {string} Host header to send to backend. */
const HOST = 'blockly.games';

/** @const {!Array<string>} List of allowed path prefixes to forward. */
const ALLOWED_PREFIXES = [
  '/storage',
  '/login',
  '/gallery-api',
  '/admin',
  '/turtle-reddit',
  '/movie-reddit',
];

// Create proxy service.
const proxy = httpProxy.createProxyServer({
  target: 'http://' + BACKEND_HOSTNAME,
  headers: {Host: HOST},
});

proxy.on('error', (e) => {
  console.log('Proxy error: %s', e);
});

/** 
 * Serve an error to the given ServerResult.  Also log information
 * about the failed IncomingMessage to the console.
 * @param {!http.IncomingMessage} request The request which triggered the error.
 * @param {!http.ServerResponse} response The ServerResult to send error to.
 * @param {number} statusCode the HTTP response code to be served.
 * @param {string} message An additional message to include in the result.
 * @return {void}
 */
function sendError(req, res, statusCode, message) {
  console.log('%s %s (Host: %s) from %s:%d (for %s): %d %s',
              req.method, req.url, req.headers.host,
              req.socket.remoteAddress, req.socket.remotePort,
              req.headers['x-forwarded-for'], statusCode, message);
  res.writeHead(statusCode, message);
  res.end();
}

/**
 * Handle an incoming connection to the reverse proxy.  Verify IAP JWT
 * and reject the connection if not valid.
 * @param {!IncomingMessage} req
 * @param {!ServerResponse} res
 * @return {void}
 */
async function handle(req, res) {
  const token = req.headers['x-goog-iap-jwt-assertion'];
  for (const prefix of ALLOWED_PREFIXES) {
    if (req.url.startsWith(prefix)) {
      proxy.web(req, res);
      return;
    }
  }

  // No prefix matched.
  sendError(req, res, 404, "Not Found");
}

/**
 * Async main function.
 *
 * This wrapper can go away once nodejs runtime supports top-level await.
 */
async function main() {
  // Start the server.
  const port = process.env.PORT || 8080;
  http.createServer(handle).listen(port, () => {
    console.log('Server listening on port %d', port);
  });
}

main().catch((error) => {
  console.log(String(error));
  process.exit(1);
});
    
