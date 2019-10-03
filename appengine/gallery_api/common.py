"""Blockly Games: Gallery

Copyright 2018 Google LLC

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

"""Gallery's datastore models.  Shared by admin, submit, and view.
"""

__author__ = "fraser@google.com (Neil Fraser)"

from google.appengine.ext import ndb


class Art(ndb.Model):
  """Models a user-supplied work of art."""
  app = ndb.StringProperty()
  uuid = ndb.StringProperty()
  thumb = ndb.TextProperty()
  title = ndb.TextProperty()
  public = ndb.BooleanProperty()
  created = ndb.DateTimeProperty(auto_now_add=True)
