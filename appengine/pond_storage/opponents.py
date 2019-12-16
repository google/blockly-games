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


def get_entries_in_range(user_duck, start_rank, end_rank):
  user_entry_key = user_duck.leaderboard_entry_key
  entries = LeaderboardEntry.query(
    LeaderboardEntry.ranking >= start_rank,
    LeaderboardEntry.ranking <= end_rank).fetch()
  entries = filter(lambda x: x.key != user_entry_key, entries)
  return entries

def get_nearby_entries(user_duck, cur_rank, entries, num_entries, num_needed):
  opponent_entries = []
  percent_range = .10
  while(len(opponent_entries) < num_needed and percent_range <= 1):
    min_rank = int(math.floor(cur_rank - num_entries * percent_range))
    max_rank = int(math.ceil(cur_rank + num_entries * percent_range))
    opponent_entries = get_entries_in_range(user_duck, min_rank, max_rank)
    for entry in opponent_entries:
      if entry in entries:
        opponent_entries.remove(entry)
    percent_range += .20
  return opponent_entries

def get_ducks_below(user_duck, entries, cur_rank, num_entries, start, end):
  min_rank = int(math.floor(cur_rank - num_entries * start))
  max_rank = int(math.ceil(cur_rank - num_entries * end))
  below_entries = get_entries_in_range(user_duck, min_rank, max_rank)

  for entry in below_entries:
    if entry in entries:
      below_entries.remove(entry)
  if len(below_entries) == 0:
    #TODO: Might want to just call get_ducks_above here
    first_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == 1).fetch()[0]
    # TODO: cleanup this so that we don't have to use the duck here
    if (first_entry.duck_key.get() == user_duck):
      below_entries = get_nearby_entries(user_duck, cur_rank, entries, num_entries, 1)
    else:
      below_entries.append(first_entry)
  return  below_entries

def get_ducks_above(user_duck, entries, cur_rank, num_entries, start, end):
  # Calculate max and min ranking
  min_rank = int(math.floor(cur_rank + num_entries * start))
  max_rank = int(math.ceil(cur_rank + num_entries * end))
  above_entries = get_entries_in_range(user_duck, min_rank, max_rank)
  if (len(above_entries) == 0):
    # Get the top duck
    first_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == num_entries).fetch()[0]
    # if the current duck is the top duck, get entries in a range
    if (first_entry.duck_key.get() == user_duck):
      # TODO: Check that this will always return something
      above_entries = get_nearby_entries(user_duck, cur_rank, entries, num_entries, 1)
    else:
      above_entries.append(first_entry)
  # entries here should be guaranteed to have at least one thing in the list
  return above_entries

def get_duck_info_from_entries(entries):
  ducks = []
  for entry in entries:
    duck = entry.duck_key.get()
    if (duck):
      duck_info = get_duck_info(duck)
      ducks.append(duck_info)
  return ducks

def get_opponents(user_duck):
  user_entry_key = user_duck.leaderboard_entry_key
  cur_rank = user_entry_key.get().ranking
  num_entries = user_entry_key.get().leaderboard_key.get().size
  entries = []

  above_entries = get_ducks_above(user_duck, entries, cur_rank, num_entries, .10, .15)

  if (len(above_entries) > 0):
    #TODO: instead of using 0 use a random index
    entries.append(above_entries[0])
    above_entries.remove(above_entries[0])
  else:
    # No other ducks in list other than the given duck
    return None

  below_entries = get_ducks_below(user_duck, entries, cur_rank, num_entries, .10, .15)
  if (len(below_entries) > 0):
    randIdx = random.randint(0, len(below_entries) - 1)
    entries.append(below_entries[randIdx])
    below_entries.remove(below_entries[randIdx])
  elif len(above_entries) > 0:
    randIdx = random.randint(0, len(above_entries) - 1)
    entries.append(above_entries[randIdx])
    above_entries.remove(above_entries[randIdx])
  
  num_needed = 3 - len(entries)
  nearby_entries = get_nearby_entries(user_duck, cur_rank, entries, num_entries, num_needed)
  entries = entries + nearby_entries
  opponents = get_duck_info_from_entries(entries)
  logging.info(opponents)
  logging.info(len(opponents))
  return opponents


forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  # opponents = get_opponent_ducks(duck)
  opponents = get_opponents(duck)
  # TODO: Should send back as many ducks as we have
  if len(opponents) < 3:
    print('Status: 403 Not enough ducks for a match')
  else:
    print('Content-Type: application/json\n')
    print(json.dumps(opponents))
