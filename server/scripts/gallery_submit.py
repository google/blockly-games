#!/usr/bin/env python3
"""Blockly Games: Gallery Submissions

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

"""Store programs (XML and JS) to disk.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import json
import cgi_utils
import storage


THUMB_PREFIX = 'data:image/png;base64,'

def check_gallery(title, thumb):
  if not title:
    # No title param.
    print("Status: 406 Not Acceptable\n")
    print("No title.")
    return False
  if len(title) > 40:
    # Max title length is enforced client-side as 32.  Check again.
    # Leave some wiggle room in case emoji or somesuch are counted differently
    # by Python vs the browser.
    print("Status: 413 Payload Too Large\n")
    print("Title is too long.")
  if not thumb.startswith(THUMB_PREFIX):
    print("Status: 406 Not Acceptable\n")
    print("Thumbnail isn't a base64 PNG.")
  if len(thumb) > 250000:
    # A base64 encoded 200x200 pixel PNG of random static is 172,370 bytes.
    # 250kb should be enough to handle anything valid.
    print("Status: 413 Payload Too Large\n")
    print("Thumbnail is too large.")


def store_gallery(key, app, data, title, thumb):
  obj = {
    "data": data,
    "title": title,
    "thumb": thumb
  }
  # Add a poison line to prevent raw content from being served.
  text = cgi_utils.POISON + json.dumps(obj)

  # Save the data to a file.
  file_name = cgi_utils.get_dir(app) + key + ".gallery"
  with open(file_name, "w") as f:
    f.write(text)


if __name__ == "__main__":
  forms = cgi_utils.parse_post()
  cgi_utils.force_exist(forms, "app", "data", "thumb", "title")
  app = forms["app"] or ""
  data = forms["data"]
  title = (forms["title"] or "").strip()
  thumb = (forms["thumb"] or "").strip()

  print("Content-Type: text/plain")
  if storage.check(app, data) and check_gallery(title, thumb):
    key = storage.store(app, data)
    store_gallery(key, app, data, title, thumb)
    print("Status: 200 OK\n")
    print(key)
