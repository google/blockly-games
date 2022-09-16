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
  parser.add_argument('--blockly_msg_dir',
                      default=os.path.join('appengine', 'third-party', 'blockly', 'msg', 'json'),
                      help='Relative directory for Blockly\'s message .json files.')
  parser.add_argument('--blocklygames_msg_dir',
                      default='json',
                      help='Relative directory for Blockly Games\' message .json files.')
  parser.add_argument('--output_dir',
                      default=os.path.join('appengine', 'generated', 'msg'),
                      help='Relative directory for output .js files.')
  args = parser.parse_args()
  if not args.blockly_msg_dir.endswith(os.path.sep):
    args.blockly_msg_dir += os.path.sep
  if not args.blocklygames_msg_dir.endswith(os.path.sep):
    args.blocklygames_msg_dir += os.path.sep
  if not args.output_dir.endswith(os.path.sep):
    args.output_dir += os.path.sep
  os.makedirs(args.output_dir, exist_ok=True)

  blockly_constants_data = read_json_file(args.blockly_msg_dir, 'constants')
  blockly_synonyms_data = read_json_file(args.blockly_msg_dir, 'synonyms')
  blockly_default_data = read_json_file(args.blockly_msg_dir, args.default_lang)
  bg_default_data = read_json_file(args.blocklygames_msg_dir, args.default_lang)

  language_files = glob.glob(os.path.join(args.blocklygames_msg_dir, '*.json'))
  language_files.sort()
  languages = []
  for language_file in language_files:
    language = re.search(r'([\w-]+)\.json$', language_file)[1]
    if language == 'qqq':
      continue
    if not os.path.isfile(os.path.join(args.blockly_msg_dir, language + '.json')):
      # Need both the Blockly Games and Blockly message files.
      continue
    languages.append(language)

    output_file = codecs.open(os.path.join(args.output_dir, language + '.js'), 'w', 'utf-8')
    output_file.write('''// This file was automatically generated.  Do not modify.

'use strict';
var BlocklyMsg = {};
var BlocklyGamesMsg = {};

''')

    # Write the Blockly messages.
    blockly_language_data = read_json_file(args.blockly_msg_dir, language)
    blockly_msg_dict = {}
    for (name, default_message) in blockly_default_data.items():
      if name in blockly_language_data:
        message_str = blockly_language_data[name]
        comment = ''
      else:
        message_str = default_message
        comment = '  // untranslated'
      message_str = scrub_message(message_str)
      blockly_msg_dict[name] = message_str
      output_file.write('BlocklyMsg["%s"] = "%s";%s\n' % (name, message_str, comment))
    output_file.write('\n')
    for (name, alias_name) in blockly_synonyms_data.items():
      blockly_msg_dict[name] = blockly_msg_dict[alias_name]
      output_file.write('BlocklyMsg["%s"] = "%s";\n' % (name, blockly_msg_dict[alias_name]))
    output_file.write('\n')
    for (name, message_str) in blockly_constants_data.items():
      message_str = scrub_message(message_str)
      blockly_msg_dict[name] = message_str
      output_file.write('BlocklyMsg["%s"] = "%s";\n' % (name, message_str))

    output_file.write('\n')

    # Write the Blockly Games messages.
    bg_language_data = read_json_file(args.blocklygames_msg_dir, language)
    for (name, default_message) in bg_default_data.items():
      if name in bg_language_data:
        message_str = bg_language_data[name]
        comment = ''
      else:
        message_str = default_message
        comment = '  // untranslated'
      message_str = scrub_message(message_str)
      output_file.write('BlocklyGamesMsg["%s"] = "%s";%s\n' % (name, message_str, comment))

    output_file.close()

  print('Generated message js files for: ' + str(languages))


def scrub_message(msg):
  msg = msg.strip()
  msg = msg.replace('\\', '\\\\')
  msg = msg.replace('\n', '\\n')
  msg = msg.replace('"', '\\"')
  return msg


def read_json_file(dir, isoCode):
  json_file = codecs.open(os.path.join(dir, isoCode + '.json'), 'r', 'utf-8')
  data = json.load(json_file)
  json_file.close()
  if '@metadata' in data:
    del data['@metadata']
  return data


if __name__ == '__main__':
  main()