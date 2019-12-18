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

# Starting range for looking for ducks.
_START_PERCENT = .10

# Ending range for looking for ducks.
_END_PERCENT = .15

# Start looking above and below using this percent to find nearby entries.
_NEARBY_START_PERCENT = .10

# The percent interval increase for searching for nearby entries.
_NEARBY_PERCENT_INCREASE = .20

# The number of opponents needed.
_OPPONENTS_NEEDED = 3

# The number of entries to fetch in a given range.
_FETCH_LIMIT = 10

def get_entries_in_range(user_entry, opponent_entries, start_rank, end_rank):
  """Get all entries in the given range.
  Args:
    user_entry: The current user's LeaderboardEntry.
    opponent_entries: A list of LeaderboardEntry values already used.
    start_rank: The number of the rank we want to start getting LeaderboardEntrys at.
    end_rank: The number of the rank we want to stop getting LeaderboardEntrys at.
  Returns:
    A list of LeaderboardEntrys.
  """
  new_entries = LeaderboardEntry.query(
    LeaderboardEntry.leaderboard_key == user_entry.leaderboard_key,
    LeaderboardEntry.ranking >= start_rank,
    LeaderboardEntry.ranking <= end_rank
  ).fetch(_FETCH_LIMIT)
  new_entries = [x for x in new_entries if x not in opponent_entries and x.key != user_entry.key]

  return new_entries

def get_nearby_entries(user_entry, opponent_entries, total_entries, num_needed):
  """Get ducks with similar rankings to the users duck.
  Args:
    user_entry: The current user's LeaderboardEntry
    opponent_entries: A list of LeaderboardEntry values already used
    total_entries: The number of total LeaderboardEntrys in the current users Leaderboard.
    num_needed: The number of LeaderboardEntry values needed.
  Returns:
    A list of nearby LeaderboardEntrys
  """
  nearby_entries = []
  percent_range = _NEARBY_START_PERCENT
  while(len(nearby_entries) < num_needed and percent_range <= 1):
    min_rank = int(math.floor(user_entry.ranking - total_entries * percent_range))
    max_rank = int(math.ceil(user_entry.ranking + total_entries * percent_range))
    nearby_entries = get_entries_in_range(user_entry, opponent_entries, min_rank, max_rank)
    percent_range += _NEARBY_PERCENT_INCREASE
  return random.sample(nearby_entries, num_needed)

def get_worse_entry(user_entry, opponent_entries, total_entries):
  """ Get a list of all the ducks with a worse ranking than the user duck.
  Args:
    user_entry: The current user's LeaderboardEntry
    opponent_entries: All LeaderboardEntry values already used
    total_entries: The number of total LeaderboardEntrys in the current users Leaderboard.
  Returns:
    A list of worst LeaderboardEntrys
  """
  min_rank = int(math.floor(user_entry.ranking + total_entries * _START_PERCENT))
  max_rank = int(math.ceil(user_entry.ranking + total_entries * _END_PERCENT))
  worse_entries = get_entries_in_range(user_entry, opponent_entries, min_rank, max_rank)
  worse_entry = None
  if len(worse_entries) == 0:
    last_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == total_entries).fetch()[0]
    if last_entry.key != user_entry.key:
      worse_entry = last_entry
  elif (len(worse_entries) > 0):
    worse_entry = random.choice(worse_entries)
  return  worse_entry

def get_better_entry(user_entry, opponent_entries, total_entries):
  """Get a list of all the ducks with a better ranking than the user duck.
  Args:
    user_entry: The current user's LeaderboardEntry.
    opponent_entries: A list of LeaderboardEntrys that are already used.
    total_entries: The number of total LeaderboardEntrys in the current users Leaderboard.
  Returns:
    A list of better LeaderboardEntrys.
  """
  # Calculate max and min ranking
  max_rank = int(math.ceil(user_entry.ranking - total_entries * _START_PERCENT))
  min_rank = int(math.floor(user_entry.ranking - total_entries * _END_PERCENT))
  better_entries = get_entries_in_range(user_entry, opponent_entries, min_rank, max_rank)
  better_entry = None
  if len(better_entries) == 0:
    top_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == 1).fetch()[0]
    if (top_entry.key != user_entry.key):
      better_entry = top_entry
  elif (len(better_entries) > 0):
    better_entry = random.choice(better_entries)
  return better_entry

def entries_to_duck_info(entries):
  """Change a list of entries into a list of ducks
  Args:
    entries: A list of LeaderboardEntrys that are already used.
  Returns:
    A dictionary with duck info. For example:
    {
      'name': 'bob',
      'duck_key': 'urlsafe duck key',
      'code': {'js': 'some code', 'opt_xml': 'some xml'},
      'published': 'true',
    }
  """
  ducks = []
  for entry in entries:
    if entry.is_dummy:
      # TODO: handle/filter dummy entries earlier.
      duck_info = {
          'name': "dummy",
          'duck_key': 'aKey',
          'code': {'js':'throw "dummy duck";'},
          'publish':'true'
      }
    else:
      duck = entry.duck_key.get()
      duck_info = get_duck_info(duck)
    ducks.append(duck_info)
  return ducks

def get_opponents(user_entry):
  """Get optimal opponents for the user duck.
  Args:
    user_entry: The current user's LeaderboardEntry
  Returns:
    A list of duck info. For example: 
    [
      {
        'name': 'bob',
        'duck_key': 'urlsafe duck key',
        'code': {'js': 'some code', 'opt_xml': 'some xml'},
        'published': 'true',
      }
    ]
  """
  leaderboard = user_entry.leaderboard_key.get()
  total_entries = leaderboard.size
  opponent_entries = []  # TODO: This should be a list of entry keys instead of entries

  # Get all ducks with a better ranking in the given range
  better_entry = get_better_entry(user_entry, opponent_entries, total_entries)
  if better_entry != None:
    opponent_entries.append(better_entry)

  # Get all ducks with a worse ranking that are not already in the entries list
  worse_entry = get_worse_entry(user_entry, opponent_entries, total_entries)
  if worse_entry != None:
    opponent_entries.append(worse_entry)

  # Get the rest of ducks needed by looking at nearby ducks
  num_needed = _OPPONENTS_NEEDED - len(opponent_entries)
  nearby_entries = get_nearby_entries(user_entry, opponent_entries, total_entries, num_needed)
  opponent_entries.extend(nearby_entries)
  return entries_to_duck_info(opponent_entries)


forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  user_entry = duck.leaderboard_entry_key.get()
  opponents = get_opponents(user_entry)
  # TODO: Should send back as many ducks as we have
  if len(opponents) < _OPPONENTS_NEEDED:
    print('Status: 403 Not enough ducks for a match')
  else:
    print('Content-Type: application/json\n')
    print(json.dumps(opponents))
