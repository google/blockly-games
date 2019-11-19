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

"""Gets login or logout url. 
"""

__author__ = "kozbial@google.com (Monica Kozbial)"

import cgi
import json
from google.appengine.api import users

forms = cgi.FieldStorage()
dest_url = forms["dest_url"].value
user = users.get_current_user()
meta = {}
if user:
  meta["logout_url"] = users.create_logout_url(dest_url)
else:
  meta["login_url"] = users.create_login_url(dest_url)
print("Content-Type: application/json\n")
print(json.dumps(meta))
