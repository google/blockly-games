#!/usr/bin/python
# Compresses the files for one game into a single JavaScript file.
#
# Copyright 2013 Google LLC
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

# This script generates two files:
#   compressed.js
#   uncompressed.js
# The compressed file is a concatenation of all the relevant JavaScript which
# has then been run through Google's Closure Compiler.
# The uncompressed file is a script that loads in each JavaScript file
# one by one.  This takes much longer for a browser to load, but is useful
# when debugging code since line numbers are meaningful and variables haven't
# been renamed.  The uncompressed file also allows for a faster development
# cycle since there is no need to rebuild or recompile, just reload.

import json
import os.path
import re
import subprocess
import sys


if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")

# Define a warning message for all the generated files.
WARNING = '// Automatically generated file.  Do not edit!\n'

blocklyMessageNames = []
blocklyGamesMessageNames = []

def main(gameName):
  print('Compressing %s' % gameName.title())
  if not os.path.exists('appengine/%s/generated' % gameName):
    os.mkdir('appengine/%s/generated' % gameName)
  generate_uncompressed(gameName)
  generate_compressed(gameName)
  filterMessages(gameName)

  # Extract the list of supported languages from boot.js.
  # This is a bit fragile.
  boot = open('appengine/common/boot.js', 'r')
  js = ' '.join(boot.readlines())
  boot.close()
  m = re.search('\[\'BlocklyGamesLanguages\'\] = (\[[-,\'\\s\\w]+\])', js)
  if not m:
    raise Exception("Can't find BlocklyGamesLanguages in boot.js")
  langs = m.group(1)
  langs = langs.replace("'", '"')
  langs = json.loads(langs)

  for lang in langs:
    language(gameName, lang)
  print("")


def filterMessages(gameName):
  global blocklyMessageNames, blocklyGamesMessageNames
  # Identify all the Blockly messages used.
  # Load the compiled game.
  f = open('appengine/%s/generated/compressed.js' % gameName, 'r')
  js = f.read()
  f.close()
  # Load any language file (they all should have the same keys).
  msgs = getMessages('en')
  for msg in msgs:
    m = re.search('BlocklyMsg\["([^"]+)"\] = ', msg)
    if m:
      if (('"' + m.group(1) + '"') in js or
          ('.' + m.group(1)) in js or
          ('%{BKY_' + m.group(1) + '}') in js):
        blocklyMessageNames.append(m.group(1))
    m = re.search('BlocklyGamesMsg\["([^"]+)"\] = ', msg)
    if m:
      if ('"' + m.group(1) + '"') in js or ('.' + m.group(1)) in js:
        blocklyGamesMessageNames.append(m.group(1))
  print("Found %d Blockly messages." % len(blocklyMessageNames))
  blocklyMessageNames.sort()
  print("Found %d Blockly Games messages." % len(blocklyGamesMessageNames))
  blocklyGamesMessageNames.sort()


def getMessages(lang):
  # Read all messages for this language.
  blocklyMsgFileName = 'appengine/generated/msg/%s.js' % lang
  f = open(blocklyMsgFileName, 'r')
  msgs = f.readlines()
  f.close()
  return msgs


def language(gameName, lang):
  global blocklyMessageNames, blocklyGamesMessageNames
  msgs = getMessages(lang)
  # Only write out messages that are used (as detected in filterMessages).
  bMsgs = []
  bgMsgs = []
  for msg in msgs:
    m = re.search('BlocklyMsg\["([^"]+)"\] = (.*);\s*', msg)
    if m and m.group(1) in blocklyMessageNames:
      # Blockly message names are all alphabetic, no need to quote.
      bMsgs.append('%s:%s' % (m.group(1), m.group(2)))
    m = re.search('BlocklyGamesMsg\["([^"]+)"\] = (.*);\s*', msg)
    if m and m.group(1) in blocklyGamesMessageNames:
      # Blockly Games message names contain dots, quotes required.
      bgMsgs.append('"%s":%s' % (m.group(1), m.group(2)))

  if not os.path.exists('appengine/%s/generated/msg' % gameName):
    os.mkdir('appengine/%s/generated/msg' % gameName)
  f = open('appengine/%s/generated/msg/%s.js' % (gameName, lang), 'w')
  f.write(WARNING)
  if bMsgs:
    f.write('var BlocklyMsg={%s}\n' % ','.join(bMsgs))
  if bgMsgs:
    f.write('var BlocklyGamesMsg={%s}\n' % ','.join(bgMsgs))
  f.close()


