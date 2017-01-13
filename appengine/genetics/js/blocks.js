/**
 * Blockly Games: Genetics Blocks
 *
 * Copyright 2016 Google Inc.
 * https://github.com/google/blockly-games
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Genetics application.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Genetics.Blocks');

goog.require('Blockly');
goog.require('Blockly.JavaScript');
goog.require('BlocklyGames');
goog.require('BlocklyGames.JSBlocks');


/**
 * HSV hue for all genetics mouse function blocks.
 */
Genetics.Blocks.GENETICS_MOUSEFUNCTIONS_HUE = 360;
/**
 * HSV hue for all genetics blocks (that are not mouse functions).
 */
Genetics.Blocks.GENETICS_HUE = 20;

// Extensions to Blockly's language and JavaScript generator.

/**
 * Generates the JavaScript from a "mouse function" block (pickFight,
 * proposeMate, acceptMate) given the name and arguments of the function.
 * @param {string} name The name of the mouse function.
 * @param {string} args A comma separated string of the argument variable names.
 * @param {!Blockly.Block} block The block.
 * @return {null}
 * @private
 */
Blockly.JavaScript['genetics_generateMouseFunctionJS_'] = function(name,
    args, block) {
  // Define a procedure with a return value.
  var branch = Blockly.JavaScript.statementToCode(block, 'STACK');
  var returnValue = Blockly.JavaScript.valueToCode(block, 'RETURN',
      Blockly.JavaScript.ORDER_NONE) || '';
  returnValue = '  return ' + returnValue + ';\n';
  var code = 'function ' + name + '(' + args + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.JavaScript.scrub_(block, code);
  Blockly.JavaScript.definitions_[name] = code;
  return null;
};

/**
 * Initializes a "mouse function" block (pickFight, proposeMate, acceptMate)
 * given the name and arguments for the block.
 * @param {string} name The name of the mouse function.
 * @param {string} args A comma separated string of the argument variable names.
 * @param {string} returnType The return type of the mouse function.
 * @this Blockly.Block
 * @private
 */
Blockly.Blocks['genetics_initMouseFunctionBlock_'] =
    function(name, args, returnType) {
  this.jsonInit({
    "message0": "function %1(%2) { %3 %4 return %5 }",
    "args0": [
      name,
      args,
      {
        "type": "input_dummy"
      },
      {
        "type": "input_statement",
        "name": "STACK"
      },
      {
        "type": "input_value",
        "check": returnType,
        "align": "right",
        "name": "RETURN"
      }
    ],
    "inputsInline": true,
    "colour": Genetics.Blocks.GENETICS_MOUSEFUNCTIONS_HUE,
    "tooltip": BlocklyGames.getMsg('Genetics_' + name + 'Tooltip')
  });
};

// TODO Add function flag to mouseFunctions once it has been implemented in
// Blockly so that comment blocks are handled correctly.

/**
 * Block for defining mouse decision on which other mouse to fight.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_pickFight'] = {
  init: goog.partial(Blockly.Blocks['genetics_initMouseFunctionBlock_'],
                     'pickFight', '', 'Mouse')
};

/**
 * Defines the JavaScript generation for pickFight.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_pickFight'] =
    goog.partial(Blockly.JavaScript['genetics_generateMouseFunctionJS_'],
                 'pickFight', '');

/**
 * Block for defining mouse decision on which other mouse to mate with.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_proposeMate'] = {
  init: goog.partial(Blockly.Blocks['genetics_initMouseFunctionBlock_'],
                     'proposeMate', '', 'Mouse')
};

/**
 * Defines the JavaScript generation for proposeMate.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_proposeMate'] =
    goog.partial(Blockly.JavaScript['genetics_generateMouseFunctionJS_'],
                 'proposeMate', '');

/**
 * Block for defining mouse decision on whether to mate with a specific mouse.
 * @type {{init: !Function}}
 */
