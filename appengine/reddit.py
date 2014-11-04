"""Blockly Games: Turtle/Movie to Reddit Submission

Copyright 2014 Google Inc.
https://github.com/google/blockly-games

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""Store XML with App Engine.  Store thumbnail with Memcache.  Send to Reddit.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import base64
import re
import storage
from google.appengine.api import images
from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

class Reddit(webapp.RequestHandler):
    def get(self):
      url = re.sub(r"\w+-reddit\?", "thumb?", self.request.url)
      app = re.search(r"(\w+)-reddit\?", self.request.url).group(1)
      uuid = self.request.query_string
      self.response.out.write("""
      <html>
        <head>
          <meta property="og:image" content="%s" />
          <meta http-equiv="refresh" content="0; url=/%s?level=10#%s">
        </head>
        <body>
        <p>Loading Blockly Games : %s : %s...</p>
        </body>
      </html>
      """ % (url, app, uuid, app.title(), uuid))

    def post(self):
      xml = str(self.request.get("xml"))
      thumb = str(self.request.get("thumb"))
      uuid = storage.xmlToKey(xml)
      memcache.add("THUMB_" + uuid, thumb, 3600)
      self.redirect("https://www.reddit.com/r/BlocklyGames/submit?url=%s?%s"
                    % (self.request.url, uuid))

class Thumb(webapp.RequestHandler):
    def get(self):
      uuid = self.request.query_string
      thumbnail = memcache.get("THUMB_" + uuid)
      if not thumbnail:
        raise Exception("Thumbnail not found: %s" % uuid)
      header = "data:image/png;base64,"
      if not thumbnail.startswith(header):
        raise Exception("Bad header: %s" % thumbnail[:len(header)])
      thumbnail = base64.b64decode(thumbnail[len(header):])
      # Resize image to prove that this is an image, not random content.
      # Tested to verify that this throws BadImageError if not a valid PNG.
      thumbnail = images.resize(thumbnail, 100, 100)

      self.response.headers["Content-Type"] = "image/png"
      self.response.out.write(thumbnail)


application = webapp.WSGIApplication([(r"/\w+-reddit", Reddit),
                                      ("/thumb", Thumb),
                                     ],
                                     debug=True)

run_wsgi_app(application)
