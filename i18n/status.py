#!/usr/bin/python

# Gives the translation status of the specified apps and languages.
#
# Copyright 2013 Google Inc.
# http://blockly.googlecode.com/
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

"""Produce a table showing the translation status of each app by language.

@author Ellen Spertus (ellen.spertus@gmail.com)
"""

import argparse
import json

# Bogus language name representing all messages defined.
TOTAL = 'qqq'

# The parsed command-line arguments will be stored here.
global args

def get_prefix(s):
  """Gets the portion of a string before the first period.

  Args:
      s: A string.

  Returns:
      The portion of the string before the first period, or the entire
      string if it does not contain a period.
  """
  return s.split('.')[0]


def get_prefix_counts(filename):
  """Builds a dictionary mapping key prefixes to their counts.

  Args:
      filename: The name of a JSON file.

  Returns:
      A dictionary mapping each key prefix to its count.
  """
  prefixes = {}
  f = open(filename)
  keys = json.load(f)
  for key in keys:
    prefix = key.split('.')[0]
    prefixes[prefix] = prefixes.get(prefix, 0) + 1
  f.close()
  return prefixes


def output_as_html(prefix_counts):
  """Outputs the given prefix counts and percentages as HTML.

  Specifically, a sortable HTML table is produced, where the app names
  are column headers, and one language is output per row.  Entries
  are color-coded based on the percent completeness.

  Args:
      prefix_counts: A dictionary of dictionaries, where keys to the outer
          dictionary are ISO 639 language names (e.g., 'pt') or the special
          string TOTAL, used to indicate the total number of messages.  Keys
          of the inner dictionaries are prefixes (app names or "apps"), and
          values are their count for the given language.
  """
  def generateNumberAsPercent(num, total):
    percent = num * 100 / total
    if percent == 100:
      color = 'green'
    elif percent >= 90:
      color = 'orange'
    elif percent >= 60:
      color = 'black'
    else:
      color = 'gray'
    return ('<font color=' + color + '>' + str(num) + ' (' + str(percent) +
            '%)</font>')

  apps = prefix_counts[TOTAL].keys()
  print("<SCRIPT LANGUAGE='JavaScript1.2' SRC='https://neil.fraser.name/"
        "software/tablesort/tablesort-min.js'></SCRIPT>")
  print('<table cellspacing=5><thead><tr>')
  print('<th class=nocase>Language</th><th class=num>' +
        '</th><th class=num>'.join(apps) + '</th></tr></thead><tbody>')
  for lang in prefix_counts:
    if lang != TOTAL:
      print('<tr><td>' + lang + '</td>')
      for app in apps:
        print '<td>'
        print generateNumberAsPercent(prefix_counts[lang].get(app, 0),
                                      prefix_counts[TOTAL][app])
        print '</td>'
      print('</tr>')
  print('</tbody><tfoot><tr><td>ALL</td><td>')
  print('</td><td>'.join([str(prefix_counts[TOTAL][app]) for app in apps]))
  print('</td></tr></tfoot></table>')


def output_as_text(prefix_counts):
  """Outputs the given prefix counts and percentages as text.

  Args:
      prefix_counts: A dictionary of dictionaries, where keys to the outer
          dictionary are ISO 639 language names (e.g., 'pt') or the special
          string TOTAL, used to indicate the total number of messages.  Keys
          of the inner dictionaries are prefixes (app names or "apps"), and
          values are their count for the given language.
  """
  def generate_number_as_percent(num, total):
    return ('{0} ({1}%)'.format(num, num * 100 / total))
  MAX_WIDTH = len('999 (100%)') + 1
  FIELD_STRING = '{0: <' + str(MAX_WIDTH) + '}'
  apps = prefix_counts[TOTAL].keys()
  print(FIELD_STRING.format('Language') + ''.join(
      [FIELD_STRING.format(app) for app in apps]))
  print(('-' * (MAX_WIDTH - 1) + ' ') * (len(apps) + 1))
  for lang in prefix_counts:
    if lang != TOTAL:
      print(FIELD_STRING.format(lang) +
            ''.join([FIELD_STRING.format(generate_number_as_percent(
                prefix_counts[lang].get(app, 0),
                prefix_counts[TOTAL][app])) for app in apps]))
  print(FIELD_STRING.format(TOTAL) +
        ''.join(
            [FIELD_STRING.format(prefix_counts[TOTAL][app])
             for app in apps]))


def main():
  """Processes input files and outputs results in specified format.
  """
  # Argument parsing.
  parser = argparse.ArgumentParser(description='Compare JSON files.')
  parser.add_argument('--key_file', default='keys.json',
                      help='file with complete list of keys.')
  parser.add_argument('--output', default='text', choices=['text', 'html'],
                      help='output format')
  parser.add_argument('lang_files', nargs='+',
                      help='names of JSON files to examine')
  args = parser.parse_args()

  # Read in files, building up prefix counts.
  prefix_counts = {}  # A dictionary of dictionaries.
  prefix_counts[TOTAL] = get_prefix_counts(args.key_file)
  for lang_file in args.lang_files:
    prefix = get_prefix(lang_file)
    # Skip non-language files.
    if prefix not in ['qqq', 'keys']:
      prefix_counts[prefix] = get_prefix_counts(lang_file)

  # Output results.
  if args.output == 'text':
    output_as_text(prefix_counts)
  elif args.output == 'html':
    output_as_html(prefix_counts)
  else:
    print('No output?!')


if __name__ == '__main__':
  main()
