"""Blockly Games: Pond Online

Copyright 2019 Google LLC

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

"""Create and upload a new duck 
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import cgi
import json
from google.appengine.api import users
from pond_storage import *

forms = cgi.FieldStorage()
user = users.get_current_user()
userid = user.user_id()
# Verify user does not have too many Ducks
max_ducks = 10
owned_ducks_query = Duck.query(Duck.userid == userid)
owned_ducks_count = owned_ducks_query.count(limit=max_ducks)
if owned_ducks_count == 10:
  # There are too many ducks!!
  print("Status: 403 Owner has too many ducks")
else:
  print("Content-Type: application/json\n")
  # Create a new Duck entry
  js = forms["js"].value
  name = forms["name"].value
  code = Code(js=js)
  if forms.has_key("xml"):
    code.opt_xml = forms["xml"].value
  duck = Duck(userid=userid, name=name, code=code)
  duck_key = duck.put()
  meta = {"duck_key": duck_key.urlsafe()}
  print(json.dumps(meta))
