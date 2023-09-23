#!/usr/bin/env python3
"""Blockly Games: Gallery Admin Publish/Unpublish

Copyright 2023 Google LLC

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

"""Set a gallery record to be either public or private.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi_utils
import json
import os
import re

# Called with three arguments:
# - app: turtle/movie/music
# - key: Name of record.
# - public: true or false.


forms = cgi_utils.parse_post()
cgi_utils.force_exist(forms, "app", "key", "public")
app = forms["app"] or ""
key = forms["key"] or ""
public = forms["public"]

print("Content-Type: text/plain")
if not re.match(r"[-\w]+", app):
  # Don't scanning "../../etc/passwd"
  print("Status: 406 Not Acceptable\n")
  print("That is not a valid directory.")
elif key and not re.match(r"\w+", cursor):
  # Don't escape from this directory
  print("Status: 406 Not Acceptable\n")
  print("That is not a valid key.")
elif public != "true" and public != "false":
  # Validate 'public' boolean.
  print("Status: 406 Not Acceptable\n")
  print("Public must be 0 or 1.")
else:
  print("Status: 200 OK\n")
  new_public = public == "true"
  dir = cgi_utils.get_dir(app)
  file_name = dir + key + ".gallery"
  if os.path.exists(file_name):
    with open(file_name) as f:
      datum = json.load(f)
    if datum['public'] == new_public:
      print("Public was already " + public)
    else:
      datum['public'] = new_public
      with open(file_name, "w") as f:
        json.dump(f, datum)
    print("Public = " + public)
  else:
    print("Record not found.")

  print(json.dumps(data))
