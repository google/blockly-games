/**
 * @fileoverview Externs for JS-Interpreter.
 * @externs
 */

/**
 * @param {string} code
 * @param {Function} opt_initFunc
 * @constructor
 */

function Interpreter(code, opt_initFunc) {};

/**
 * @type {!Object}
 */
Interpreter.prototype.OBJECT;

/**
 * @type {!Object}
 */
Interpreter.prototype.ARRAY;

/**
 * @type {!Object}
 */
Interpreter.prototype.FUNCTION;

/**
 * @type {!Object}
 */
Interpreter.prototype.STRING;

/**
 * @type {!Object}
 */
Interpreter.prototype.BOOLEAN;

/**
 * @type {!Object}
 */
Interpreter.prototype.UNDEFINED;

/**
 * Execute one step of the interpreter.
 * @return {boolean} True if a step was executed, false if no more instructions.
 */
Interpreter.prototype.step = function() {};

/**
 * Execute the interpreter to program completion.
 */
Interpreter.prototype.run = function() {};

/**
 * Create a new data object for a primitive.
 * @param {undefined|null|boolean|number|string} data Data to encapsulate.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createPrimitive = function(data) {};

/**
 * Create a new data object.
 * @param {Object} parent Parent constructor function.
 * @return {!Object} New data object.
 */
Interpreter.prototype.createObject = function(parent) {};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc) {};

/**
 * Fetch a property value from a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @return {Object} Property value (may be undefined).
 */
Interpreter.prototype.getProperty = function(obj, name) {};

/**
 * Set a property value on a data object.
 * @param {!Object} obj Data object.
 * @param {*} name Name of property.
 * @param {*} value New property value.
 * @param {boolean} opt_fixed Unchangable property if true.
 */
Interpreter.prototype.setProperty = function(obj, name, value, opt_fixed) {};
