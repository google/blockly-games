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

class Code(ndb.Model):
  js = ndb.TextProperty(required=True)
  opt_xml = ndb.TextProperty()

class Duck(ndb.Model):
  userid = ndb.StringProperty()  # hashed google id
  name = ndb.StringProperty(indexed=False, required=True)
  code = ndb.LocalStructuredProperty(Code, indexed=False, required=True)

  @classmethod
  def _pre_delete_hook(cls, key):
    le = key.get().leaderboard_entry
    if le:
      le.delete()

class LeaderboardEntry(ndb.Model):
  duck_key = ndb.KeyProperty(kind=Duck, indexed=False, required=True)
  leaderboard = ndb.TextProperty(default='main')
  instability = ndb.FloatProperty(required=True)
  ranking = ndb.IntegerProperty(required=True)

Duck.leaderboard_entry = ndb.KeyProperty(indexed=False, kind=LeaderboardEntry)
Duck._fix_up_properties()
