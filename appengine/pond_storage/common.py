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

from google.appengine.ext import ndb
from google.appengine.api import users

class Code(ndb.Model):
  js = ndb.TextProperty(required=True)
  opt_xml = ndb.TextProperty()

class Duck(ndb.Model):
  name = ndb.StringProperty(indexed=False, required=True)
  code = ndb.LocalStructuredProperty(Code, indexed=False, required=True)

  @classmethod
  def _pre_delete_hook(cls, key):
    duck = key.get()
    le = duck.leaderboard_entry
    if le:
      le.delete()

class LeaderboardEntry(ndb.Model):
  duck_key = ndb.KeyProperty(kind=Duck, indexed=False, required=True)
  leaderboard = ndb.TextProperty(default='main')
  instability = ndb.FloatProperty(required=True)
  ranking = ndb.IntegerProperty(required=True)

Duck.leaderboard_entry = ndb.KeyProperty(indexed=False, kind=LeaderboardEntry)
Duck._fix_up_properties()

def get_user_key(user):
  return ndb.Key('User', user.user_id())

"""Returns list of current user's Ducks (including name and urlsafe duck id."""
def get_user_ducks():
  user_key = get_user_key(users.get_current_user())
  duck_query = Duck.query(ancestor=user_key)
  duck_list = []
  for duck in duck_query:
    duck_list.append({'name': duck.name, 'duckUrl': duck.key.urlsafe()})
  return duck_list

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
