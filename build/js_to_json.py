#!/usr/bin/python3

# Converts message.js file into en.json and qqq.json files for Translatewiki.
#
# Copyright 2022 Google LLC
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

"""Extracts messages from messages.js file into .json files for translation.

Specifically, lines with the following formats are extracted:

    /// Here is a description of the following message.
    BlocklyGames.Msg['SOME_GAME.SOME_KEY'] = 'Some value';

Adjacent "///" lines are concatenated.

There are two output files, each of which is proper JSON.  For each key, the
file en.json would get an entry of the form:

    "SOME_GAME.SOME_KEY": "Some value",

The file qqq.json would get:

    "SOME_GAME.SOME_KEY", "Here is a description of the following message.",

Commas would of course be omitted for the final entry of each value.
"""

import argparse
import codecs
import os
import re
from datetime import datetime


_INPUT_DEF_PATTERN = re.compile("""BlocklyGames\.Msg\['([\w.]+)'\]\s*=\s*'(.*)';?\r?$""")

def main():
  # Set up argument parser.
  parser = argparse.ArgumentParser(description='Create translation files.')
  parser.add_argument('--lang',
                      default='en',
                      help='ISO 639-1 source language code.')
  parser.add_argument('--output_dir',
                      default='json/',
                      help='Relative directory for output files.')
  parser.add_argument('--input_file',
                      default='appengine/src/messages.js',
                      help='Input message.js file.')
  args = parser.parse_args()
  if (not args.output_dir.endswith(os.path.sep)):
    args.output_dir += os.path.sep

  # Read and parse input file.
  results = []
  description = ''
  infile = codecs.open(args.input_file, 'r', 'utf-8')
  for line in infile:
    if line.startswith('///'):
      if description:
        description += ' ' + line[3:].strip()
      else:
        description = line[3:].strip()
    else:
      match = _INPUT_DEF_PATTERN.match(line)
      if match:
        key = match.group(1)
        value = match.group(2).replace("\\'", "'")
        if not description:
          print('Warning: No description for ' + result['meaning'])
        result = {}
        result['meaning'] = key
        result['source'] = value
        result['description'] = description
        results.append(result)
        description = ''
  infile.close()

  # Create <lang_file>.json and qqq.json.
  lang_file_name = os.path.join(os.curdir, args.output_dir, args.lang + '.json')
  lang_file = codecs.open(lang_file_name, 'w', 'utf-8')
  print('Created file: ' + lang_file_name)
  # string.format doesn't like printing braces, so break up our writes.
  lang_file.write('{\n\t"@metadata": {')
  lang_file.write("""
\t\t"lastupdated": "{0}",
\t\t"locale": "{1}",
\t\t"messagedocumentation" : "qqq"
""".format(str(datetime.now()), args.lang))
  lang_file.write('\t},\n')

  qqq_file_name = os.path.join(os.curdir, args.output_dir, 'qqq.json')
  qqq_file = codecs.open(qqq_file_name, 'w', 'utf-8')
  print('Created file: ' + qqq_file_name)
  qqq_file.write('{\n')

  first_entry = True
  for unit in results:
      if not first_entry:
          lang_file.write(',\n')
          qqq_file.write(',\n')
      lang_file.write(u'\t"{0}": "{1}"'.format(
          unit['meaning'],
          unit['source'].replace('"', "'")))
      qqq_file.write(u'\t"{0}": "{1}"'.format(
          unit['meaning'],
          unit['description'].replace('"', "'")))
      first_entry = False

  lang_file.write('\n}\n')
  lang_file.close()

  qqq_file.write('\n}\n')
  qqq_file.close()

if __name__ == '__main__':
  main()