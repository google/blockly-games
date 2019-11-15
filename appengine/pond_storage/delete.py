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

"""Delete the specified Duck 
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import cgi
import json
from google.appengine.api import users
from google.appengine.ext import ndb
from pond_storage import *

forms = cgi.FieldStorage()
urlsafe_key = forms["key"].value
duck_key = ndb.Key(urlsafe=urlsafe_key)
duck = duck_key.get()
# Verify Duck exists in database
if not duck:
  # Duck with specified key does not exist.
  print("Status: 400 Unknown Duck key")
else:
  # Verify user is allowed to update this Duck, i.e. is owner
  user = users.get_current_user()
  userid = user.user_id()
  if userid != duck.userid:
    # User cannot delete this duck (user is not owner).
    print("Status: 401 Unauthorized")
  else:
    print("Content-Type: application/json\n")
    duck.key.delete()
    meta = {"duck_key": duck_key.urlsafe()}
    print(json.dumps(meta))
