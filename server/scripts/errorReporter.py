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

import cgi
import logging
logging.basicConfig(filename='../javascript.log', encoding='utf-8',
                    format='%(levelname)s: %(message)s', level=logging.DEBUG)

print("Content-Type: text/plain\n")
forms = cgi.FieldStorage()
if ("error" in forms) and ("url" in forms):
  logging.error(forms["url"].value + '\n' + forms["error"].value + '\n')
  print("Error logged.")
else:
  print("Missing 'error' or 'url' param.")
