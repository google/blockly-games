#!/usr/bin/python3

# Converts message.json file into en.json and qqq.json files for Translatewiki.
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

"""Extracts messages from messages.json file into .json files for translation.

Specifically, lines with the following formats are extracted:

  "Games.name": {
    "desc": "The project name.",
    "msg": "Blockly Games"
  },

There are two output files, each of which is proper JSON.  For each key, the
file en.json would get an entry of the form:

    "Games.name": "Blockly Games",

The file qqq.json would get:

    "Games.name": "The project name.",

Commas would of course be omitted for the final entry of each value.
"""

import argparse
import codecs
import json
import os
import re
import sys
from datetime import datetime


if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")

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
                      default='messages.json',
                      help='Input message.json file.')
  args = parser.parse_args()
  if not args.output_dir.endswith(os.path.sep):
    args.output_dir += os.path.sep

  # Read and parse input file.
  data = loadJson(args.input_file)

  # Fetch existing authors from qqq.json.
  old_qqq = loadJson(os.path.join(args.output_dir, 'qqq.json'))
  old_qqq_metadata = old_qqq['@metadata']

  # Fetch existing timestamp from <language_file>.json.
  old_lang = loadJson(os.path.join(args.output_dir, args.lang + '.json'))
  old_lang_metadata = old_lang['@metadata']

  # Split the input data into two separate data structures.
  qqq = {
    '@metadata': old_qqq_metadata
  }
  lang = {
    '@metadata': old_lang_metadata
  }
  for (key, datum) in data.items():
    qqq[key] = datum['desc']
    lang[key] = datum['msg']

  # Create qqq.json.
  if (json.dumps(old_qqq) != json.dumps(qqq)):
    saveJson(args.output_dir, 'qqq', qqq)

  # Create <lang_file>.json.
  if (json.dumps(old_lang) != json.dumps(lang)):
    lang['@metadata']['lastupdated'] = str(datetime.now())
    saveJson(args.output_dir, args.lang, lang)


def loadJson(filename):
  json_file = codecs.open(filename, 'r', 'utf-8')
  data = json.load(json_file)
  json_file.close()
  return data


def saveJson(output_dir, lang_name, json_data):
  data = json.dumps(json_data, indent=4, ensure_ascii=False)
  data = re.sub('    ', '\t', data)
  filename = os.path.join(output_dir, lang_name + '.json')
  file = codecs.open(filename, 'w', 'utf-8')
  print('Created file: ' + filename)
  file.write(data + '\n')
  file.close()


if __name__ == '__main__':
  main()