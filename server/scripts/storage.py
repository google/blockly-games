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
from sys import stdin
from urllib.parse import unquote


PATH = "../data/"

# Parse POST data (e.g. a=1&b=2) into a dictionary (e.g. {"a": 1, "b": 2}).
# Very minimal parser.  Does not combine repeated names (a=1&a=2), ignores
# valueless names (a&b), does not support isindex or multipart/form-data.
def parse_post(fp):
  data = fp.read()
  parts = data.split("&")
  dict = {}
  for part in parts:
    tuple = part.split("=", 1)
    if len(tuple) == 2:
      dict[tuple[0]] = unquote(tuple[1])
  return dict


def keyGen(seed_string):
  random.seed(seed_string)
  # Generate a random string of length KEY_LEN.
  KEY_LEN = 6
  CHARS = "abcdefghijkmnopqrstuvwxyz23456789"  # Exclude l, 0, 1.
  max_index = len(CHARS) - 1
  return "".join([CHARS[random.randint(0, max_index)] for x in range(KEY_LEN)])


def storeData(dir, data):
  # Add a poison line to prevent raw content from being served.
  data = "{[(< UNTRUSTED CONTENT >)]}\n" + data

  # Hash the content and generate a key.
  binary_data = data.encode("UTF-8")
  hash = hashlib.sha1(binary_data).hexdigest()
  key = keyGen(hash)

  # Save the data to a file.
  with open(dir + key, "w") as f:
    f.write(data)

  return key


if __name__ == "__main__":
  forms = parse_post(stdin)
  app = ""
  if "app" in forms:
    app = forms["app"]
  dir = "%s%s/" % (PATH, app)
  data = ""
  if "data" in forms:
    data = forms["data"]
  method = ""
  if "REQUEST_METHOD" in os.environ:
    method = os.environ["REQUEST_METHOD"]

  print("Content-Type: text/plain")
  if method != "POST":
    # GET could be a link.
    print("Status: 405 Method Not Allowed\n")
    print("Use POST, not '%s'." % method)
  elif not re.match(r"[-\w]+", app):
    # Don't try saving to "../../etc/passwd"
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid directory.")
  elif not os.path.exists(dir):
    # Don't try saving to a new directory.
    print("Status: 406 Not Acceptable\n")
    print("That is not a valid app.")
  elif len(data) >= 1000000:
    # One megabyte is too much.
    print("Status: 413 Payload Too Large\n")
    print("Your program is too large.")
  else:
    key = storeData(dir, data)
    print("Status: 200 OK\n")
    print(key)
