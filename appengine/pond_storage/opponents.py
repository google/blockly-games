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

def get_entries_in_range(user_entry, opponent_entries, min_rank, max_rank):
  """Returns a filtered list of entries in the given range.

  Args:
    user_entry: The LeaderboardEntry entity requesting opponents.
    opponent_entries: A list of LeaderboardEntry entities to filter out.
    min_rank: The minimum rank value in range.
    max_rank: The maximum rank value in range.

  Returns:
    A list of LeaderboardEntry entities in requested range.
  """
  entries = LeaderboardEntry.query(
      LeaderboardEntry.leaderboard_key == user_entry.leaderboard_key,
      LeaderboardEntry.ranking >= min_rank,
      LeaderboardEntry.ranking <= max_rank,
      LeaderboardEntry.has_duck == True
  ).fetch(_FETCH_LIMIT)
  new_entries = [e for e in entries
                 if e not in opponent_entries and e.key != user_entry.key]
  return new_entries

def get_nearby_entries(
    user_entry, opponent_entries, leaderboard_size, num_needed):
  """Returns a list of entries with rankings similar to the user entry's rank.

  Args:
    user_entry: The LeaderboardEntry entity requesting opponents.
    opponent_entries: A list of LeaderboardEntry entities to filter out.
    leaderboard_size: The leaderboard size.
    num_needed: The number of LeaderboardEntry entities needed.

  Returns:
    A list of LeaderboardEntry entities near the provided user_entry.
  """
  nearby_entries = []
  percent_range = _NEARBY_START_PERCENT
  while len(nearby_entries) < num_needed and percent_range <= 1:
    min_rank = int(
        math.floor(user_entry.ranking - leaderboard_size * percent_range))
    max_rank = int(
        math.ceil(user_entry.ranking + leaderboard_size * percent_range))
    nearby_entries = get_entries_in_range(
        user_entry, opponent_entries, min_rank, max_rank)
    percent_range += _NEARBY_PERCENT_INCREASE
  return random.sample(nearby_entries, num_needed)

def get_worse_entry(user_entry, opponent_entries, leaderboard_size):
  """Returns an entry with ranking worse than the user entry's.

  Args:
    user_entry: The LeaderboardEntry entity requesting opponents.
    opponent_entries: A list of LeaderboardEntry entities to filter out.
    leaderboard_size: The leaderboard size.

  Returns:
    A LeaderboardEntry worse than the user entry or None.
  """
  min_rank = int(
      math.floor(user_entry.ranking + leaderboard_size * _START_PERCENT))
  max_rank = int(
      math.ceil(user_entry.ranking + leaderboard_size * _END_PERCENT))
  worse_entries = get_entries_in_range(
      user_entry, opponent_entries, min_rank, max_rank)

  if worse_entries:
    return random.choice(worse_entries)
  # Try using last entry in leaderboard.
  last_entry = LeaderboardEntry.query(
      LeaderboardEntry.ranking == leaderboard_size).fetch(1)[0]
  if last_entry.key != user_entry.key:
    return last_entry
  # Worse entry not found.
  return  None

def get_better_entry(user_entry, opponent_entries, leaderboard_size):
  """Returns an entry with ranking better than the user entry's.

  Args:
     user_entry: The LeaderboardEntry entity requesting opponents.
    opponent_entries: A list of LeaderboardEntry entities to filter out.
    leaderboard_size: The leaderboard size.

  Returns:
    A LeaderboardEntry better than the user entry or None.
  """
  max_rank = int(
      math.ceil(user_entry.ranking - leaderboard_size * _START_PERCENT))
  min_rank = int(
      math.floor(user_entry.ranking - leaderboard_size * _END_PERCENT))
  better_entries = get_entries_in_range(
      user_entry, opponent_entries, min_rank, max_rank)

  if better_entries:
    random.choice(better_entries)
  # Try using first entry in leaderboard.
  top_entry = LeaderboardEntry.query(LeaderboardEntry.ranking == 1).fetch(1)[0]
  if top_entry.key != user_entry.key:
    return top_entry
  # Better entry not found.
  return None

def entries_to_duck_info(entries):
  """Returns a list of extracted duck info.
  Args:
    entries: A list of LeaderboardEntry entities to extract duck info from.

  Returns:
    A list of dictionaries containing extracted duck information.
    Example duck info dictionary:
    {
      'name': 'bob',
      'duck_key': 'urlsafe duck key',
      'code': {'js': 'some code', 'opt_xml': 'some xml'},
      'published': 'true',
    }
  """
  ducks = []
  for entry in entries:
    if entry.has_duck:
      duck = entry.duck_key.get()
      duck_info = get_duck_info(duck)
      ducks.append(duck_info)
    else:
      logging.error("entries_to_duck_info : Dummy duck was not filtered properly");
  return ducks

def get_opponents(user_entry, target_total):
  """Returns up to n optimal opponents for the provided entry.

  Args:
    user_entry: The LeaderboardEntry entity requesting opponents.
    target_total: Target number of opponents to return.

  Returns:
    A list of dictionaries containing extracted duck information for opponents.
    Example duck info dictionary:
    {
      'name': 'bob',
      'duck_key': 'urlsafe duck key',
      'code': {'js': 'some code', 'opt_xml': 'some xml'},
      'published': 'true',
    }
  """
  leaderboard = user_entry.leaderboard_key.get()
  leaderboard_size = leaderboard.size
  opponent_entries = []  # TODO: This should be a list of entry keys instead of entries

  better_entry = get_better_entry(
      user_entry, opponent_entries, leaderboard_size)
  if better_entry:
    opponent_entries.append(better_entry)

  worse_entry = get_worse_entry(user_entry, opponent_entries, leaderboard_size)
  if worse_entry:
    opponent_entries.append(worse_entry)

  # Fill rest of opponents with nearby entries.
  missing_total = target_total - len(opponent_entries)
  nearby_entries = get_nearby_entries(
      user_entry, opponent_entries, leaderboard_size, missing_total)
  opponent_entries.extend(nearby_entries)

  return entries_to_duck_info(opponent_entries)


forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  user_entry = duck.leaderboard_entry_key.get()
  opponents = get_opponents(user_entry, _OPPONENTS_NEEDED)
  # TODO: Should send back as many ducks as we have
  if len(opponents) < _OPPONENTS_NEEDED:
    print('Status: 403 Not enough ducks for a match')
  else:
    print('Content-Type: application/json\n')
    print(json.dumps(opponents))
