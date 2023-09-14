#!/usr/bin/env python3
"""Blockly Games: Error Reporter

Copyright 2021 Google LLC

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

"""Log a reported client-side error.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import logging
logging.basicConfig(filename="../javascript.log", encoding="utf-8",
                    format="%(levelname)s: %(message)s", level=logging.DEBUG)
from os import environ
from sys import stdin
from urllib.parse import unquote


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


print("Content-Type: text/plain")
if "REQUEST_METHOD" in environ:
  method = environ["REQUEST_METHOD"]
if method != "POST":
  # GET could be a link.
  print("Status: 405 Method Not Allowed\n")
  print("Use 'POST', not '%s'." % method)
else:
  forms = parse_post(stdin)
  error = ""
  if "error" in forms:
    error = forms["error"]
  url = ""
  if "url" in forms:
    url = forms["url"]
  method = ""

  if not error or not url:
    print("Status: 406 Not Acceptable\n")
    print("Missing 'error' or 'url' param.")
  elif len(error) + len(url) >= 10000:
    # 10 kb is too much.
    print("Status: 413 Payload Too Large\n")
    print("Error is too large.")
  else:
    logging.error(forms["url"] + "\n" + forms["error"] + "\n")
    print("Status: 200 OK\n")
    print("Error logged.")
