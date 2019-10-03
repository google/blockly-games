"""Blockly Games: Gallery

Copyright 2018 Google LLC

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

"""Admin control of gallery with App Engine.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi
from gallery_api import *


print("Content-Type: text/plain\n")
forms = cgi.FieldStorage()
record_id = int(forms["key"].value)
public = (forms["public"].value == "1")
art = Art.get_by_id(record_id)
if art.public == public:
  print("No change to %s." % record_id)
else:
  art.public = public
  art.put()
  if public:
    print("Published %s." % record_id)
  else:
    print("Unpublished %s." % record_id)
