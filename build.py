#!/usr/bin/python
# Generates single-language bundles of Google's Blockly Games.
#
# Copyright 2014 Google Inc.
# https://github.com/google/blockly-games/tree/offline
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os, shutil

MASTER_DIR = "../blockly-games/"
APPENGINE_DIR = MASTER_DIR + "appengine/"
JSON_DIR = MASTER_DIR + "json/"
GENERATED_DIR = "generated/"
CWD = os.getcwd()

# Check for all required directories up front.
for directory in (MASTER_DIR, JSON_DIR, APPENGINE_DIR):
  if not os.path.isdir(directory):
    raise IOError("Can't find blockly-games source directory:\n" + directory)

# Find all required languages.
languages = []
for filename in os.listdir(JSON_DIR):
  if filename.endswith(".json") and filename != "qqq.json":
    languages.append(filename[:-5])
if len(languages) == 0:
  raise IndexError("No languages found.")
print("%i languages found: %s" % (len(languages), ", ".join(languages)))

# Empty the generated directory.
print("Emptying '%s' directory." % GENERATED_DIR)
if os.path.exists(GENERATED_DIR):
  shutil.rmtree(GENERATED_DIR)
os.mkdir(GENERATED_DIR)

ignore = shutil.ignore_patterns("*.yaml", ".[a-zA-Z]*", "sources", "js",
                                "*.soy", "uncompressed.js")
for language in languages:
  print("Processing %s..." % language)
  os.mkdir(GENERATED_DIR + "blockly-games/")

  # Create index.html redirect file.
  f = open(GENERATED_DIR + "blockly-games/index.html", "w")
  f.write("""
<html>
  <head>
    <meta http-equiv=refresh content='0; url=%s/index.html' />
  </head>
</html>""" % language)
  f.close()

  # Copy the file tree.
  directory = GENERATED_DIR + "blockly-games/" + language + "/"
  shutil.copytree(APPENGINE_DIR, directory, ignore=ignore)
  shutil.rmtree(directory + "js-read-only/blockly/")
  shutil.rmtree(directory + "js-read-only/goog/")
  shutil.rmtree(directory + "js-read-only/third_party_goog/")
  for filename in os.listdir(directory + "js-read-only/JS-Interpreter/"):
    if filename != "compiled.js":
      os.remove(directory + "js-read-only/JS-Interpreter/" + filename)
  # Delete all other generated language files.
  for subdirectory, subdirList, fileList in os.walk(directory):
    if subdirectory.endswith("/generated"):
      for langname in subdirList:
        if langname != language:
          shutil.rmtree(subdirectory + "/" + langname)

  # Create single-language bootloader.
  f = open(directory + "common/boot.js", "w")
  f.write("""
// Single-language bootloader.
(function() {
  // Application path.
  var appName = location.pathname.match(/\/([-\w]+)(\.html)?$/);
  appName = appName ? appName[1].replace('-', '/') : 'index';

  // Only one language.
  var lang = '%s';
  window['BlocklyGamesLanguages'] = [lang];
  window['BlocklyGamesLang'] = lang;

  // Load the language pack.
  var script = document.createElement('script');
  script.src = appName + '/generated/' + lang + '/compressed.js';
  script.type = 'text/javascript';
  document.head.appendChild(script);
})();
""" % language)
  f.close()

  # Zip the bundle.
  os.chdir(GENERATED_DIR)
  os.system("zip -rmq9 blockly-games-%s.zip blockly-games/" % language)
  os.chdir(CWD)
