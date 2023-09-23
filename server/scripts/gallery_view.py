#!/usr/bin/env python3
"""Blockly Games: Gallery Viewer

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

"""Fetch public gallery records.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi_utils
import json
import glob
import os
import re

# Called with two arguments:
# - app: turtle/movie/music
# - cursor: Key to the next page of results.
# Returns a JSON object.

# Number of rows per page.
ROWS_PAGE = 24


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
      cursor_name = "/%s.gallery" % cursor
      cursor_index = [i for i, name in enumerate(names) if name.endswith(cursor_name)]
      if len(cursor_index):
        names = names[cursor_index[0]:]
      else:
        # Can't find the cursor.
        names = []
    data = [];
    for name in names:
      m = re.search(r"/(\w+)\.gallery$", name)
      if not m:
        continue
      with open(name) as f:
        try:
          datum = json.load(f)
        except:
          datum = {"title": "Invalid JSON"}
      if datum["public"]:
        if len(data) >= ROWS_PAGE:
          data.append({"cursor": m[1]})
          break
        del datum["public"]
        datum["key"] = m[1]
        data.append(datum)
    print("Status: 200 OK\n")
    print(json.dumps(data))
