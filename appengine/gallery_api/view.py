"""Blockly Games: Gallery

Copyright 2018 Google LLC

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

"""View gallery with App Engine.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi
import json
from gallery_api import *
from google.appengine.api import users
from google.appengine.datastore.datastore_query import Cursor


# Called with two arguments:
# - app: turtle/movie/music/admin
# - cursor: Opaque pointer string.
# Returns a JSON object.

# Number of rows per page.
ROWS_PAGE = 24

forms = cgi.FieldStorage()
app = forms["app"].value
isAdmin = (app == "admin")

if isAdmin and not users.is_current_user_admin():
  print("Status: 401 Unauthorized")
else:
  print("Content-Type: text/plain\n")

  if isAdmin:
    query = Art.query()
  else:
    query = Art.query(Art.public == True, Art.app == app)
  query = query.order(-Art.created)

  if "cursor" in forms:
    # Fetch next page of results.
    curs = Cursor(urlsafe=forms["cursor"].value)
  else:
    # Fetch first page of results.
    curs = None
  (results, next_curs, more) = query.fetch_page(ROWS_PAGE, start_cursor=curs)

  data = [];
  for rec in results:
    datum = {"uuid": rec.uuid,
             "app": rec.app,
             "thumb": rec.thumb,
             "title": rec.title}
    if isAdmin:
      datum["public"] = rec.public
      datum["key"] = rec.key.integer_id()
    data.append(datum)
  meta = {"data": data,
          "more": more,
          "cursor": next_curs and next_curs.urlsafe()}
  print(json.dumps(meta))
