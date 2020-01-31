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

"""Returns the specified Duck, or all Ducks, owned by the current user."""

import cgi
import json
import logging
from google.appengine.ext import ndb
from google.appengine.api import users
from pond_storage import *


def get_top_entries(user_entry, count):
  """Gets the entries with the best rankings.
  Args:
    user_entry: The LeaderboardEntry entity requesting top ducks.
    count: The number of top ducks to get.
  Returns:
    A list of LeaderboardEntry entities that are at the top of their leadboard.
  """
  entry_query = LeaderboardEntry.query(
    LeaderboardEntry.leaderboard_key == user_entry.leaderboard_key,
    LeaderboardEntry.ranking >= 1,
    LeaderboardEntry.ranking <= count
  )
  entry_query.order = ['ranking']
  return entry_query.fetch()

def get_top_ducks(count, duck):
  """Gets a list of the ducks with the best rankings.
  Args:
    forms: The field storage object.
    duck: The Duck entity the user is currently using.
  Returns:
    A list of dictionaries containing extracted duck information for the top
    ducks.
    Example:
    {
      'name': 'bob',
      'duck_key': 'urlsafe duck key',
      'published': 'true',
      'ranking':'1',
      'isOwner':True
    }
  """
  if duck.leaderboard_entry_key:
    user_entry = duck.leaderboard_entry_key.get()
    top_entries = get_top_entries(user_entry, count)
    return entries_to_duck_info(top_entries, ['name', 'duck_key', 'published', 'isOwner'])
  else:
    logging.error("Can not get leaderboard for unpublished duck.")
    return []


forms = cgi.FieldStorage()
if forms.has_key('key'):
  urlsafe_key = forms['key'].value
  duck_key = ndb.Key(urlsafe=urlsafe_key)
  duck = duck_key.get()
  if verify_duck(duck):
    if forms.has_key('type') and forms['type'].value == 'topducks':
      if forms.has_key('count'):
        count = forms['count']
      else:
        count = 10
      top_entries = get_top_ducks(count, duck)
      print('Content-Type: application/json\n')
      print(json.dumps({'topDucks': top_entries}))
    else:
      duck_info = get_duck_info(duck)
      print('Content-Type: application/json\n')
      print(json.dumps(duck_info))
else:
  duckList = get_user_ducks()
  print('Content-Type: application/json\n')
  print(json.dumps({'duckList': duckList}))
