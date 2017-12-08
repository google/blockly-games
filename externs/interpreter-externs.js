/**
 * @fileoverview Externs for JS-Interpreter.
 * @externs
 */

/**
 * Create a new interpreter.
 * @param {string|!Object} code Raw JavaScript text or AST.
 * @param {Function=} opt_initFunc Optional initialization function.  Used to
 *     define APIs.  When called it is passed the interpreter object and the
 *     global scope object.
 * @constructor
 */
var Interpreter = function(code, opt_initFunc) {};

/**
 * Typedef for JS values.
 * @typedef {!Interpreter.Object|boolean|number|string|undefined|null}
 */
Interpreter.Value;

/**
 * Class for a state.
 * @param {!Object} node AST node for the state.
 * @param {!Interpreter.Object} scope Scope object for the state.
 * @constructor
 */
Interpreter.State = function(node, scope) {};

/**
 * Class for an object.
 * @param {Interpreter.Object} proto Prototype object or null.
 * @constructor
 */
Interpreter.Object = function(proto) {};

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
Interpreter.prototype.value;

/**
 * @type {!Array.<!Interpreter.State>}
 */
Interpreter.prototype.stateStack;

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
 * Execute the interpreter to program completion.  Vulnerable to infinite loops.
 * @return {boolean} True if a execution is asynchronously blocked,
 *     false if no more instructions.
 */
Interpreter.prototype.run = function() {};

/**
 * Create a new data object based on a constructor's prototype.
 * @param {Interpreter.Object} constructor Parent constructor function,
 *     or null if scope object.
 * @return {!Interpreter.Object} New data object.
 */
Interpreter.prototype.createObject = function(constructor) {};

/**
 * Create a new function.
 * @param {!Object} node AST node defining the function.
 * @param {!Object} scope Parent scope.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createFunction = function(node, scope) {};

/**
 * Create a new native function.
 * @param {!Function} nativeFunc JavaScript function.
 * @param {boolean=} opt_constructor If true, the function's
 * prototype will have its constructor property set to the function.
 * If false, the function cannot be called as a constructor (e.g. escape).
 * Defaults to undefined.
 * @return {!Interpreter.Object} New function.
 */
Interpreter.prototype.createNativeFunction =
    function(nativeFunc, opt_constructor) {};

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
 * @return {Interpreter.Value} The equivalent JS interpreter object.
 */
Interpreter.prototype.nativeToPseudo = function(nativeObj) {};

/**
 * Converts from a JS interpreter object to native JS object.
 * Can handle JSON-style values, plus cycles.
 * @param {Interpreter.Value} pseudoObj The JS interpreter object to be
 * converted.
 * @param {Object=} opt_cycles Cycle detection (used in recursive calls).
 * @return {*} The equivalent native JS object or value.
 */
Interpreter.prototype.pseudoToNative = function(pseudoObj, opt_cycles) {};

/**
 * Fetch a property value from a data object.
 * @param {Interpreter.Value} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @return {Interpreter.Value} Property value (may be undefined).
 */
Interpreter.prototype.getProperty = function(obj, name) {};

/**
 * Set a property value on a data object.
 * @param {!Interpreter.Object} obj Data object.
 * @param {Interpreter.Value} name Name of property.
 * @param {Interpreter.Value|ReferenceError} value New property value.
 *   Use ReferenceError if value is handled by descriptor instead.
 * @param {Object=} opt_descriptor Optional descriptor object.
 * @return {!Interpreter.Object|undefined} Returns a setter function if one
 *     needs to be called, otherwise undefined.
 */
Interpreter.prototype.setProperty = function(obj, name, value, opt_descriptor) {};
