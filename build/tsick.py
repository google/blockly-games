#!/usr/bin/python
# Lightweight conversion from tsc to Closure Compiler.
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

import os
import re
import sys


if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")

PATH = 'appengine/third-party/blockly/'

fileCount = 0

def main():
  global fileCount
  for root, dirs, files in os.walk(PATH):
    for file in files:
      if file.endswith('.js'):
        rewriteFile(root + os.sep + file)
  print('Converted %d JavaScript file(s).' % fileCount)

def rewriteFile(path):
  global fileCount
  f = open(path, 'r')
  oldCode = f.read()
  f.close()
  newCode = rewriteEnum(oldCode)
  if newCode != oldCode:
    fileCount += 1
    #print('Rewrote: ' + path)
    f = open(path, 'w')
    f.write(newCode)
    f.close()

def rewriteEnum(code):
  ENUM_REGEX = re.compile(r'\s+\(function \((\w+)\) \{\n[^\}]*\}\)\(\1 [^)]+\1 = \{\}\)\);', re.MULTILINE)
  while True:
    # Extract the entire enum structure.
    m = re.search(ENUM_REGEX, code)
    if not m:
      break
    # m.group() looks like a bunch of lines in one of these two formats:
    #   ScopeType["BLOCK"] = "block";
    #   KeyCodes[KeyCodes["TAB"] = 9] = "TAB";
    # We need to unquote them to look like one of these two formats:
    #   ScopeType.BLOCK = "block";
    #   KeyCodes[KeyCodes.TAB = 9] = "TAB";
    oldSnippet = m.group()
    newSnippet = re.sub(r'\["(\w+)"\]', r'.\1', oldSnippet)
    # Add a comment so we don't keep trying to modify this enum.
    newSnippet = newSnippet.replace(') {', ') {  // Converted by tsick.')
    code = code.replace(oldSnippet, newSnippet)
  return code

if __name__ == '__main__':
  main()