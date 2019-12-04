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

"""Returns three Duck "opponents" for the specified Duck."""

import cgi
import json
from google.appengine.ext import ndb
from pond_storage import *

def get_opponent_ducks(duck):
  """Returns list of opponent ducks."""
  # TODO: Add filter for published ducks
  # TODO: Add logic here to pick the duck based on the ranking
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query()
  duck_list = []
  for duck in duck_query:
    if duck.key.parent() != user_key:
      duck_list.append(get_duck_info(duck))
  return duck_list[0:3]

forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  opponents = get_opponent_ducks(duck)
  # TODO: Should send back as many ducks as we have
  if len(opponents) < 3:
    print('Status: 403 Not enough ducks for a match')
  else:
    print('Content-Type: application/json\n')
    print(json.dumps(opponents))
