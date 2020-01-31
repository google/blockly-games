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

"""Defines Pond online's datastore models and common functions."""

import logging
from google.appengine.ext import ndb
from google.appengine.api import users

class Code(ndb.Model):
  """Struct for user code."""
  js = ndb.TextProperty(required=True)
  opt_xml = ndb.TextProperty()

def get_default_code():
  js = 'cannon(0, 70);\n'
  xml = '<xml>' \
        '<block type=\"pond_cannon\">' \
        '<value name=\"DEGREE\">' \
        '<shadow type=\"pond_math_number\">' \
        '<mutation angle_field=\"true\"></mutation>' \
        '<field name=\"NUM\">0</field>' \
        '</shadow>' \
        '</value>' \
        '<value name=\"RANGE\">' \
        '<shadow type=\"pond_math_number\">' \
        '<mutation angle_field=\"false\"></mutation>' \
        '<field name=\"NUM\">70</field><' \
        '/shadow>' \
        '</value>' \
        '</block>' \
        '</xml>'
  return Code(js=js, opt_xml=xml)

class Duck(ndb.Model):
  """Stores user duck code and reference to leaderboard entry if published."""
  name = ndb.StringProperty(indexed=False, required=True)
  code = ndb.LocalStructuredProperty(Code, indexed=False, required=True,
                                     default=get_default_code())
  leaderboard_entry_key = ndb.KeyProperty(indexed=False,
                                          kind='LeaderboardEntry')
  published = ndb.ComputedProperty(
      lambda self: self.leaderboard_entry_key is not None)

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

class LeaderboardEntry(ndb.Model):
  """Entry in leaderboard, storing ranking information.

  Should be created only by calling Leaderboard.create_entry().
  """
  leaderboard_key = ndb.KeyProperty(kind='Leaderboard', required=True)
  ranking = ndb.IntegerProperty(required=True)
  instability = ndb.FloatProperty(required=True)
  duck_key = ndb.KeyProperty(kind=Duck, indexed=False)
  has_duck = ndb.ComputedProperty(lambda self: self.duck_key is not None)

  @ndb.transactional(xg=True)
  def clear_duck(self):
    """Clears reference to duck or deletes entry if already at bottom."""
    leaderboard = self.leaderboard_key.get()
    if leaderboard.delete_if_last_entry(self.key):
      return

    del self.duck_key
    self.put()

  def update_ranking(self, new_rank):
    """Updates ranking and instability of entry.

    Updates the ranking and instability value of the entry. If the entry is a
    dummy entry that has been moved to the bottom of the leaderboard, then it
    deletes itself.
    """
    logging.info('RANK UPDATE: key=%s old_rank=%s new_rank=%s',
                 self.key, self.ranking, new_rank)
    self.instability = (self.instability + abs(self.ranking - new_rank))/2
    self.ranking = new_rank
    self.put()
    if not self.has_duck:
      leaderboard = self.leaderboard_key.get()
      leaderboard.delete_if_last_entry(self.key)

class Leaderboard(ndb.Model):
  """Leaderboard information (source of truth for size of leaderboard)."""
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

  @ndb.transactional(xg=True)
  def delete_if_last_entry(self, entry_key):
    entry = entry_key.get()
    if entry.leaderboard_key != self.key:
      logging.error('Tried to remove entry from wrong leaderboard.')
      return False
    if entry.ranking == self.size:
      self.size = self.size - 1
      entry_key.delete()
      logging.info('Cleaned up dummy entry with key :%s', entry_key)
      self.put()
      return True
    return False

  def get_entries_query(self):
    return LeaderboardEntry.query(LeaderboardEntry.leaderboard_key == self.key)

def get_main_leaderboard():
  """Returns main leaderboard."""
  leaderboard_key = ndb.Key(Leaderboard, 'main')
  leaderboard = leaderboard_key.get()
  # Create entity if it does not exist.
  if not leaderboard:
    leaderboard = Leaderboard(id='main')
    leaderboard.put()
  return leaderboard

def get_user_key(user):
  """Returns key for provided user."""
  return ndb.Key('User', user.user_id())

def get_user_ducks():
  """Returns list of current user's Ducks (with name and urlsafe duck key)."""
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query(ancestor=user_key)
  duck_list = []
  for duck in duck_query:
    duck_info = {'name': duck.name, 'duck_key': duck.key.urlsafe()}
    if duck.published:
      duck_info['ranking'] = duck.leaderboard_entry_key.get().ranking
    duck_list.append(duck_info)
  return duck_list

def get_duck_info(duck, key_names=None):
  """Returns object containing specified duck's information."""
  user_key = get_user_key(users.get_current_user())
  if key_names:
    duck_info = {}
    if 'name' in key_names:
      duck_info['name'] = duck.name
    if 'duck_key' in key_names:
      duck_info['duck_key'] = duck.key.urlsafe()
    if 'code' in key_names:
      duck_info['code'] = {'js': duck.code.js, 'opt_xml': duck.code.opt_xml}
    if 'published' in key_names:
      duck_info['published'] = duck.published
    if 'isOwner' in key_names:
      duck_info['isOwner'] = duck.key.parent() == user_key
  else:
    duck_info = {
      'name': duck.name,
      'duck_key': duck.key.urlsafe(),
      'code': {'js': duck.code.js, 'opt_xml': duck.code.opt_xml},
      'published': duck.published,
      'isOwner': duck.key.parent() == user_key
    }
  if duck.published:
    duck_info['ranking'] = duck.leaderboard_entry_key.get().ranking

  return duck_info

def entries_to_duck_info(entries, key_names=None):
  """Returns a list of extracted duck info.
  Args:
    entries: A list of LeaderboardEntry entities to extract duck info from.

  Returns:
    A list of dictionaries containing extracted duck information.
    Example duck info dictionary:
    {
      'name': 'bob',
      'duck_key': 'urlsafe duck key',
      'published': 'true',
      'ranking': 1
    }
  """
  ducks = []
  for entry in entries:
    if not entry.has_duck:
      # TODO: handle/filter dummy entries earlier.
      duck_info = {
          'name': "dummy",
          'duck_key': 'aKey',
          'published':'true',
          'ranking':entry.ranking
      }
    else:
      duck = entry.duck_key.get()
      duck_info = get_duck_info(duck, key_names)
    ducks.append(duck_info)
  return ducks

def verify_duck(duck):
  """Verifies whether duck exists and is owned by current user."""
  if not duck:
    print('Status: 400 Unknown Duck key')
    return False
  else:
    if duck.key.parent() != get_user_key(users.get_current_user()):
      print('Status: 401 Unauthorized')
      return False
  return True

def delete_duck(duck):
  """Deletes given duck and returns whether it was successful."""
  if not verify_duck(duck):
    return False
  duck.key.delete()
  return True

def create_duck(name, code=None):
  """Creates duck with the given attributes and returns key."""
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query(ancestor=user_key)
  duck_count = duck_query.count(limit=10)
  if duck_count == 10:
    print('Status: 403 Owner has too many ducks')
    return None
  else:
    duck = Duck(name=name, parent=user_key)
    if code:
      duck.code = code
    duck_key = duck.put()
    return duck_key
