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

"""Submit to gallery with App Engine.
"""

__author__ = "fraser@google.com (Neil Fraser)"

import cgi
import storage
from gallery_api import *


print("Content-Type: text/plain\n")
forms = cgi.FieldStorage()
xml = forms["xml"].value
uuid = storage.xmlToKey(xml)
print("XML saved as %s." % uuid)
app = forms["app"].value
thumb = forms["thumb"].value
title = forms["title"].value
art = Art(uuid=uuid, app=app, thumb=thumb, title=title, public=False)
art.put()
print("Submitted to %s as %s." % (app, uuid))