def generate_uncompressed(gameName):
  cmd = ['third-party/closurebuilder/closurebuilder.py',
      '--root=appengine/third-party/',
      '--root=appengine/generated/',
      '--root=appengine/src/',
      '--exclude=',
      '--namespace=%s' % gameName.replace('/', '.').title()]
  directory = gameName
  while directory:
    subdir = 'appengine/%s/generated/' % directory
    if os.path.isdir(subdir):
      cmd.append('--root=%s' % subdir)
    subdir = 'appengine/%s/src/' % directory
    if os.path.isdir(subdir):
      cmd.append('--root=%s' % subdir)
    (directory, sep, fragment) = directory.rpartition(os.path.sep)
  try:
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
  except:
    raise Exception("Failed to Popen: %s" % ' '.join(cmd))
  files = readStdout(proc)

  if gameName == 'pond/docs':
    path = '../'
  else:
    path = ''
  prefix = 'appengine/'
  srcs = []
  for file in files:
    file = file.strip()
    if file[:len(prefix)] == prefix:
      file = file[len(prefix):]
    else:
      raise Exception('"%s" is not in "%s".' % (file, prefix))
    srcs.append('"%s%s"' % (path, file))
  f = open('appengine/%s/generated/uncompressed.js' % gameName, 'w')
  f.write("""%s
window.CLOSURE_NO_DEPS = true;

(function() {
  var srcs = [
      %s
  ];
  function loadScript() {
    var src = srcs.shift();
    if (src) {
      var script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.onload = loadScript;
      document.head.appendChild(script);
    }
  }
  loadScript();
})();
""" % (WARNING, ',\n      '.join(srcs)))
  f.close()
  print('Found %d dependencies.' % len(srcs))


def generate_compressed(gameName):
  cmd = [
    'java',
    '-jar', 'build/third-party-downloads/closure-compiler.jar',
    '--generate_exports',
    '--compilation_level', 'ADVANCED_OPTIMIZATIONS',
    '--dependency_mode=PRUNE',
    '--externs', 'externs/interpreter-externs.js',
    '--externs', 'externs/prettify-externs.js',
    '--externs', 'externs/soundJS-externs.js',
    '--externs', 'externs/storage-externs.js',
    '--externs', 'externs/svg-externs.js',
    #'--language_in', 'STABLE',
    '--language_out', 'ECMASCRIPT5',
    '--entry_point=appengine/%s/src/main' % gameName,
    "--js='appengine/third-party/base.js'",
    "--js='appengine/third-party/blockly/**.js'",
    "--js='appengine/src/*.js'",
    '--warning_level', 'QUIET',
  ]
  directory = gameName
  while directory:
    cmd.append("--js='appengine/%s/src/*.js'" % directory)
    (directory, sep, fragment) = directory.rpartition(os.path.sep)
  try:
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
  except:
    print("Failed to Popen: %s" % cmd)
    raise
  script = readStdout(proc)
  script = ''.join(script)
  script = trim_licence(script)
  print('Compressed to %d KB.' % (len(script) / 1024))

  f = open('appengine/%s/generated/compressed.js' % gameName, 'w')
  f.write(WARNING)
  f.write(script)
  f.close()

def trim_licence(code):
  """Strip out Google's and MIT's Apache licences.

  JS Compiler preserves dozens of Apache licences in the Blockly code.
  Remove these if they belong to Google or MIT.
  MIT's permission to do this is logged in Blockly issue 2412.

  Args:
    code: Large blob of compiled source code.

  Returns:
    Code with Google's and MIT's Apache licences trimmed.
  """
  apache2 = re.compile("""/\\*

 (Copyright \\d+ (Google LLC|Massachusetts Institute of Technology))
( All rights reserved.
)? SPDX-License-Identifier: Apache-2.0
\\*/""")
  return re.sub(apache2, '', code)


def readStdout(proc):
  data = proc.stdout.readlines()
  # Python 2 reads stdout as text.
  # Python 3 reads stdout as bytes.
  return list(map(lambda line:
      type(line) == str and line or str(line, 'utf-8'), data))


if __name__ == '__main__':
  if len(sys.argv) == 2:
    main(sys.argv[1])
  else:
    print('Format: %s <appname>' % sys.argv[0])
    sys.exit(2)
