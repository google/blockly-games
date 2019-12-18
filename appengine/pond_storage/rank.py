"""Blockly Games: Pond Online

Copyright 2019 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""Returns a ranking match request or processes the given match results."""

import cgi
import datetime
import json
import logging
from google.appengine.ext import ndb
from pond_storage import *

class MatchRequest(ndb.Model):
  """Stores match request information."""
  entry_keys = ndb.KeyProperty(repeated=True, kind=LeaderboardEntry)
  creation_time = ndb.DateTimeProperty(auto_now_add=True)
  expiry_time = ndb.ComputedProperty(
      lambda self: self.creation_time + datetime.timedelta(minutes=10))

  @classmethod
  def contains_entry(cls, entry_key):
    return cls.query(cls.entry_keys == entry_key).count(limit=1)

def create_ranking_match():
  """Creates a new ranking match if a valid match can be created.

  Chooses the leaderboard entry with the highest instability not involved in a
  pending match and finds three more entries relative to it that are also not
  involved in a pending match. If four valid entries can be found, the entry
  keys are stored in a MatchRequest (for verification of result) and the
  information needed to evaluate the matches is returned, otherwise returns
  None.

  Returns:
    A dictionary containing the keys:
        match_key: The urlsafe key for the ranking match created
        duck_list: A list of dictionaries for each entry chosen containing:
            entry_key: The urlsafe key of the chosen LeaderboardEntry
            js: The javascript code for the duck associated with that entry
    Or None if no valid match can be created.
  """
  # TODO handle dummy entries.
  # 1. Find the entry with the highest instability not in a match request.
  unstable_leaderboard_entry = None
  unstable_entries_query = (
      LeaderboardEntry.query().order(-LeaderboardEntry.instability))
  for entry in unstable_entries_query:
    # Check if it exists in a current match request (ignoring dummy entries)
    if not MatchRequest.contains_entry(entry.key) and not entry.is_dummy:
      unstable_leaderboard_entry = entry
      break
  if not unstable_leaderboard_entry:
    logging.info('No ducks available for a match.')
    return None
  # Store chosen entry's information.
  entry_keys = [unstable_leaderboard_entry.key]
  duck_list = [{
      'entry_key': unstable_leaderboard_entry.key.urlsafe(),
      'js': unstable_leaderboard_entry.duck_key.get().code.js
  }]
  # 2. Choose up to 3 opponents based on chosen entry.
  # TODO choose opponents based on chosen entry's instability.
  leaderboard = unstable_leaderboard_entry.leaderboard_key.get()
  leaderboard_query = leaderboard.get_entries_query()
  for entry in leaderboard_query:
    if (entry != unstable_leaderboard_entry and not entry.is_dummy and
        not MatchRequest.contains_entry(entry.key)):
      entry_keys.append(entry.key)
      duck_list.append({
          'entry_key': entry.key.urlsafe(),
          'js': entry.duck_key.get().code.js
      })
      if len(duck_list) == 4:
        break
  # 3. Verify whether enough entries could be found for a match
  if len(duck_list) != 4:
    logging.info('Not enough opponents available for match.')
    return None
  # 4. Store match request in datastore.
  match = MatchRequest(entry_keys=entry_keys)
  match_key = match.put()
  match_key_urlsafe = match_key.urlsafe()
  logging.info('Created match request. matchKey:%s', match_key_urlsafe)
  # 5. Return match request information.
  return {'duck_list': duck_list, 'match_key': match_key_urlsafe}

def cleanup_expired_matches():
  """Deletes expired pending match requests in datastore."""
  now = datetime.datetime.now()
  expired_requests_keys = MatchRequest.query(
      MatchRequest.expiry_time < now).fetch(keys_only=True)
  for request_key in expired_requests_keys:
    request_key.delete()
    logging.info('Cleaned up expired match with key:%s', request_key.urlsafe())

def validate_match_result(match_key, entry_keys_urlsafe):
  """Returns whether the given match result combination is valid."""
  if match_key.kind() != 'MatchRequest':
    logging.error('Provided matchKey:%s of unexpected kind: %s',
                  match_key, match_key.kind())
    return False
  match_request = match_key.get()
  if not match_request:
    logging.error('Provided matchKey:%s not found', match_key)
    return False
  request_keys_urlsafe = {key.urlsafe() for key in match_request.entry_keys}
  return request_keys_urlsafe == set(entry_keys_urlsafe)

@ndb.transactional(xg=True)
def apply_match_result(entry_keys_urlsafe):
  """Applies match result if possible and returns True on success."""
  leaderboard_entries = []
  rankings = []
  # Extract the ranking information.
  for entry_key_urlsafe in entry_keys_urlsafe:
    entry_key = ndb.Key(urlsafe=entry_key_urlsafe)
    entry = entry_key.get()
    if entry:
      leaderboard_entries.append(entry)
      rankings.append(entry.ranking)
    else:
      logging.error('Entry not found. entryKey:%s', entry_key)
      return False
  # Apply new duck rankings.
  rankings.sort()
  for i, entry in enumerate(leaderboard_entries):
    entry.update_ranking(rankings[i])
  return True

def process_match_result(match_key, entry_keys_urlsafe):
  """Validates and applies the given match results, returns True on success."""
  if validate_match_result(match_key, entry_keys_urlsafe):
    match_key.delete()
    logging.info('Deleted match request. matchKey:%s', match_key_urlsafe)
    if apply_match_result(entry_keys_urlsafe):
      logging.info('Applied match results. matchKey:%s', match_key_urlsafe)
      return True
    else:
      logging.error(
          'Processed match results, not applied. matchKey:%s entryKeys:%s',
          match_key_urlsafe, entry_keys_urlsafe)
  else:
    logging.error(
        'No match request found for given result. matchKey:%s entryKeys:%s',
        match_key_urlsafe, entry_keys_urlsafe)
  return False

forms = cgi.FieldStorage()
if forms.has_key('matchKey') and forms.has_key('entryKeys'):
  match_key_urlsafe = forms['matchKey'].value
  match_key = ndb.Key(urlsafe=match_key_urlsafe)
  entry_keys_urlsafe = forms['entryKeys'].value.split(',')
  if process_match_result(match_key, entry_keys_urlsafe):
    print('Status: 204')
  else:
    print('Status: 400')
else:
  # Cleanup expired match requests.
  cleanup_expired_matches()
  # Create a new match request.
  match_request_info = create_ranking_match()
  if match_request_info:
    print('Content-Type: application/json\n')
    print(json.dumps(match_request_info))
  else:
    print('Status: 204')
