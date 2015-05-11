"""Blockly Games: Pond Database

Copyright 2015 Google Inc.
https://github.com/google/blockly-games

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

"""Redirect to user's page.
"""

__author__ = "neutron@google.com (Quynh Neutron)"

from google.appengine.api import users
from google.appengine.ext import ndb


class Player(ndb.Model):
    id = ndb.KeyProperty(kind="int")
    user_id = ndb.IntegerProperty(required=True) #must be unique
    name = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty()
    deleted = ndb.BooleanProperty(default=False)

class Duck(ndb.Model):
    id = ndb.KeyProperty(kind="int")
    player_id = ndb.IntegerProperty()
    player_name = ndb.StringProperty(indexed=False)
    level = ndb.IntegerProperty()
    name = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty()
    program_xml = ndb.TextProperty()
    program_js = ndb.TextProperty()
    velocity = ndb.IntegerProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)
    deleted = ndb.BooleanProperty(default=False)

    @classmethod
    def ducks_by_owner(cls, player_key):
        return cls.query(player_id=player_key).order(-cls.modified)

    @classmethod
    def ducks_by_level(cls, level):
        return cls.query(level=level).order(-cls.modified)

# Check if user exist, then maybe create user if not
user = users.get_current_user()
print("Status: 302")
print("Location: /pond-player?id=%s" % user.user_id())

#player_id = Player.query(Player.user_id == user.user_id).get()
#Can't use Player.get_by_id(user.user_id) because user_id is not id

# Are all KeyProperties auto-filled?
# How to ensure some property is unique?
