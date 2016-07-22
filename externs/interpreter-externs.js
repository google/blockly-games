/**
 * @fileoverview Externs for JS-Interpreter.
 * @externs
 */

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
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
 * @type {!Object}
 */
Interpreter.prototype.value;

/**
 * Add more code to the interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 */
Interpreter.prototype.appendCode = function(code) {};

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
 * Return the primitive value.
 * @return {number|string|boolean|null|undefined} Primitive value.
 */
Interpreter.Primitive.prototype.valueOf = function() {};

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
 * Create a new function.
 * @param {Object} node AST node defining the function.
 * @param {Object} opt_scope Optional parent scope.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createFunction = function(node, opt_scope) {};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @return {!Object} New function.
 */
Interpreter.prototype.createNativeFunction = function(nativeFunc) {};

/**
 * Create a new native asynchronous function.
 * @param {!Function} asyncFunc JavaScript function.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createAsyncFunction = function(asyncFunc) {};

/**
 * Converts from a native JS object or value to a JS interpreter object.
 * Can handle JSON-style values.
 * @param {*} nativeObj The native JS object to be converted.
 * @return {!Interpreter.Object|!Interpreter.Primitive} The equivalent
 *     JS interpreter object.
 */
Interpreter.prototype.nativeToPseudo = function(nativeObj) {};

/**
 * Converts from a JS interpreter object to native JS object.
 * Can handle JSON-style values.
 * @param {!Interpreter.Object} pseudoObj The JS interpreter object to be
 *     converted.
 * @return {*} The equivalent native JS object or value.
 */
Interpreter.prototype.pseudoToNative = function(pseudoObj) {};

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
