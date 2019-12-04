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

"""Creates a copy of the specified Duck."""

import cgi
import re
import json
from google.appengine.ext import ndb
from pond_storage import *

forms = cgi.FieldStorage()
urlsafe_key = forms['key'].value
duck_key = ndb.Key(urlsafe=urlsafe_key)
duck = duck_key.get()
if verify_duck(duck):
  #  Generate a new name for the copy.
  if duck.name[-1].isdigit():
    new_duck_name = re.sub('\d+',lambda x: str(int(x.group()) + 1), duck.name)
  else:
    new_duck_name = duck.name + '2'
  duck_key = create_duck(new_duck_name, duck.code)
  if duck_key:
    meta = {'duck_key': duck_key.urlsafe()}
    if forms.has_key('getUserDucks') and forms['getUserDucks'].value == 'true':
      meta['duckList'] = get_user_ducks()
    print('Content-Type: application/json\n')
    print(json.dumps(meta))
