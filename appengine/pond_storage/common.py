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
  userid = ndb.StringProperty()  # hashed google id
  name = ndb.StringProperty(indexed=False, required=True)
  code = ndb.LocalStructuredProperty(Code, indexed=False, required=True)

  @classmethod
  def _pre_delete_hook(cls, key):
    duck = key.get()
    user = ndb.Key('User', duck.userid).get()
    if user:
      user.duck_keys.remove(duck.key)
      user.put()
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

class User(ndb.Model):
  duck_keys = ndb.KeyProperty(kind=Duck, indexed=False, repeated=True)

  @classmethod
  def _pre_delete_hook(cls, key):
    user = key.get()
    ndb.delete_multi(user.duck_keys)

def get_user_key(user):
  return ndb.Key('User', user.user_id())

"""Returns list of current user's Ducks (including name and urlsafe duck id."""
def get_user_ducks():
  user_key = get_user_key(users.get_current_user())
  datastore_user = user_key.get()
  if datastore_user:
   return [{'name': key.get().name, 'duckUrl': key.urlsafe()}
           for key in datastore_user.duck_keys]
  return []

"""Verifies whether duck exists and is owned by current user."""
def verify_duck(duck):
  # Verify Duck exists in database
  if not duck:
    # Duck with specified key does not exist.
    print("Status: 400 Unknown Duck key")
    return False
  else:
    # Verify user is owner of duck
    user = users.get_current_user()
    if duck.userid != user.user_id():
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
  user = users.get_current_user()
  userid = user.user_id()
  user_key = get_user_key(user)
  datastore_user = user_key.get()
  # Verify user does not have too many Ducks
  if datastore_user and len(datastore_user.duck_keys) >= 10:
    # There are too many ducks!!
    print("Status: 403 Owner has too many ducks")
    return None
  else:
    # Create a user entity if needed
    if not datastore_user:
      datastore_user = User(id=userid)
    # Create a new Duck entry
    duck = Duck(userid=userid, name=name, code=code)
    duck_key = duck.put()
    datastore_user.duck_keys.append(duck_key)

    datastore_user.put()
    return duck_key