Blockly.Blocks['genetics_acceptMate'] = {
  init: goog.partial(Blockly.Blocks['genetics_initMouseFunctionBlock_'],
                     'acceptMate', 'suitor', 'Boolean'),
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return ['suitor'];
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Add options to create getters for suitor parameter.
    if (!this.isCollapsed()) {
      var option = {enabled: true};
      var name = 'suitor';
      option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlField = goog.dom.createDom('field', null, name);
      xmlField.setAttribute('name', 'VAR');
      var xmlBlock = goog.dom.createDom('block', null, xmlField);
      xmlBlock.setAttribute('type', 'variables_get');
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  }
};

/**
 * Defines the JavaScript generation for acceptMate.
 * @type {!Function}
 */
Blockly.JavaScript['genetics_acceptMate'] =
    goog.partial(Blockly.JavaScript['genetics_generateMouseFunctionJS_'],
                 'acceptMate', 'suitor');

Blockly.Blocks['genetics_getSelf'] = {
  /**
   * Block for getting the mouse making the decision.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["getSelf", ""],
      "output": "Mouse",
      "colour": Genetics.Blocks.GENETICS_HUE,
      "tooltip": BlocklyGames.getMsg('Genetics_getSelfTooltip')
    });
  }
};

/**
 * Defines the JavaScript generation for getSelf.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getSelf'] = function(block) {
  // Generate JavaScript function that returns the mouse object making the
  // decision.
  return ['getSelf()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['genetics_getMice'] = {
  /**
   * Block for getting all mice in the cage.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2)",
      "args0": ["getMice", ""],
      "output": "Array",
      "colour": Genetics.Blocks.GENETICS_HUE,
      "tooltip": BlocklyGames.getMsg('Genetics_getMiceTooltip')
    });
  }
};

/**
 * Defines the JavaScript generation for getMice.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getMice'] = function(block) {
  // Generate JavaScript for getting mice.
  return ['getMice()', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

/**
 * Block for getting the properties of a mouse.
 */
Blockly.Blocks['genetics_getProperties'] = {
  /**
   * Initialization of the getProperties block.
   * @this Blockly.Block
   */
  init: function() {
    var PROPERTIES =
        [['size', 'SIZE'],
         ['aggressiveness', 'AGGRESSIVENESS'],
         ['startAggressiveness', 'START_AGGRESSIVENESS'],
         ['fertility', 'FERTILITY'],
         ['startFertility', 'START_FERTILITY'],
         ['sex', 'SEX'],
         ['age', 'AGE'],
         ['id', 'ID'],
         ['pickFightOwner', 'PICK_FIGHT'],
         ['proposeMateOwner', 'PROPOSE_MATE'],
         ['acceptMateOwner', 'ACCEPT_MATE']];
    // Assign 'this' to a variable for use in closures below.
    var thisBlock = this;
    this.setColour(Genetics.Blocks.GENETICS_HUE);
    this.appendValueInput('MOUSE')
        .setCheck('Mouse');
    var dropdown = new Blockly.FieldDropdown(PROPERTIES, function(newProp) {
      thisBlock.updateType_(newProp);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'PROPERTY');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('PROPERTY');
      var TOOLTIPS = {
        'SIZE': BlocklyGames.getMsg('Genetics_sizeTooltip'),
        'AGGRESSIVENESS': BlocklyGames.getMsg('Genetics_aggressivenessTooltip'),
        'FERTILITY': BlocklyGames.getMsg('Genetics_fertilityTooltip'),
        'START_FERTILITY':
            BlocklyGames.getMsg('Genetics_startFertilityTooltip'),
        'SEX': BlocklyGames.getMsg('Genetics_sexTooltip'),
        'AGE': BlocklyGames.getMsg('Genetics_ageTooltip'),
        'ID': BlocklyGames.getMsg('Genetics_idTooltip'),
        'PICK_FIGHT': BlocklyGames.getMsg('Genetics_pickFightOwnerTooltip'),
        'PROPOSE_MATE': BlocklyGames.getMsg('Genetics_proposeMateOwnerTooltip'),
        'ACCEPT_MATE': BlocklyGames.getMsg('Genetics_acceptMateOwnerTooltip')
      };
      return TOOLTIPS[mode];
    });
  },
  /**
   * Modify this block to have the correct output type.
   * @param {string} newProp Either a property requesting a function owner that
   * returns a string or a property that returns a number.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newProp) {
    if (newProp == 'SEX') {
      this.outputConnection.setCheck('String');
    } else {
      this.outputConnection.setCheck('Number');
    }
  },
  /**
   * Create XML to represent the output type.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('property', this.getFieldValue('PROPERTY'));
    return container;
  },
  /**
   * Parse XML to restore the output type.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('property'));
  }
};

/**
 * Defines the JavaScript generation for getProperties.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_getProperties'] = function(block) {
  // Generate JavaScript for getting mouse property.
  var mouse = Blockly.JavaScript.valueToCode(block, 'MOUSE',
      Blockly.JavaScript.ORDER_NONE) || 'me()';
  var property = block.getFieldValue('PROPERTY');
  var code = mouse + '.';
  switch (property) {
    case 'SIZE':
      code += 'size';
      break;
    case 'AGGRESSIVENESS':
      code += 'aggressiveness';
      break;
    case 'START_AGGRESSIVENESS':
      code += 'startAggressiveness';
      break;
    case 'FERTILITY':
      code += 'fertility';
      break;
    case 'START_FERTILITY':
      code += 'startFertility';
      break;
    case 'SEX':
      code += 'sex';
      break;
    case 'AGE':
      code += 'age';
      break;
    case 'ID':
      code += 'id';
      break;
    case 'PICK_FIGHT':
      code += 'pickFightOwner';
      break;
    case 'PROPOSE_MATE':
      code += 'proposeMateOwner';
      break;
    case 'ACCEPT_MATE':
      code += 'acceptMateOwner';
      break;
    default:
      throw 'Unknown mouse property: ' + property;
  }
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

/**
 * Block that defines constants for possible sexes of a mouse.
 */
Blockly.Blocks['genetics_sex'] = {
  /**
   * Initializes the sex block.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "Sex.%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            ['Male', 'MALE'],
            ['Female', 'FEMALE']
          ]
        }
      ],
      "output": "String",
      "colour": Genetics.Blocks.GENETICS_HUE
    });
  }
};

/**
 * Defines the JavaScript generation for sex.
 * @param {Blockly.Block} block
 * @return {!Array.<string|number>}
 */
Blockly.JavaScript['genetics_sex'] = function(block) {
  // Generate JavaScript for getting sex enum.
  var type = block.getFieldValue('TYPE');
  var code = mouse + 'Sex.';
  if(type == 'MALE') {
    code += 'Male';
  } else {
    code += 'Female';
  }
  return [code, Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Blocks['genetics_math_randomInt'] = {
  /**
   * Retrieves a random integer value between two numbers inclusive.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1(%2,%3)",
      "args0": [
        "Math.randomInt",
        {
          "type": "input_value",
          "name": "MIN_VALUE",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "MAX_VALUE",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_RANDOM_INT_HELPURL,
      "tooltip": Blockly.Msg.MATH_RANDOM_INT_TOOLTIP
    });
  }
};

Blockly.JavaScript['genetics_math_randomInt'] = function(block) {
  // Retrieves a random integer value between two numbers, inclusive.
  var minValue = Blockly.JavaScript.valueToCode(block, 'MIN_VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var maxValue = Blockly.JavaScript.valueToCode(block, 'MAX_VALUE',
      Blockly.JavaScript.ORDER_COMMA) || '0';
  var code = 'Math.randomInt(' + minValue + ', ' + maxValue + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};
