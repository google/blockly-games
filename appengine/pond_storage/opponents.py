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
import math
import random
from google.appengine.ext import ndb
from pond_storage import *

def get_ducks_in_range(user_key, duck_ranking, duck_list, percent_range):
  """Get ducks with ranks between percent above and below current duck rank"""
  max_ranking = math.ceil(duck_ranking + len(duck_list) * percent_range)
  min_ranking = math.floor(duck_ranking - len(duck_list) * percent_range)
  opponent_ducks = []
  for duck in duck_list:
    if duck.leaderboard_entry_key and duck.key.parent() != user_key:
      rank = duck.leaderboard_entry_key.get().ranking
      if rank <= max_ranking and rank >= min_ranking:
        opponent_ducks.append(get_duck_info(duck))
  return opponent_ducks

def get_opponent_ducks(user_duck):
  """Returns list of opponent ducks."""
  user_key = get_user_key(users.get_current_user())
  duck_ranking = user_duck.leaderboard_entry_key.get().ranking
  duck_list = Duck.query(Duck.published == True).fetch()
  opponent_ducks = []
  percent_range = .10

  # Increase range until the length of the opponent ducks is greater than 3
  while (len(opponent_ducks) < 3) or percent_range > 1:
    opponent_ducks = get_ducks_in_range(user_key, duck_ranking, duck_list, percent_range)
    opponent_len = len(opponent_ducks)
    if (opponent_len > 1):
      percent_range = percent_range + .10
    elif (opponent_len >= 0):
      percent_range = percent_range + .20
  random.shuffle(opponent_ducks)
  return opponent_ducks[0:3]


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
