#!/usr/bin/python3

# Converts .json files from Translatewiki into .js files.
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

import argparse
import codecs
import glob
import json
import os
import re
import sys

if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")

def main():
  """Generate .js files defining Blockly Games messages."""

  # Process command-line arguments.
  parser = argparse.ArgumentParser(description='Convert JSON files to JS.')
  parser.add_argument('--default_lang',
                      default='en',
                      help='Missing translations will come from this language.')
  parser.add_argument('--input_dir',
                      default='json',
                      help='Relative directory for input .json files.')
  parser.add_argument('--blockly_msg_dir',
                      default=os.path.join('appengine', 'third-party', 'blockly', 'msg', 'js'),
                      help='Relative directory for Blockly\'s message .js files.')
  parser.add_argument('--output_dir',
                      default=os.path.join('appengine', 'generated', 'msg'),
                      help='Relative directory for output .js files.')
  args = parser.parse_args()
  if not args.input_dir.endswith(os.path.sep):
    args.input_dir += os.path.sep
  if not args.output_dir.endswith(os.path.sep):
    args.output_dir += os.path.sep
  os.makedirs(args.output_dir, exist_ok=True)

  default_data = loadJson(args.input_dir, args.default_lang)

  language_files = glob.glob(os.path.join(args.input_dir, '*.json'))
  language_files.sort()
  languages = []
  for language_file in language_files:
    language = re.search(r'([\w-]+)\.json$', language_file)[1]
    if language == 'qqq':
      continue
    languages.append(language)
    data = loadJson(args.input_dir, language)

    output_file = codecs.open(os.path.join(args.output_dir, language + '.js'), 'w', 'utf-8')

    # Write the Blockly messages.
    blockly_language = language
    if not os.path.isfile(os.path.join(args.blockly_msg_dir, blockly_language + '.js')):
      blockly_language = args.default_lang
    blockly_msg_file = codecs.open(os.path.join(args.blockly_msg_dir, blockly_language + '.js'), 'r', 'utf-8')
    msgs = blockly_msg_file.readlines()
    blockly_msg_dict = {}
    for msg in msgs:
      # Resolve references.
      m = re.search('Blockly\.Msg\["([A-Z0-9_]+)"\] = (".*");\s*', msg)
      if m:
        blockly_msg_dict[m.group(1)] = m.group(2)
        output_file.write('window["BlocklyMsg"]["%s"] = %s;\n' % (m.group(1), m.group(2)))
        continue
      m = re.search('Blockly\.Msg\["([A-Z0-9_]+)"\] = Blockly\.Msg\["([A-Z0-9_]+)"\]', msg)
      if m:
        blockly_msg_dict[m.group(1)] = blockly_msg_dict[m.group(2)]
        output_file.write('window["BlocklyMsg"]["%s"] = %s;\n' % (m.group(1), blockly_msg_dict[m.group(2)]))
        continue
      output_file.write(msg)
      if (msg == "'use strict';\n"):
        output_file.write('window["BlocklyMsg"] = {};\n')
        output_file.write('window["BlocklyGamesMsg"] = {};\n')

    blockly_msg_file.close()
    output_file.write('\n\n')

    # Write the Blockly Games messages.
    for (name, default_message) in default_data.items():
      if name in data:
        message_str = data[name]
        comment = ''
      else:
        message_str = default_data[name]
        comment = '  // untranslated'
      message_str = message_str.strip()
      message_str = message_str.replace('\\', '\\\\')
      message_str = message_str.replace('\n', '\\n')
      message_str = message_str.replace('"', '\\"')
      output_file.write('window["BlocklyGamesMsg"]["%s"] = "%s";%s\n' % (name, message_str, comment))
    output_file.close()

  print('Generated message js files for: ' + str(languages))


def loadJson(input_dir, isoCode):
  json_file = codecs.open(os.path.join(input_dir, isoCode + '.json'), 'r', 'utf-8')
  data = json.load(json_file)
  json_file.close()
  if '@metadata' in data:
    del data['@metadata']
  return data


if __name__ == '__main__':
  main()