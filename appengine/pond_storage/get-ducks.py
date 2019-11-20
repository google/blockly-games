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

"""Update the specified Duck 
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import cgi
import json
from google.appengine.ext import ndb
from google.appengine.api import users
from pond_storage import *

forms = cgi.FieldStorage()
user = users.get_current_user()
userid = user.user_id()
duckQuery = Duck.query().filter(Duck.userid==userid)
duckList = []
for duck in duckQuery:
  jsonDuck = {}
  jsonDuck['name'] = duck.name
  jsonDuck['duckId'] = duck.key.urlsafe()
  duckList.append(jsonDuck)
print("Content-Type: application/json\n")
print(json.dumps(duckList))
