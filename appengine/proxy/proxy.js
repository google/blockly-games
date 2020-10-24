// Copyright 2017 Google LLC
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

const gcpMetadata = require('gcp-metadata');
const http = require('http');
const httpProxy = require('http-proxy');
const {OAuth2Client} = require('google-auth-library');

const oAuth2Client = new OAuth2Client();
const proxy = httpProxy.createProxyServer();

/** @type {string} Expected audience for IAP tokens. */
let expectedAudience;

/**
 * Verify JSON Web Token supplied by Identity Awawre Proxy.  Throws an
 * error (returned Promise rejects) if the token is invalid.  Based on
 * https://github.com/googleapis/google-auth-library-nodejs/blob/master/samples/verifyIdToken-iap.js
 * @params {string} token An IAP JWT.
 */
async function verify(token) {
  // Verify the token, and access the claims.
  const response = await oAuth2Client.getIapPublicKeys();
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
      token, response.pubkeys, expectedAudience,
      ['https://cloud.google.com/iap']);
}

/** 
 * Serve a 403 error to the given ServerResult.  Also log information
 * about the failed request to the console.
 * @param {!IncomingMessage} req
 * @param {!ServerResponse} res The ServerResult to receive a 403.
 * @param {string} message An additional message to include in the result.
 * @return {void}
 */
function deny(req, res, message) {
  console.log('Request %s %s from %s:%d (for %s): %s',
              req.method, req.url, 
              req.socket.remoteAddress, req.socket.remotePort,
              req.headers['x-forwarded-for'], message);
  res.writeHead(403, 'Permission denied: ' + message);
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
  if (!token) {
    deny(req, res, 'no IAP header');
    return;
  }
  try {
    await verify(token);
  } catch (e) {
    deny(req, res, 'invalid IAP header: ' + e);
    return;
  }

  proxy.web(req, res, {
    target: 'http://xhrserver-1.us-central1-a.c.blockly-games.internal'
  });
}

/**
 * Async main function.
 *
 * This wrapper can go away once nodejs runtime supports top-level await.
 */
async function main() {
  // Work out the expectedAudience value for this project.  Need to
  // use metadata server to get numeric project ID because this isn't
  // included in environment variables, unfortunately.
  const projectNumber = await gcpMetadata.project('numeric-project-id');
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  expectedAudience = `/projects/${projectNumber}/apps/${projectId}`;

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
    
