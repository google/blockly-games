"""Blockly Games: Pond Online

Copyright 2019 Google LLC

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

"""Get all ducks for the current user 
"""

__author__ = "aschmiedt@google.com (Abby Schmiedt)"

import json
from pond_storage import *

duckList = get_user_ducks()
print("Content-Type: application/json\n")
print(json.dumps(duckList))
