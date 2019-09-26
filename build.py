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

import os
import os.path
import shutil

MASTER_DIR = "../blockly-games/"
APPENGINE_DIR = MASTER_DIR + "appengine/"
GENERATED_DIR = "generated/"
CWD = os.getcwd()

# Check for all required directories up front.
for directory in (MASTER_DIR, APPENGINE_DIR):
  if not os.path.isdir(directory):
    raise IOError("Can't find blockly-games source directory:\n" + directory)

# Find all required languages.
languages = []
for directory in os.listdir(MASTER_DIR + "appengine/index/generated/"):
  if os.path.isfile(MASTER_DIR + "appengine/index/generated/" + directory + "/compressed.js"):
    languages.append(directory)
if len(languages) == 0:
  raise IndexError("No languages found.")
languages.sort()
print("%i languages found: %s" % (len(languages), ", ".join(languages)))

# Empty the generated directory.
print("Emptying '%s' directory." % GENERATED_DIR)
if os.path.exists(GENERATED_DIR):
  shutil.rmtree(GENERATED_DIR)
os.mkdir(GENERATED_DIR)

ignore = shutil.ignore_patterns("*.yaml", ".[a-zA-Z]*", "sources", "js",
    "*.soy", "msg.js", "soy.js", "uncompressed.js", "*.py", "*.pyc")
for language in languages:
  print("Processing %s..." % language)
  os.mkdir(GENERATED_DIR + "blockly-games/")

  # Create index.html redirect file.
  f = open(GENERATED_DIR + "blockly-games/index.html", "w")
  f.write("""<html><head>
<meta http-equiv=refresh content="0; url=%s/index.html"/>
</head></html>""" % language)
  f.close()

  # Copy the file tree.
  directory = GENERATED_DIR + "blockly-games/" + language + "/"
  shutil.copytree(APPENGINE_DIR, directory, ignore=ignore)
  shutil.rmtree(directory + "gallery")
  shutil.rmtree(directory + "gallery_api")
  shutil.rmtree(directory + "genetics")
  shutil.rmtree(directory + "third-party/ace/snippets/")
  for filename in os.listdir(directory + "third-party/ace/"):
    if filename not in ("ace.js", "mode-javascript.js", "theme-chrome.js",
                        "worker-javascript.js"):
      os.remove(directory + "third-party/ace/" + filename)

  # Delete Blockly, but leave the media directory.
  shutil.move(directory + "third-party/blockly/media/",
              GENERATED_DIR + "blockly-games/media")
  shutil.rmtree(directory + "third-party/blockly/")
  shutil.move(GENERATED_DIR + "blockly-games/media",
              directory + "third-party/blockly/media/")

  shutil.rmtree(directory + "generated/")
  shutil.rmtree(directory + "third-party/JS-Interpreter/demos/")
  for filename in os.listdir(directory + "third-party/JS-Interpreter/"):
    if filename != "compressed.js":
      os.remove(directory + "third-party/JS-Interpreter/" + filename)
  for dirname in os.listdir(directory + "third-party/soundfonts/"):
    if os.path.isdir("third-party/soundfonts/" + dirname):
      os.remove(directory + "third-party/soundfonts/" + dirname + "/B4.mp3")
  for filename in os.listdir(directory + "third-party/SoundJS/"):
    if filename != "soundjs.min.js":
      os.remove(directory + "third-party/SoundJS/" + filename)
  # Delete all other generated language files.
  for subdirectory, subdirList, fileList in os.walk(directory):
    if subdirectory.endswith("/generated"):
      for langname in subdirList:
        if langname != language:
          shutil.rmtree(subdirectory + "/" + langname)
  for filename in ('admin.html', 'gallery.html', 'robots.txt', 'genetics.html',
      'common/debug.js', 'common/stripes.gif', 'common/storage.js',
      'third-party/base.js', 'third-party/soyutils.js',
      'third-party/soundfonts/README.txt',
      'third-party/blockly/media/pilcrow.png',
      'third-party/blockly/media/sprites.svg',
      'index/title.png', 'apple-touch-icon.png'):
    os.remove(directory + filename)

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
