/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for games that handle JavaScript.
 * @author fraser@google.com (Neil Fraser)
 */
import * as BlocklyDialogs from './lib-dialogs.js';
import * as BlocklyGames from './lib-games.js';
import * as BlocklyInterface from './lib-interface.js';

import type {Generator} from '../third-party/blockly/core/generator.js';
import {javascriptGenerator} from '../third-party/blockly/generators/javascript.js';
// Convince TypeScript that Blockly's JS generator is not an ES6 Generator.
const JavaScript = javascriptGenerator as any as Generator;


/**
 * User's JavaScript code from previous execution.
 * @type string
 */
export let executedJsCode: string = '';

/**
 * Setter for `executedJsCode`.
 * @param {string} newCode New code string.
 */
export function setExecutedJsCode(newCode: string) {
  executedJsCode = newCode;
}

/**
 * Get the user's executable code as JS from the editor (Blockly or ACE).
 * @returns {string} JS code.
 */
export function getJsCode(): string {
  if (BlocklyInterface.blocksDisabled) {
    // Text editor.
    return BlocklyInterface.editor['getValue']();
  }
  // Blockly editor.
  return JavaScript.workspaceToCode(BlocklyInterface.workspace);
}

/**
 * Highlight the block (or clear highlighting).
 * @param {?string} id ID of block that triggered this action.
 * @param {boolean=} opt_state If undefined, highlight specified block and
 * automatically unhighlight all others.  If true or false, manually
 * highlight/unhighlight the specified block.
 */
export function highlight(id: string | null, opt_state?: boolean) {
  if (id) {
    const m = id.match(/^block_id_([^']+)$/);
    if (m) {
      id = m[1];
    }
  }
  BlocklyInterface.workspace.highlightBlock(id, opt_state);
}

/**
 * Convert the user's code to raw JavaScript.
 * @param {string} code Generated code.
 * @returns {string} The code without serial numbers.
 */
export function stripCode(code: string): string {
  // Strip out serial numbers.
  code = code.replace(/(,\s*)?'block_id_[^']+'\)/g, ')');
  return code.replace(/\s+$/, '');
}

/**
 * Load the JavaScript interpreter.
 * Defer loading until page is loaded and responsive.
 */
export function importInterpreter() {
  function load() {
    //<script type="text/javascript"
    //  src="third-party/JS-Interpreter/compressed.js"></script>
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'third-party/JS-Interpreter/compressed.js';
    document.head.appendChild(script);
  }
  setTimeout(load, 1);
}

/**
 * Load the Prettify CSS and JavaScript.
 * Defer loading until page is loaded and responsive.
 */
export function importPrettify() {
  function load() {
    //<link rel="stylesheet" type="text/css" href="common/prettify.css">
    //<script type="text/javascript" src="common/prettify.js"></script>
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'common/prettify.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'common/prettify.js';
    document.head.appendChild(script);
  }
  setTimeout(load, 1);
}

/**
 * Congratulates the user for completing the level and offers to
 * direct them to the next level, if available.
 */
export function congratulations() {
  const content = BlocklyGames.getElementById('dialogDone');
  const style = {
    width: '40%',
    left: '30%',
    top: '3em',
  };

  // Add the user's code.
  if (BlocklyInterface.workspace) {
    const linesText = BlocklyGames.getElementById('dialogLinesText');
    linesText.textContent = '';
    let code = executedJsCode;
    code = stripCode(code);
    let noComments = code.replace(/\/\/[^\n]*/g, '');  // Inline comments.
    noComments = noComments.replace(/\/\*.*\*\//g, '');  /* Block comments. */
    noComments = noComments.replace(/[ \t]+\n/g, '\n');  // Trailing spaces.
    noComments = noComments.replace(/\n+/g, '\n');  // Blank lines.
    noComments = noComments.trim();
    const lineCount = noComments.split('\n').length;
    const pre = BlocklyGames.getElementById('containerCode');
    pre.textContent = code;
    if (typeof window['prettyPrintOne'] === 'function') {
      code = pre.innerHTML;
      code = window['prettyPrintOne'](code, 'js');
      pre.innerHTML = code;
    }
    let locMsg;
    if (lineCount === 1) {
      locMsg = BlocklyGames.getMsg('Games.linesOfCode1', false);
    } else {
      locMsg = BlocklyGames.getMsg('Games.linesOfCode2', false)
          .replace('%1', String(lineCount));
    }
    linesText.appendChild(document.createTextNode(locMsg));
  }

  let levelMsg: string;
  if (BlocklyGames.LEVEL < BlocklyGames.MAX_LEVEL) {
    levelMsg = BlocklyGames.getMsg('Games.nextLevel', false)
        .replace('%1', String(BlocklyGames.LEVEL + 1));
  } else {
    levelMsg = BlocklyGames.getMsg('Games.finalLevel', false);
  }

  const ok = BlocklyGames.getElementById('doneOk');
  ok.addEventListener('click', BlocklyInterface.nextLevel, true);
  ok.addEventListener('touchend', BlocklyInterface.nextLevel, true);

  BlocklyDialogs.showDialog(content, null, false, true, style,
      function() {
        document.body.removeEventListener('keydown',
            congratulationsKeyDown_, true);
        });
  document.body.addEventListener('keydown',
      congratulationsKeyDown_, true);

  BlocklyGames.getElementById('dialogDoneText').textContent = levelMsg;
}

/**
 * If the user presses enter, escape, or space, hide the dialog.
 * Enter and space move to the next level, escape does not.
 * @param {!KeyboardEvent} e Keyboard event.
 * @private
 */
function congratulationsKeyDown_(e: KeyboardEvent) {
  BlocklyDialogs.dialogKeyDown(e);
  if (e.keyCode === 13 || e.keyCode === 32) {
    BlocklyInterface.nextLevel();
  }
}