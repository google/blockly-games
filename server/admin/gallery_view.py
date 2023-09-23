#!/usr/bin/env python3
"""Blockly Games: Gallery Admin Viewer

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

"""Fetch both public and private gallery records.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi_utils
import json
import glob
import os
import re

# Called with two arguments:
# - app: turtle/movie/music
# - cursor: Opaque pointer string.
# Returns a JSON object.

# Number of rows per page.
ROWS_PAGE = 240
ROWS_PAGE = 4


if __name__ == "__main__":
  forms = cgi_utils.parse_query()
  cgi_utils.force_exist(forms, "app", "cursor")
  app = forms["app"] or ""
  cursor = forms["cursor"] or ""

  print("Content-Type: text/plain")
  if not re.match(r"[-\w]+", app):
    # Don't scanning "../../etc/passwd"
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid directory.")
  elif cursor and not re.match(r"\w+", cursor):
    # Don't escape from this directory
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid cursor.")
  else:
    dir = cgi_utils.get_dir(app)
    names = sorted(glob.glob("%s*.gallery" % dir), key=os.path.getctime)

    # Trim off all entries before the cursor.
    if cursor:
      i = names.index(cursor)
      if i != -1:
        names = names[i:]
    data = [];
    for name in names:
      with open(name) as f:
        datum = json.load(f)
      m = re.search(r"/(\w+)\.gallery$", name)
      if not m:
        continue
      datum['key'] = m[1]
      data.append(datum)
      if len(data) >= ROWS_PAGE:
        break
    print("Status: 200 OK\n")
    print(json.dumps(data))
