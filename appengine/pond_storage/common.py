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

"""Pond online's datastore models.
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import logging
from google.appengine.ext import ndb
from google.appengine.api import users

"""Struct for user code."""
class Code(ndb.Model):
  js = ndb.TextProperty(required=True)
  opt_xml = ndb.TextProperty()

"""Stores user duck code."""
class Duck(ndb.Model):
  name = ndb.StringProperty(indexed=False, required=True)
  code = ndb.LocalStructuredProperty(Code, indexed=False, required=True)
  leaderboard_entry_key = ndb.KeyProperty(indexed=False, kind='LeaderboardEntry')
  published = ndb.ComputedProperty(lambda self: self.leaderboard_entry_key is not None)

  @classmethod
  def _pre_delete_hook(cls, key):
    duck = key.get()
    if duck.published:
      entry = duck.leaderboard_entry_key.get()
      entry.clear_duck()

  def publish(self, leaderboard=None):
    if not self.published:
      leaderboard = leaderboard or get_main_leaderboard()
      leaderboard.create_entry(self)
      return True
    return False

  def unpublish(self):
    if self.published:
      entry = self.leaderboard_entry_key.get()
      entry.clear_duck()
      del self.leaderboard_entry_key
      self.put()
      return True
    return False

"""Creates a dummy duck (always throws)."""
def get_dummy_duck_key():
  dummy_duck_id = 'dummy'
  dummy_duck_key = ndb.Key(Duck, dummy_duck_id)
  # Create entity if it does not exist.
  if not dummy_duck_key.get():
    dummy_code = Code(js="throw 'dummy duck';")
    dummy_duck = Duck(id=dummy_duck_id, name="", code=dummy_code)
    dummy_duck.put()
  return  dummy_duck_key

"""Entry in leaderboard, storing ranking information.

Should be created only by calling Leaderboard.create_entry().
"""
class LeaderboardEntry(ndb.Model):
  leaderboard_key = ndb.KeyProperty(kind='Leaderboard', required=True)
  ranking = ndb.IntegerProperty(required=True)
  instability = ndb.FloatProperty(required=True)
  duck_key = ndb.KeyProperty(kind=Duck, indexed=False, required=True)

  def clear_duck(self):
    self.duck_key = get_dummy_duck_key()
    self.put()

  def update_ranking(self, new_rank):
    logging.info('RANK UPDATE: key=%s old_rank=%s new_rank=%s', self.key, self.ranking, new_rank)
    self.instability = (self.instability + abs(self.ranking - new_rank))/2
    self.ranking = new_rank
    self.put()

"""Leaderboard information (source of truth for size of leaderboard)."""
class Leaderboard(ndb.Model):
  size = ndb.IntegerProperty(required=True, default=0)

  def create_entry(self, duck):
    self.size = self.size + 1
    le = LeaderboardEntry(
        leaderboard_key=self.key, ranking=self.size,
        instability=self.size, duck_key=duck.key)
    le_key = le.put()
    duck.leaderboard_entry_key = le_key
    duck.put()
    self.put()
    return le_key

  def get_entries_query(self):
    return LeaderboardEntry.query(LeaderboardEntry.leaderboard_key == self.key)

"""Returns main leaderboard."""
def get_main_leaderboard():
  leaderboard_key = ndb.Key(Leaderboard, 'main')
  leaderboard = leaderboard_key.get()
  # Create entity if it does not exist.
  if not leaderboard:
    leaderboard = Leaderboard(id='main')
    leaderboard.put()
  return leaderboard

"""Returns key for provided user."""
def get_user_key(user):
  return ndb.Key('User', user.user_id())

"""Returns list of current user's Ducks (including name and urlsafe duck key."""
def get_user_ducks():
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query(ancestor=user_key)
  duck_list = []
  for duck in duck_query:
    duck_info = {'name': duck.name, 'duckUrl': duck.key.urlsafe()}
    if duck.published:
      duck_info['ranking'] = duck.leaderboard_entry_key.get().ranking
    duck_list.append(duck_info)
  return duck_list

"""Returns object containing specified duck's information or None."""
def get_duck_info(duck):
  duck_info = {
      'name': duck.name,
      'duck_key': duck.key.urlsafe(),
      'code': {'js': duck.code.js, 'opt_xml': duck.code.opt_xml},
      'published': duck.published,
  }
  if duck.published:
    duck_info['ranking'] = duck.leaderboard_entry_key.get().ranking
  return duck_info

"""Verifies whether duck exists and is owned by current user."""
def verify_duck(duck):
  # Verify Duck exists in database
  if not duck:
    # Duck with specified key does not exist.
    print("Status: 400 Unknown Duck key")
    return False
  else:
    # Verify user is owner of duck
    if duck.key.parent() != get_user_key(users.get_current_user()):
      # User cannot delete this duck (user is not owner).
      print("Status: 401 Unauthorized")
      return False
  return True

"""Deletes given duck and returns whether it was successful."""
def delete_duck(duck):
  if not verify_duck(duck):
    return False
  duck.key.delete()
  return True

"""Creates duck with the given attributes and returns key."""
def create_duck(name, code):
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query(ancestor=user_key)
  duck_count = duck_query.count(limit=10)
  if duck_count == 10:
    # There are too many ducks!!
    print("Status: 403 Owner has too many ducks")
    return None
  else:
    # Create a new Duck entry
    duck = Duck(name=name, code=code, parent=user_key)
    duck_key = duck.put()
    return duck_key

def get_opponent_ducks(duck):
  # TODO: Add filter for published ducks
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query()
  duck_list = []
  for duck in duck_query:
    if duck.key.parent() != user_key:
      duck_info = get_duck_info(duck)
      if duck.published:
        duck_info['ranking'] = duck.leaderboard_entry_key.get().ranking
      duck_list.append(duck_info)
  return duck_list
