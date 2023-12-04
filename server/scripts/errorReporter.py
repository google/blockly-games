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

import cgi_utils
import logging
logging.basicConfig(filename="../javascript.log", encoding="utf-8",
                    format="%(levelname)s: %(message)s", level=logging.DEBUG)
from os import environ


print("Content-Type: text/plain")
method = ""
if "REQUEST_METHOD" in environ:
  method = environ["REQUEST_METHOD"]
if method != "POST":
  # GET could be a link.
  print("Status: 405 Method Not Allowed\n")
  print("Use 'POST', not '%s'." % method)
else:
  forms = cgi_utils.parse_post()
  cgi_utils.force_exist(forms, "error", "url")
  error = forms["error"]
  url = forms["url"]

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
