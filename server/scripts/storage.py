#!/usr/bin/env python3
"""Blockly Games: Storage

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

import hashlib
import os
import random
import re
import cgi_utils


def keyGen(seed_string):
  random.seed(seed_string)
  # Generate a random string of length KEY_LEN.
  KEY_LEN = 6
  CHARS = "abcdefghijkmnopqrstuvwxyz23456789"  # Exclude l, 0, 1.
  max_index = len(CHARS) - 1
  return "".join([CHARS[random.randint(0, max_index)] for x in range(KEY_LEN)])


def check(app, data):
  method = ""
  if "REQUEST_METHOD" in os.environ:
    method = os.environ["REQUEST_METHOD"]

  if method != "POST":
    # GET could be a link.
    print("Status: 405 Method Not Allowed\n")
    print("Use POST, not '%s'." % method)
    return False
  if not re.match(r"[-\w]+", app):
    # Don't try saving to "../../etc/passwd"
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid directory.")
    return False
  if data == None:
    # No data param.
    print("Status: 406 Not Acceptable\n")
    print("No data.")
    return False
  if not os.path.exists(cgi_utils.get_dir(app)):
    # Don't try saving to a new directory.
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid app.")
    return False
  if len(data) >= 1000000:
    # One megabyte is too much.
    print("Status: 413 Payload Too Large\n")
    print("Your program is too large.")
    return False
  return True


def store(app, data):
  # Add a poison line to prevent raw content from being served.
  data = cgi_utils.POISON + data

  # Hash the content and generate a key.
  binary_data = data.encode("UTF-8")
  hash = hashlib.sha256(binary_data).hexdigest()
  key = keyGen(hash)

  # Save the data to a file.
  file_name = cgi_utils.get_dir(app) + key + ".blockly"
  with open(file_name, "w") as f:
    f.write(data)
  return key


if __name__ == "__main__":
  forms = cgi_utils.parse_post()
  cgi_utils.force_exist(forms, "app", "data")
  app = forms["app"] or ""
  data = forms["data"]

  print("Content-Type: text/plain")
  if check(app, data):
    key = store(app, data)
    print("Status: 200 OK\n")
    print(key)
