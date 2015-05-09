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

__author__ = "fraser@google.com (Neil Fraser)"

from google.appengine.api import users

user = users.get_current_user()
print("Status: 302")
print("Location: /pond-user?id=%s" % user.user_id())
