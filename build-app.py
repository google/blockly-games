#!/usr/bin/python
# Compresses the core Blockly files into a single JavaScript file.
#
# Copyright 2013 Google Inc.
# https://github.com/google/blockly-games
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
#   blockly_compressed.js
#   blockly_uncompressed.js
# The compressed file is a concatenation of all of Blockly's core files which
# have been run through Google's Closure Compiler.  This is done using the
# online API (which takes a few seconds and requires an Internet connection).
# The uncompressed file is a script that loads in each of Blockly's core files
# one by one.  This takes much longer for a browser to load, but is useful
# when debugging code since line numbers are meaningful and variables haven't
# been renamed.  The uncompressed file also allows for a faster developement
# cycle since there is no need to rebuild or recompile, just reload.

import os.path, re, subprocess, sys

# Given a user's language, which of the available Blockly core languagues
# should be used.
CORE_LANGUAGE_MAP = {
  'ar': 'Blockly.Msg.ar',
  'az': 'Blockly.Msg.az',
  'ca': 'Blockly.Msg.ca',
  'cs': 'Blockly.Msg.cs',
  'da': 'Blockly.Msg.da',
  'de': 'Blockly.Msg.de',
  'el': 'Blockly.Msg.el',
  'en': 'Blockly.Msg.en',
  'es': 'Blockly.Msg.es',
  'fa': 'Blockly.Msg.fa',
  'fi': 'Blockly.Msg.fi',
  'fr': 'Blockly.Msg.fr',
  'frr': 'Blockly.Msg.de',
  'he': 'Blockly.Msg.he',
  'hrx': 'Blockly.Msg.hrx',
  'hu': 'Blockly.Msg.hu',
  'id': 'Blockly.Msg.id',
  'is': 'Blockly.Msg.is',
  'it': 'Blockly.Msg.it',
  'ja': 'Blockly.Msg.ja',
  'ko': 'Blockly.Msg.ko',
  'ksh': 'Blockly.Msg.de',
  'ms': 'Blockly.Msg.ms',
  'nb': 'Blockly.Msg.nb',
  'nl': 'Blockly.Msg.nl',
  'pl': 'Blockly.Msg.pl',
  'pms': 'Blockly.Msg.pms',
  'pt-br': 'Blockly.Msg.pt.br',
  'pt': 'Blockly.Msg.pt',
  'ro': 'Blockly.Msg.ro',
  'ru': 'Blockly.Msg.ru',
  'sq': 'Blockly.Msg.sq',
  'sr': 'Blockly.Msg.sr',
  'sv': 'Blockly.Msg.sv',
  'th': 'Blockly.Msg.th',
  'tl': 'Blockly.Msg.tl',
  'tlh': 'Blockly.Msg.tlh',
  'tr': 'Blockly.Msg.tr',
  'uk': 'Blockly.Msg.uk',
  'vi': 'Blockly.Msg.vi',
  'zh-hans': 'Blockly.Msg.zh.hans',
  'zh-hant': 'Blockly.Msg.zh.hant'
}

WARNING = '// Automatically generated file.  Do not edit!\n'


def main(name, lang):
  if CORE_LANGUAGE_MAP.has_key(lang):
    core_language = CORE_LANGUAGE_MAP.get(lang)
  else:
    core_language = CORE_LANGUAGE_MAP.get('en')
  f = open('appengine/%s/generated/%s/msg.js' % (name, lang), 'w')
  f.write(WARNING)
  f.write("goog.provide('BlocklyGames.Msg');\n")
  f.write("goog.require('%s');\n" % core_language)
  f.close()
  write_uncompressed(name, lang)
  write_compressed(name, lang)


def write_uncompressed(name, lang):
  print('\n%s - %s - uncompressed:' % (name.title(), lang))
  cmd = ['closure-library-bin-read-only/build/closurebuilder.py',
      '--root=appengine/js-read-only/',
      '--root=appengine/generated/%s/' % lang,
      '--root=appengine/js/',
      '--namespace=%s' % name.replace('/', '.').title(),
      '--output_mode=list']
  directory = name
  while(directory):
    cmd.append('--root=appengine/%s/generated/%s/' % (directory, lang))
    cmd.append('--root=appengine/%s/js/' % directory)
    (directory, sep, fragment) = directory.rpartition(os.path.sep)
  proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
  files = proc.stdout.readlines()

  prefix = 'appengine/'
  srcs = []
  for file in files:
    file = file.strip()
    if file[:len(prefix)] == prefix:
      file = file[len(prefix):]
    else:
      raise(Exception('"%s" is not in "%s".' % (file, prefix)))
    srcs.append('"%s"' % file)
  f = open('appengine/%s/generated/%s/uncompressed.js' % (name, lang), 'w')
  f.write("""%s
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


def trim_licence(code):
  """Trim down Google's Apache licences.

  JS Compiler preseves dozens of Apache licences in the Blockly code.  Trim
  these down to one-liners if they belong to Google.

  Args:
    code: Large blob of compiled source code.

  Returns:
    Code with Google's Apache licences trimmed down.
  """
  apache2 = re.compile("""/\\*

 [\\w ]+

 (Copyright \\d+ Google Inc.)
 https://blockly.googlecode.com/

 Licensed under the Apache License, Version 2.0 \\(the "License"\\);
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
\\*/""")
  return re.sub(apache2, r"\n// \1  Apache License 2.0", code)


def write_compressed(name, lang):
  print('\n%s - %s - compressed:' % (name.title(), lang))
  cmd = ['closure-library-bin-read-only/build/closurebuilder.py',
      '--root=appengine/js-read-only/',
      '--root=appengine/generated/%s/' % lang,
      '--root=appengine/js/',
      '--namespace=%s' % name.replace('/', '.').title(),
      '--compiler_jar=closure-compiler-read-only/build/compiler.jar',
      '--compiler_flags=--compilation_level=ADVANCED_OPTIMIZATIONS',
      '--compiler_flags=--externs=svg-externs.js',
      '--compiler_flags=--externs=interpreter-externs.js',
      '--compiler_flags=--language_in=ECMASCRIPT5_STRICT',
      '--output_mode=compiled']
  directory = name
  while(directory):
    cmd.append('--root=appengine/%s/generated/%s/' % (directory, lang))
    cmd.append('--root=appengine/%s/js/' % directory)
    (directory, sep, fragment) = directory.rpartition(os.path.sep)
  proc = subprocess.Popen(cmd, stdout=subprocess.PIPE)
  script = proc.stdout.readlines()
  script = ''.join(script)
  script = trim_licence(script)

  f = open('appengine/%s/generated/%s/compressed.js' % (name, lang), 'w')
  f.write(WARNING)
  f.write(script)
  f.close()


if __name__ == '__main__':
  if len(sys.argv) != 3:
    print('Format: %s <appname> <language>' % sys.argv[0])
    sys.exit(2)
  main(sys.argv[1], sys.argv[2])
