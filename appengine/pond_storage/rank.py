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
  # 1. Find the entry with the highest instability not in a match request.
  unstable_leaderboard_entry = None
  unstable_entries_query = (
      LeaderboardEntry.query().order(-LeaderboardEntry.instability))
  for entry in unstable_entries_query:
    if not entry.has_duck:
      try_move_down_dummy_entry(entry)
      continue
    # Check if it exists in a current match request.
    if not MatchRequest.contains_entry(entry.key):
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
    if not entry.has_duck:
      try_move_down_dummy_entry(entry)
      continue
    if (entry != unstable_leaderboard_entry and
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
  logging.info('Created match request. matchKey: %s', match_key)
  # 5. Return match request information.
  return {'duck_list': duck_list, 'match_key': match_key.urlsafe()}

def try_move_down_dummy_entry(dummy_entry):
  """Tries to move dummy entry down and/or deletes it if it is at bottom."""
  @ndb.transactional(xg=True)
  def swap_with_lower(lower_entry_key):
    lower_entry = lower_entry_key.get()
    # First confirm that lower entry rank is still farther down in leaderboard.
    if not lower_entry or lower_entry.ranking < dummy_entry.key.get().ranking:
      return False
    return swap_order([lower_entry_key, dummy_entry.key])

  leaderboard = dummy_entry.leaderboard_key.get()
  if leaderboard.delete_if_last_entry(dummy_entry.key):
    return
  # Try to move down.
  lower_entry_keys = (
      leaderboard.get_entries_query().filter(
          LeaderboardEntry.ranking > dummy_entry.key.get().ranking,
          LeaderboardEntry.has_duck == True  # Ignore other dummy entries
      )
        .fetch(5, keys_only=True))
  for lower_entry_key in lower_entry_keys:
    if swap_with_lower(lower_entry_key):
      break

def cleanup_expired_matches():
  """Deletes expired pending match requests in datastore."""
  now = datetime.datetime.now()
  expired_requests_keys = MatchRequest.query(
      MatchRequest.expiry_time < now).fetch(keys_only=True)
  for request_key in expired_requests_keys:
    request_key.delete()
    logging.info('Cleaned up expired match with key :%s', request_key.urlsafe())

def validate_match_result(match_key, entry_keys_urlsafe):
  """Returns whether the given match result combination is valid."""
  if match_key.kind() != 'MatchRequest':
    logging.error('Provided matchKey: %s of unexpected kind: %s',
                  match_key, match_key.kind())
    return False
  match_request = match_key.get()
  if not match_request:
    logging.error('Provided matchKey: %s not found', match_key)
    return False
  request_keys_urlsafe = {key.urlsafe() for key in match_request.entry_keys}
  return request_keys_urlsafe == set(entry_keys_urlsafe)

@ndb.transactional(xg=True)
def swap_order(entry_keys):
  """Swaps rankings of provided entries based on provided order.

  Args:
    entry_keys: A list of ndb.Key objects for entries to swap.

  Returns:
    True on success, False if any entries are not found.
  """
  leaderboard_entries = []
  rankings = []
  # Extract the ranking information.
  for key in entry_keys:
    entry = key.get()
    if entry:
      leaderboard_entries.append(entry)
      rankings.append(entry.ranking)
    else:
      logging.error('Entry not found. entryKey: %s', key)
      return False
  # Apply new duck rankings.
  rankings.sort()
  for i, entry in enumerate(leaderboard_entries):
    entry.update_ranking(rankings[i])
  return True

def process_match_result(match_key_urlsafe, entry_keys_urlsafe):
  """Validates and applies the given match results, returns True on success.

  Args:
    match_key_urlsafe: A urlsafe string representation of MatchRequest key.
    entry_keys_urlsafe: A list of urlsafe string representations of
        LeaderboardEntry keys.

  Returns:
    True on success, False otherwise.
  """
  match_key = ndb.Key(urlsafe=match_key_urlsafe)
  entry_keys = [ndb.Key(urlsafe=url) for url in entry_keys_urlsafe]

  if validate_match_result(match_key, entry_keys_urlsafe):
    match_key.delete()
    logging.info('Deleted match request. matchKey: %s', match_key)
    if swap_order(entry_keys):
      logging.info('Applied match results. matchKey: %s', match_key)
      return True
    else:
      logging.error(
          'Processed match results, not applied. matchKey: %s entryKeys:%s',
          match_key, entry_keys)
  else:
    logging.error(
        'No match request found for given result. matchKey: %s entryKeys:%s',
        match_key, entry_keys)
  return False

forms = cgi.FieldStorage()
if forms.has_key('matchKey') and forms.has_key('entryKeys'):
  match_key_urlsafe = forms['matchKey'].value
  entry_keys_urlsafe = forms['entryKeys'].value.split(',')
  if process_match_result(match_key_urlsafe, entry_keys_urlsafe):
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
