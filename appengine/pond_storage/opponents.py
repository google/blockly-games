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
DUCKS_NEEDED = 3

def get_entries_in_range(user_duck, entries, start_rank, end_rank):
  """Get all entries in the given range that"""
  user_entry = user_duck.leaderboard_entry_key.get()
  entryQuery = LeaderboardEntry.query()
  entryQuery = entryQuery.filter(LeaderboardEntry.ranking >= start_rank)
  entryQuery = entryQuery.filter(LeaderboardEntry.ranking <= end_rank)
  entryQuery = entryQuery.filter(LeaderboardEntry.ranking != user_entry.ranking)

  for entry in entries:
    entryQuery = entryQuery.filter(LeaderboardEntry.ranking != entry.ranking)
  newEntries = entryQuery.fetch()
  return newEntries

def get_nearby_entries(user_duck, cur_rank, entries, total_entries, num_needed):
  """Get ducks with similar rankings to the users duck"""
  nearby_entries = []
  percent_range = NEARBY_PERCENT

  while(len(nearby_entries) < num_needed and percent_range <= 1):
    min_rank = int(math.floor(cur_rank - total_entries * percent_range))
    max_rank = int(math.ceil(cur_rank + total_entries * percent_range))
    nearby_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)
    percent_range += .20
  return random.sample(nearby_entries, num_needed)

def get_worse_ducks(user_duck, entries, cur_rank, total_entries):
  """ Get a list of all the ducks with a worse ranking than the user duck"""
  min_rank = int(math.floor(cur_rank + total_entries * START_PERCENT))
  max_rank = int(math.ceil(cur_rank + total_entries * END_PERCENT))
  worse_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)

  if len(worse_entries) == 0 and user_duck.ranking != total_entries:
    last_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == total_entries).fetch()[0]
    worse_entries.append(last_entry)
  return  worse_entries

def get_better_ducks(user_duck, entries, cur_rank, total_entries):
  """Get a list of all the ducks with a better ranking than the user duck"""
  # Calculate max and min ranking
  max_rank = int(math.ceil(cur_rank - total_entries * START_PERCENT))
  min_rank = int(math.floor(cur_rank - total_entries * END_PERCENT))
  better_entries = get_entries_in_range(user_duck, entries, min_rank, max_rank)
  
  if len(better_entries) == 0 and user_duck.ranking != 1:
    top_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == 1).fetch()[0]
    better_entries.append(top_entry)
  return better_entries

def get_duck_info_from_entries(entries):
  """Change a list of entries into a list of ducks"""
  ducks = []
  #TODO: This can be updated when we deal with dummy ducks
  for entry in entries:
    duck = entry.duck_key.get()
    if (duck):
      duck_info = get_duck_info(duck)
      ducks.append(duck_info)
    else:
      duck_info = {
        'name': "dummy",
        'duck_key': 'aKey',
        'code': {'js':'throw "dummy duck";'},
        'publish':'true'
      }
      ducks.append(duck_info)
  return ducks

def get_opponents(user_duck):
  """Get optimal opponents for the user duck"""
  user_entry_key = user_duck.leaderboard_entry_key
  cur_rank = user_entry_key.get().ranking
  total_entries = user_entry_key.get().leaderboard_key.get().size
  entries = []

  # Get all ducks with a better ranking in the given range
  better_entries = get_better_ducks(user_duck, entries, cur_rank, total_entries)
  if (len(better_entries) > 0):
    better_entry = random.choice(better_entries)
    entries.append(better_entry)

  # Get all ducks with a worse ranking that are not already in the entries list
  worse_entries = get_worse_ducks(user_duck, entries, cur_rank, total_entries)
  if (len(worse_entries) > 0):
    worse_entry = random.choice(worse_entries)
    entries.append(worse_entry)

  # Get the rest of ducks needed by looking at nearby ducks
  num_needed = DUCKS_NEEDED - len(entries)
  nearby_entries = get_nearby_entries(user_duck, cur_rank, entries, total_entries, num_needed)
  entries = entries + nearby_entries
  return get_duck_info_from_entries(entries)


forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  opponents = get_opponents(duck)
  # TODO: Should send back as many ducks as we have
  if len(opponents) < 3:
    print('Status: 403 Not enough ducks for a match')
  else:
    print('Content-Type: application/json\n')
    print(json.dumps(opponents))
