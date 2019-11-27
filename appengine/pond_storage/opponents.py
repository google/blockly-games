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

"""Given a duck key find three opponents based on the ducks ranking.
"""

__author__ = "aschmiedt@google.com (Abby Schmiedt)"

import cgi
import json
from google.appengine.ext import ndb
from pond_storage import *

forms = cgi.FieldStorage()
if forms.has_key("key"):
  urlsafe_key = forms["key"].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  # Add logic here to pick the duck based on the ranking
  opponents = get_opponent_ducks(duck)
  if len(opponents) < 3:
    print("Status: 403 Not enough ducks for a match")
  else:
    opponents = opponents[0:3]
    print("Content-Type: application/json\n")
    print(json.dumps(opponents))
