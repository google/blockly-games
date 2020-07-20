"""Blockly Games: Legacy Reddit to Turtle/Movie router.

Copyright 2014 Google LLC

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

"""Blockly Games used to use Reddit as a gallery.  These URLs still exist.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import os
import re

app = re.search(r"(\w+)-reddit$", os.environ.get('PATH_INFO', '')).group(1)
uuid = os.environ.get('QUERY_STRING', '')
print("Status: 301 Moved Permanently")
print("Location: /%s?level=10#%s\n" % (app, uuid))
