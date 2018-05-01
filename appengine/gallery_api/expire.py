"""Blockly Games: Gallery

Copyright 2018 Google Inc.
https://github.com/google/blockly-games

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

"""Expire unpublished items in the gallery with App Engine.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import datetime
import json
from gallery_api import *

# Number of rows per page.
ROWS = 256
# Age in days to delete non-public submissions.
AGE = 90

print("Content-Type: text/plain\n")

bestBefore = datetime.datetime.now() - datetime.timedelta(days=AGE)
query = Art.query(Art.public == False, Art.created < bestBefore)

results = query.fetch(limit=ROWS)

print("Deleting unpublished records before %s" % bestBefore)
for rec in results:
  print("* %s" % rec.title)
  rec.key.delete()
print("Done.")
