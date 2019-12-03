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

"""Return a ranking match request.
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import datetime
import json
from google.appengine.ext import ndb
from pond_storage import *

"""Store match request information."""
class MatchRequest(ndb.Model):
  # Ducks.
  ducks = ndb.KeyProperty(repeated=True)
  # Creation time.
  creation_time = ndb.DateTimeProperty(auto_now_add=True)
  # Expiry time.
  expiry_time = ndb.ComputedProperty(lambda self: self.creation_time + datetime.timedelta(hours=1))

  @classmethod
  def contains_duck(cls, duck_key):
    return cls.query(cls.ducks == duck_key).count(limit=1)

# Cleanup expired match requests.
now = datetime.datetime.now()
expired_requests = MatchRequest.query(MatchRequest.expiry_time < now)
for request in expired_requests:
  request.key.delete()

# Create a new match request.
# 1. Choose duck with highest instability not already in a match request.
target_duck = None
entries_query = LeaderboardEntry.query().order(-LeaderboardEntry.instability)
for entry in entries_query:
  # Check if it exists in a current match request
  if not MatchRequest.contains_duck(entry.duck_key):
    target_duck = entry.duck_key.get()
    if target_duck:
      break
if not target_duck:
  print("Status: 204 No match requests available")
else:
  # 2. Choose up to 3 opponents based on chosen duck.
  # TODO choose opponents based on chosen duck's instability.
  duck_keys = [target_duck.key]
  duck_list = [{
      'duck_key': target_duck.key.urlsafe(),
      'js': target_duck.code.js
  }]
  opponents_query = Duck.query(Duck.published == True)
  for opponent in opponents_query:
    if not MatchRequest.contains_duck(opponent.key):
      duck_keys.append(opponent.key)
      duck_list.append({
          'duck_key': opponent.key.urlsafe(),
          'js': opponent.code.js
      })
      if len(duck_list) == 4:
        break
  # 3. Verify that at least one valid opponent was found.
  if len(duck_list) >= 2:
    print("Status: 204 No match requests available")
  else:
    # 4. Store match request in datastore.
    request = MatchRequest(ducks=duck_keys)
    request.put()
    # 5. Send match request to client.
    print("Content-Type: application/json\n")
    print(json.dumps(duck_list))
