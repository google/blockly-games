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

"""Creates and stores a new Duck."""

import cgi
import json
from pond_storage import *

forms = cgi.FieldStorage()
name = forms['name'].value
code = None
if forms.has_key('js'):
  js = forms['js'].value
  code = Code(js=js)
  if forms.has_key('xml'):
    code.opt_xml = forms['xml'].value
duck_key = create_duck(name, code)
meta = {'duck_key': duck_key.urlsafe()}
if forms.has_key('getUserDucks') and forms['getUserDucks'].value == 'true':
  meta['duckList'] = get_user_ducks()
print('Content-Type: application/json\n')
print(json.dumps(meta))
