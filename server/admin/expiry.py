#!/usr/bin/env python3
"""Blockly Games: Expiry

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

"""Delete any record not accessed in a while.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import os
import time


# Data directory.
PATH = "../data/"
# Two years.
AGE = 60*60*24*365*2


EXPIRY = int(time.time()) - AGE

if "REQUEST_METHOD" in os.environ:
  print("Content-Type: text/plain")
  print("Status: 200 OK\n")

dir_count = 0
for root, dir_names, file_names in os.walk(PATH):
  dir_count += 1
  print("Scanning %s" % root)
  delete_count = 0
  for name in file_names:
    full_name = root + "/" + name
    when = os.path.getatime(full_name)
    if when < EXPIRY:
      os.remove(full_name)
      delete_count += 1
  if delete_count > 0:
    print("Deleted %d file(s)." % delete_count)

if dir_count == 0:
  print('Data directories not found.  PATH not valid?')
else:
  print("Done.")
