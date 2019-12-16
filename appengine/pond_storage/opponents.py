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

START_PERCENT = .10
END_PERCENT = .15
NEARBY_PERCENT = .10


def get_entries_in_range(user_duck, entries, start_rank, end_rank):
  user_entry = user_duck.leaderboard_entry_key.get()
  entries = LeaderboardEntry.query(
    LeaderboardEntry.ranking >= start_rank,
    LeaderboardEntry.ranking <= end_rank,
    LeaderboardEntry.ranking != user_entry.ranking).fetch()
  return entries

def get_nearby_entries(user_duck, cur_rank, entries, total_entries, num_needed):
  opponent_entries = []
  percent_range = NEARBY_PERCENT
  while(len(opponent_entries) < num_needed and percent_range <= 1):
    min_rank = int(math.floor(cur_rank - total_entries * percent_range))
    max_rank = int(math.ceil(cur_rank + total_entries * percent_range))
    opponent_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)
    for entry in opponent_entries:
      if entry in entries:
        opponent_entries.remove(entry)
    percent_range += .20
  return opponent_entries

def get_worse_ducks(user_duck, entries, cur_rank, total_entries):
  min_rank = int(math.floor(cur_rank - total_entries * START_PERCENT))
  max_rank = int(math.ceil(cur_rank - total_entries * END_PERCENT))
  worse_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)

  for entry in worse_entries:
    if entry in entries:
      worse_entries.remove(entry)
  if len(worse_entries) == 0:
    #TODO: Might want to just call get_better_ducks here
    last_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == total_entries).fetch()[0]
    # TODO: cleanup this so that we don't have to use the duck here
    if (last_entry.duck_key.get() == user_duck):
      worse_entries = get_nearby_entries(user_duck, cur_rank, entries, total_entries, 1)
    else:
      worse_entries.append(last_entry)
  return  worse_entries

def get_better_ducks(user_duck, entries, cur_rank, total_entries):
  # Calculate max and min ranking
  min_rank = int(math.floor(cur_rank + total_entries * START_PERCENT))
  max_rank = int(math.ceil(cur_rank + total_entries * END_PERCENT))

  better_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)
  if (len(better_entries) == 0):
    # Get the top duck
    top_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == 1).fetch()[0]
    # if the current duck is the top duck, get entries in a range
    if (top_entry.duck_key.get() == user_duck):
      # TODO: Check that this will always return something
      better_entries = get_nearby_entries(user_duck, cur_rank, entries, total_entries, 1)
    else:
      better_entries.append(top_entry)
  # entries here should be guaranteed to have at least one thing in the list
  return better_entries

def get_duck_info_from_entries(entries):
  ducks = []
  for entry in entries:
    duck = entry.duck_key.get()
    if (duck):
      duck_info = get_duck_info(duck)
      ducks.append(duck_info)
  return ducks

def print_ranks(opponents):
  logging.info("RANK")
  for opponent in opponents:
    logging.info(opponent)
    logging.info("_")

def get_opponents(user_duck):
  user_entry_key = user_duck.leaderboard_entry_key
  cur_rank = user_entry_key.get().ranking
  total_entries = user_entry_key.get().leaderboard_key.get().size
  entries = []

  better_entries = get_better_ducks(user_duck, entries, cur_rank, total_entries)

  if (len(better_entries) > 0):
    randIdx = random.randint(0, len(better_entries) - 1)
    entries.append(better_entries[randIdx])
    better_entries.remove(better_entries[randIdx])
  else:
    # No other ducks in list other than the given duck
    return None

  worse_entries = get_worse_ducks(user_duck, entries, cur_rank, total_entries)
  if (len(worse_entries) > 0):
    randIdx = random.randint(0, len(worse_entries) - 1)
    entries.append(worse_entries[randIdx])
    worse_entries.remove(worse_entries[randIdx])
  elif len(better_entries) > 0:
    # If there are no below entries, but there are unused above entries use an above entries.
    randIdx = random.randint(0, len(better_entries) - 1)
    entries.append(better_entries[randIdx])
    better_entries.remove(better_entries[randIdx])
  num_needed = 3 - len(entries)
  nearby_entries = get_nearby_entries(user_duck, cur_rank, entries, total_entries, num_needed)
  entries = entries + nearby_entries
  opponents = get_duck_info_from_entries(entries)
  print_ranks(opponents)
  return opponents[0:3]


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
