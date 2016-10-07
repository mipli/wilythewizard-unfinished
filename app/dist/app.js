(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Glyph = require('./Glyph');

var Console = function () {
    function Console(width, height) {
        var foreground = arguments.length <= 2 || arguments[2] === undefined ? 0xffffff : arguments[2];
        var background = arguments.length <= 3 || arguments[3] === undefined ? 0x000000 : arguments[3];

        _classCallCheck(this, Console);

        this._width = width;
        this._height = height;
        this.defaultBackground = 0x00000;
        this.defaultForeground = 0xfffff;
        this._text = Core.Utils.buildMatrix(this.width, this.height, Glyph.CHAR_SPACE);
        this._fore = Core.Utils.buildMatrix(this.width, this.height, this.defaultForeground);
        this._back = Core.Utils.buildMatrix(this.width, this.height, this.defaultBackground);
        this._isDirty = Core.Utils.buildMatrix(this.width, this.height, true);
    }

    _createClass(Console, [{
        key: 'cleanCell',
        value: function cleanCell(x, y) {
            this._isDirty[x][y] = false;
        }
    }, {
        key: 'print',
        value: function print(text, x, y) {
            var color = arguments.length <= 3 || arguments[3] === undefined ? 0xffffff : arguments[3];

            var begin = 0;
            var end = text.length;
            if (x + end > this.width) {
                end = this.width - x;
            }
            if (x < 0) {
                end += x;
                x = 0;
            }
            this.setForeground(color, x, y, end, 1);
            for (var i = begin; i < end; ++i) {
                this.setText(text.charCodeAt(i), x + i, y);
            }
        }
    }, {
        key: 'setText',
        value: function setText(ascii, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            if (typeof ascii === 'string') {
                ascii = ascii.charCodeAt(0);
            }
            this.setMatrix(this._text, ascii, x, y, width, height);
        }
    }, {
        key: 'setForeground',
        value: function setForeground(color, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            this.setMatrix(this._fore, color, x, y, width, height);
        }
    }, {
        key: 'setBackground',
        value: function setBackground(color, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            this.setMatrix(this._back, color, x, y, width, height);
        }
    }, {
        key: 'setMatrix',
        value: function setMatrix(matrix, value, x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if (matrix[i][j] === value) {
                        continue;
                    }
                    matrix[i][j] = value;
                    this._isDirty[i][j] = true;
                }
            }
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        }
    }, {
        key: 'fore',
        get: function get() {
            return this._fore;
        }
    }, {
        key: 'back',
        get: function get() {
            return this._back;
        }
    }, {
        key: 'isDirty',
        get: function get() {
            return this._isDirty;
        }
    }]);

    return Console;
}();

module.exports = Console;

},{"./Glyph":4,"./core":37}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Entities = require('./entities');
var Components = require('./components');
var Events = require('./events');
var Mixins = require('./mixins');
var PixiConsole = require('./PixiConsole');
var InputHandler = require('./InputHandler');
var renderer = void 0;
var frameLoop = void 0;
var frameFunc = function frameFunc(elapsedTime) {
    frameLoop(frameFunc);
    renderer(elapsedTime);
};
var loop = function loop(theRenderer) {
    renderer = theRenderer;
    frameLoop(frameFunc);
};

var Engine = function () {
    function Engine(width, height, canvasId) {
        var _this = this;

        _classCallCheck(this, Engine);

        this.gameTime = 0;
        this.engineTicksPerSecond = 10;
        this.engineTickLength = 100;
        this.elapsedTime = 0;
        this.paused = false;
        this.width = width;
        this.height = height;
        this.canvasId = canvasId;
        this.entities = {};
        this.toDestroy = [];
        this.currentTick = 0;
        this.currentTurn = 0;
        this.engineTicksPerSecond = 10;
        frameLoop = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60, new Date().getTime());
            };
        }();
        this.engineTickLength = 1000 / this.engineTicksPerSecond;
        window.addEventListener('focus', function () {
            _this.paused = false;
        });
        window.addEventListener('blur', function () {
            _this.paused = true;
        });
        this._inputHandler = new InputHandler(this);
    }

    _createClass(Engine, [{
        key: 'start',
        value: function start(scene) {
            var _this2 = this;

            this._currentScene = scene;
            this._currentScene.start();
            var timeKeeper = new Entities.Entity(this, 'timeKeeper');
            this.timeHandlerComponent = new Components.TimeHandlerComponent(this);
            timeKeeper.addComponent(this.timeHandlerComponent);
            this.pixiConsole = new PixiConsole(this.width, this.height, this.canvasId, 0xffffff, 0x000000);
            loop(function (time) {
                if (_this2.paused) {
                    return;
                }
                _this2.elapsedTime = time - _this2.gameTime;
                if (_this2.elapsedTime >= _this2.engineTickLength) {
                    _this2.gameTime = time;
                    _this2.timeHandlerComponent.engineTick(_this2.gameTime);
                    _this2.destroyEntities();
                    scene.render(function (console, x, y) {
                        _this2.pixiConsole.blit(console, x, y);
                    });
                }
                _this2.pixiConsole.render();
            });
        }
    }, {
        key: 'registerEntity',
        value: function registerEntity(entity) {
            this.entities[entity.guid] = entity;
        }
    }, {
        key: 'removeEntity',
        value: function removeEntity(entity) {
            this.toDestroy.push(entity);
        }
    }, {
        key: 'destroyEntities',
        value: function destroyEntities() {
            var _this3 = this;

            this.toDestroy.forEach(function (entity) {
                entity.destroy();
                _this3.emit(new Events.Event('entityDestroyed', { entity: entity }));
                delete _this3.entities[entity.guid];
            });
            this.toDestroy = [];
        }
    }, {
        key: 'getEntity',
        value: function getEntity(guid) {
            return this.entities[guid];
        }
    }, {
        key: 'inputHandler',
        get: function get() {
            return this._inputHandler;
        }
    }, {
        key: 'currentScene',
        get: function get() {
            return this._currentScene;
        }
    }]);

    return Engine;
}();

Core.Utils.applyMixins(Engine, [Mixins.EventHandler]);
module.exports = Engine;

},{"./InputHandler":5,"./PixiConsole":10,"./components":34,"./core":37,"./entities":40,"./events":43,"./mixins":50}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MissingComponentError = function (_Error) {
    _inherits(MissingComponentError, _Error);

    function MissingComponentError(message) {
        _classCallCheck(this, MissingComponentError);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingComponentError).call(this, message));

        _this.message = message;
        return _this;
    }

    return MissingComponentError;
}(Error);

exports.MissingComponentError = MissingComponentError;

var MissingImplementationError = function (_Error2) {
    _inherits(MissingImplementationError, _Error2);

    function MissingImplementationError(message) {
        _classCallCheck(this, MissingImplementationError);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingImplementationError).call(this, message));

        _this2.message = message;
        return _this2;
    }

    return MissingImplementationError;
}(Error);

exports.MissingImplementationError = MissingImplementationError;

var EntityOverlapError = function (_Error3) {
    _inherits(EntityOverlapError, _Error3);

    function EntityOverlapError(message) {
        _classCallCheck(this, EntityOverlapError);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(EntityOverlapError).call(this, message));

        _this3.message = message;
        return _this3;
    }

    return EntityOverlapError;
}(Error);

exports.EntityOverlapError = EntityOverlapError;

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glyph = function () {
    function Glyph() {
        var g = arguments.length <= 0 || arguments[0] === undefined ? Glyph.CHAR_SPACE : arguments[0];
        var f = arguments.length <= 1 || arguments[1] === undefined ? 0xffffff : arguments[1];
        var b = arguments.length <= 2 || arguments[2] === undefined ? 0x000000 : arguments[2];

        _classCallCheck(this, Glyph);

        this._glyph = typeof g === 'string' ? g.charCodeAt(0) : g;
        this._foregroundColor = f;
        this._backgroundColor = b;
    }

    _createClass(Glyph, [{
        key: "glyph",
        get: function get() {
            return this._glyph;
        }
    }, {
        key: "foregroundColor",
        get: function get() {
            return this._foregroundColor;
        }
    }, {
        key: "backgroundColor",
        get: function get() {
            return this._backgroundColor;
        }
    }]);

    return Glyph;
}();

Glyph.CHAR_FULL = 129;
Glyph.CHAR_SPACE = 32;
// single walls
Glyph.CHAR_HLINE = 196;
Glyph.CHAR_VLINE = 179;
Glyph.CHAR_SW = 191;
Glyph.CHAR_SE = 218;
Glyph.CHAR_NW = 217;
Glyph.CHAR_NE = 192;
Glyph.CHAR_TEEW = 180;
Glyph.CHAR_TEEE = 195;
Glyph.CHAR_TEEN = 193;
Glyph.CHAR_TEES = 194;
Glyph.CHAR_CROSS = 197;
// double walls
Glyph.CHAR_DHLINE = 205;
Glyph.CHAR_DVLINE = 186;
Glyph.CHAR_DNE = 187;
Glyph.CHAR_DNW = 201;
Glyph.CHAR_DSE = 188;
Glyph.CHAR_DSW = 200;
Glyph.CHAR_DTEEW = 185;
Glyph.CHAR_DTEEE = 204;
Glyph.CHAR_DTEEN = 202;
Glyph.CHAR_DTEES = 203;
Glyph.CHAR_DCROSS = 206;
// blocks 
Glyph.CHAR_BLOCK1 = 176;
Glyph.CHAR_BLOCK2 = 177;
Glyph.CHAR_BLOCK3 = 178;
// arrows 
Glyph.CHAR_ARROW_N = 24;
Glyph.CHAR_ARROW_S = 25;
Glyph.CHAR_ARROW_E = 26;
Glyph.CHAR_ARROW_W = 27;
// arrows without tail 
Glyph.CHAR_ARROW2_N = 30;
Glyph.CHAR_ARROW2_S = 31;
Glyph.CHAR_ARROW2_E = 16;
Glyph.CHAR_ARROW2_W = 17;
// double arrows 
Glyph.CHAR_DARROW_H = 29;
Glyph.CHAR_DARROW_V = 18;
// GUI stuff 
Glyph.CHAR_CHECKBOX_UNSET = 224;
Glyph.CHAR_CHECKBOX_SET = 225;
Glyph.CHAR_RADIO_UNSET = 9;
Glyph.CHAR_RADIO_SET = 10;
// sub-pixel resolution kit 
Glyph.CHAR_SUBP_NW = 226;
Glyph.CHAR_SUBP_NE = 227;
Glyph.CHAR_SUBP_N = 228;
Glyph.CHAR_SUBP_SE = 229;
Glyph.CHAR_SUBP_DIAG = 230;
Glyph.CHAR_SUBP_E = 231;
Glyph.CHAR_SUBP_SW = 232;
// miscellaneous 
Glyph.CHAR_SMILIE = 1;
Glyph.CHAR_SMILIE_INV = 2;
Glyph.CHAR_HEART = 3;
Glyph.CHAR_DIAMOND = 4;
Glyph.CHAR_CLUB = 5;
Glyph.CHAR_SPADE = 6;
Glyph.CHAR_BULLET = 7;
Glyph.CHAR_BULLET_INV = 8;
Glyph.CHAR_MALE = 11;
Glyph.CHAR_FEMALE = 12;
Glyph.CHAR_NOTE = 13;
Glyph.CHAR_NOTE_DOUBLE = 14;
Glyph.CHAR_LIGHT = 15;
Glyph.CHAR_EXCLAM_DOUBLE = 19;
Glyph.CHAR_PILCROW = 20;
Glyph.CHAR_SECTION = 21;
Glyph.CHAR_POUND = 156;
Glyph.CHAR_MULTIPLICATION = 158;
Glyph.CHAR_FUNCTION = 159;
Glyph.CHAR_RESERVED = 169;
Glyph.CHAR_HALF = 171;
Glyph.CHAR_ONE_QUARTER = 172;
Glyph.CHAR_COPYRIGHT = 184;
Glyph.CHAR_CENT = 189;
Glyph.CHAR_YEN = 190;
Glyph.CHAR_CURRENCY = 207;
Glyph.CHAR_THREE_QUARTERS = 243;
Glyph.CHAR_DIVISION = 246;
Glyph.CHAR_GRADE = 248;
Glyph.CHAR_UMLAUT = 249;
Glyph.CHAR_POW1 = 251;
Glyph.CHAR_POW3 = 252;
Glyph.CHAR_POW2 = 253;
Glyph.CHAR_BULLET_SQUARE = 254;
module.exports = Glyph;

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputHandler = function () {
    function InputHandler(engine) {
        _classCallCheck(this, InputHandler);

        this.engine = engine;
        this.listeners = {};
        this.registerListeners();
    }

    _createClass(InputHandler, [{
        key: "registerListeners",
        value: function registerListeners() {
            window.addEventListener('keydown', this.onKeyDown.bind(this));
        }
    }, {
        key: "onKeyDown",
        value: function onKeyDown(event) {
            if (this.listeners[event.keyCode]) {
                this.listeners[event.keyCode].forEach(function (callback) {
                    callback();
                });
            }
        }
    }, {
        key: "listen",
        value: function listen(keycodes, callback) {
            var _this = this;

            keycodes.forEach(function (keycode) {
                if (!_this.listeners[keycode]) {
                    _this.listeners[keycode] = [];
                }
                _this.listeners[keycode].push(callback);
            });
        }
    }]);

    return InputHandler;
}();

InputHandler.KEY_PERIOD = 190;
InputHandler.KEY_LEFT = 37;
InputHandler.KEY_UP = 38;
InputHandler.KEY_RIGHT = 39;
InputHandler.KEY_DOWN = 40;
InputHandler.KEY_0 = 48;
InputHandler.KEY_1 = 49;
InputHandler.KEY_2 = 50;
InputHandler.KEY_3 = 51;
InputHandler.KEY_4 = 52;
InputHandler.KEY_5 = 53;
InputHandler.KEY_6 = 54;
InputHandler.KEY_7 = 55;
InputHandler.KEY_8 = 56;
InputHandler.KEY_9 = 57;
InputHandler.KEY_A = 65;
InputHandler.KEY_B = 66;
InputHandler.KEY_C = 67;
InputHandler.KEY_D = 68;
InputHandler.KEY_E = 69;
InputHandler.KEY_F = 70;
InputHandler.KEY_G = 71;
InputHandler.KEY_H = 72;
InputHandler.KEY_I = 73;
InputHandler.KEY_J = 74;
InputHandler.KEY_K = 75;
InputHandler.KEY_L = 76;
InputHandler.KEY_M = 77;
InputHandler.KEY_N = 78;
InputHandler.KEY_O = 79;
InputHandler.KEY_P = 80;
InputHandler.KEY_Q = 81;
InputHandler.KEY_R = 82;
InputHandler.KEY_S = 83;
InputHandler.KEY_T = 84;
InputHandler.KEY_U = 85;
InputHandler.KEY_V = 86;
InputHandler.KEY_W = 87;
InputHandler.KEY_X = 88;
InputHandler.KEY_Y = 89;
InputHandler.KEY_Z = 90;
module.exports = InputHandler;

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = require('./events');
var Console = require('./Console');

var LogView = function () {
    function LogView(engine, width, height, player) {
        _classCallCheck(this, LogView);

        this.engine = engine;
        this.width = width;
        this.height = height;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.currentTurn = 1;
        this.messages = [];
        this.maxMessages = this.height - 1;
        this.player = player;
        this.effects = [];
    }

    _createClass(LogView, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('turn', this.onTurn.bind(this)));
            this.engine.listen(new Events.Listener('message', this.onMessage.bind(this)));
        }
    }, {
        key: 'onTurn',
        value: function onTurn(event) {
            this.currentTurn = event.data.currentTurn;
            if (this.messages.length > 0 && this.messages[this.messages.length - 1].turn < this.currentTurn - 10) {
                this.messages.pop();
            }
            if (this.player) {
                this.effects = this.player.gather(new Events.Event('getStatusEffect'));
            }
        }
    }, {
        key: 'onMessage',
        value: function onMessage(event) {
            if (event.data.message) {
                this.messages.unshift({
                    turn: this.currentTurn,
                    message: event.data.message
                });
            }
            if (this.messages.length > this.maxMessages) {
                this.messages.pop();
            }
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            var _this = this;

            this.console.setText(' ', 0, 0, this.console.width, this.console.height);
            this.console.setText(' ', this.width - 10, 0, 10);
            this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
            if (this.effects.length > 0) {
                var str = this.effects.reduce(function (acc, effect, idx) {
                    return acc + effect.name + (idx !== _this.effects.length - 1 ? ', ' : '');
                }, 'Effects: ');
                this.console.print(str, 0, 0, 0xffffff);
            }
            this.console.print;
            if (this.messages.length > 0) {
                this.messages.forEach(function (data, idx) {
                    var color = 0xffffff;
                    if (data.turn < _this.currentTurn - 5) {
                        color = 0x666666;
                    } else if (data.turn < _this.currentTurn - 2) {
                        color = 0xaaaaaa;
                    }
                    _this.console.print(data.message, 0, _this.height - idx, color);
                });
            }
            blitFunction(this.console);
        }
    }]);

    return LogView;
}();

module.exports = LogView;

},{"./Console":1,"./events":43}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Tile = require('./Tile');

var Map = function () {
    function Map(w, h) {
        _classCallCheck(this, Map);

        this._width = w;
        this._height = h;
        this.tiles = [];
        for (var x = 0; x < this._width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < this._height; y++) {
                this.tiles[x][y] = Tile.createTile(Tile.EMPTY);
            }
        }
    }

    _createClass(Map, [{
        key: 'getTile',
        value: function getTile(position) {
            return this.tiles[position.x][position.y];
        }
    }, {
        key: 'setTile',
        value: function setTile(position, tile) {
            this.tiles[position.x][position.y] = tile;
        }
    }, {
        key: 'forEach',
        value: function forEach(callback) {
            for (var y = 0; y < this._height; y++) {
                for (var x = 0; x < this._width; x++) {
                    callback(new Core.Position(x, y), this.tiles[x][y]);
                }
            }
        }
    }, {
        key: 'isWalkable',
        value: function isWalkable(position) {
            return this.tiles[position.x][position.y].walkable;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }]);

    return Map;
}();

module.exports = Map;

},{"./Tile":12,"./core":37}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Generator = require('./map');
var Map = require('./Map');
var Tile = require('./Tile');
var Glyph = require('./Glyph');

var MapGenerator = function () {
    function MapGenerator(width, height) {
        _classCallCheck(this, MapGenerator);

        this.width = width;
        this.height = height;
        this.backgroundColor = 0x000000;
        this.foregroundColor = 0xaaaaaa;
    }

    _createClass(MapGenerator, [{
        key: 'generate',
        value: function generate() {
            var cells = Core.Utils.buildMatrix(this.width, this.height, 1);
            var map = new Map(this.width, this.height);
            var roomGenerator = new Generator.RoomGenerator(cells);
            while (roomGenerator.iterate()) {}
            cells = roomGenerator.getMap();
            var startPosition = Generator.Utils.findCarveableSpot(cells);
            var mazeGenerator = null;
            while (startPosition !== null) {
                mazeGenerator = new Generator.MazeRecursiveBacktrackGenerator(cells, startPosition);
                while (mazeGenerator.iterate()) {}
                cells = mazeGenerator.getMap();
                startPosition = Generator.Utils.findCarveableSpot(cells);
            }
            cells = mazeGenerator.getMap();
            var topologyCombinator = new Generator.TopologyCombinator(cells);
            topologyCombinator.initialize();
            topologyCombinator.combine();
            cells = topologyCombinator.getMap();
            var tile = void 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (cells[x][y] === 0) {
                        tile = Tile.createTile(Tile.FLOOR);
                    } else {
                        tile = Tile.createTile(Tile.WALL);
                        tile.glyph = new Glyph(Glyph.CHAR_BLOCK3, this.foregroundColor, this.backgroundColor);
                    }
                    map.setTile(new Core.Position(x, y), tile);
                }
            }
            return map;
        }
    }, {
        key: 'getWallGlyph',
        value: function getWallGlyph(x, y, cells) {
            var W = x > 0 && cells[x - 1][y] === 1;
            var E = x < this.width - 1 && cells[x + 1][y] === 1;
            var N = y > 0 && cells[x][y - 1] === 1;
            var S = y < this.height - 1 && cells[x][y + 1] === 1;
            var glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
            if (W && E && S && N) {
                glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
            } else if ((W || E) && !S && !N) {
                glyph = new Glyph(Glyph.CHAR_HLINE, this.foregroundColor, this.backgroundColor);
            } else if ((S || N) && !W && !E) {
                glyph = new Glyph(Glyph.CHAR_VLINE, this.foregroundColor, this.backgroundColor);
            } else if (S && E && !W && !N) {
                glyph = new Glyph(Glyph.CHAR_SE, this.foregroundColor, this.backgroundColor);
            } else if (S && W && !E && !N) {
                glyph = new Glyph(Glyph.CHAR_SW, this.foregroundColor, this.backgroundColor);
            } else if (N && E && !W && !S) {
                glyph = new Glyph(Glyph.CHAR_NE, this.foregroundColor, this.backgroundColor);
            } else if (N && W && !E && !S) {
                glyph = new Glyph(Glyph.CHAR_NW, this.foregroundColor, this.backgroundColor);
            } else if (N && W && E && !S) {
                glyph = new Glyph(Glyph.CHAR_TEEN, this.foregroundColor, this.backgroundColor);
            } else if (S && W && E && !N) {
                glyph = new Glyph(Glyph.CHAR_TEES, this.foregroundColor, this.backgroundColor);
            } else if (N && S && E && !W) {
                glyph = new Glyph(Glyph.CHAR_TEEE, this.foregroundColor, this.backgroundColor);
            } else if (N && S && W && !E) {
                glyph = new Glyph(Glyph.CHAR_TEEW, this.foregroundColor, this.backgroundColor);
            }
            return glyph;
        }
    }]);

    return MapGenerator;
}();

module.exports = MapGenerator;

},{"./Glyph":4,"./Map":7,"./Tile":12,"./core":37,"./map":48}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Components = require('./components');
var Events = require('./events');
var Console = require('./Console');

var MapView = function () {
    function MapView(engine, map, width, height) {
        _classCallCheck(this, MapView);

        this.engine = engine;
        this.map = map;
        this.width = width;
        this.height = height;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.renderableEntities = [];
        this.renderableItems = [];
    }

    _createClass(MapView, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('renderableComponentCreated', this.onRenderableComponentCreated.bind(this)));
            this.engine.listen(new Events.Listener('renderableComponentDestroyed', this.onRenderableComponentDestroyed.bind(this)));
        }
    }, {
        key: 'onRenderableComponentDestroyed',
        value: function onRenderableComponentDestroyed(event) {
            var physics = event.data.entity.getComponent(Components.PhysicsComponent);
            var idx = null;
            if (physics.blocking) {
                idx = this.renderableEntities.findIndex(function (entity) {
                    return entity.guid === event.data.entity.guid;
                });
                if (idx !== null) {
                    this.renderableEntities.splice(idx, 1);
                }
            } else {
                idx = this.renderableItems.findIndex(function (entity) {
                    return entity.guid === event.data.entity.guid;
                });
                if (idx !== null) {
                    this.renderableItems.splice(idx, 1);
                }
            }
        }
    }, {
        key: 'onRenderableComponentCreated',
        value: function onRenderableComponentCreated(event) {
            var physics = event.data.entity.getComponent(Components.PhysicsComponent);
            if (physics.blocking) {
                this.renderableEntities.push({
                    guid: event.data.entity.guid,
                    renderable: event.data.renderableComponent,
                    physics: physics
                });
            } else {
                this.renderableItems.push({
                    guid: event.data.entity.guid,
                    renderable: event.data.renderableComponent,
                    physics: physics
                });
            }
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            this.renderMap(this.console);
            blitFunction(this.console);
        }
    }, {
        key: 'renderMap',
        value: function renderMap(console) {
            this.renderBackground(console);
            this.renderItems(console);
            this.renderEntities(console);
        }
    }, {
        key: 'renderEntities',
        value: function renderEntities(console) {
            var _this = this;

            this.renderableEntities.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderItems',
        value: function renderItems(console) {
            var _this2 = this;

            this.renderableItems.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this2.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderGlyph',
        value: function renderGlyph(console, glyph, position) {
            console.setText(glyph.glyph, position.x, position.y);
            console.setForeground(glyph.foregroundColor, position.x, position.y);
        }
    }, {
        key: 'renderBackground',
        value: function renderBackground(console) {
            this.map.forEach(function (position, tile) {
                var glyph = tile.glyph;
                console.setText(glyph.glyph, position.x, position.y);
                console.setForeground(glyph.foregroundColor, position.x, position.y);
                console.setBackground(glyph.backgroundColor, position.x, position.y);
            });
        }
    }]);

    return MapView;
}();

module.exports = MapView;

},{"./Console":1,"./components":34,"./events":43}],10:[function(require,module,exports){
/// <reference path='../typings/index.d.ts' />
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Glyph = require('./Glyph');

var PixiConsole = function () {
    function PixiConsole(width, height, canvasId) {
        var foreground = arguments.length <= 3 || arguments[3] === undefined ? 0xffffff : arguments[3];
        var background = arguments.length <= 4 || arguments[4] === undefined ? 0x000000 : arguments[4];

        _classCallCheck(this, PixiConsole);

        this._width = width;
        this._height = height;
        this.canvasId = canvasId;
        this.loaded = false;
        this.stage = new PIXI.Container();
        this.loadFont();
        this.defaultBackground = 0x00000;
        this.defaultForeground = 0xfffff;
        this.text = Core.Utils.buildMatrix(this.width, this.height, Glyph.CHAR_SPACE);
        this.fore = Core.Utils.buildMatrix(this.width, this.height, this.defaultForeground);
        this.back = Core.Utils.buildMatrix(this.width, this.height, this.defaultBackground);
        this.isDirty = Core.Utils.buildMatrix(this.width, this.height, true);
    }

    _createClass(PixiConsole, [{
        key: 'loadFont',
        value: function loadFont() {
            var fontUrl = './terminal16x16.png';
            this.font = PIXI.BaseTexture.fromImage(fontUrl, false, PIXI.SCALE_MODES.NEAREST);
            if (this.font.hasLoaded) {
                this.onFontLoaded();
            } else {
                this.font.on('loaded', this.onFontLoaded.bind(this));
            }
        }
    }, {
        key: 'onFontLoaded',
        value: function onFontLoaded() {
            this.charWidth = this.font.width / 16;
            this.charHeight = this.font.height / 16;
            this.initCanvas();
            this.initCharacterMap();
            this.initBackgroundCells();
            this.initForegroundCells();
            this.addGridOverlay();
            this.loaded = true;
            //this.animate();
        }
    }, {
        key: 'initCanvas',
        value: function initCanvas() {
            var canvasWidth = this.width * this.charWidth;
            var canvasHeight = this.height * this.charHeight;
            this.canvas = document.getElementById(this.canvasId);
            var pixiOptions = {
                antialias: false,
                clearBeforeRender: false,
                preserveDrawingBuffer: false,
                resolution: 1,
                transparent: false,
                backgroundColor: Core.ColorUtils.toNumber(this.defaultBackground),
                view: this.canvas
            };
            this.renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, pixiOptions);
            this.renderer.backgroundColor = Core.ColorUtils.toNumber(this.defaultBackground);
            this.topLeftPosition = new Core.Position(this.canvas.offsetLeft, this.canvas.offsetTop);
        }
    }, {
        key: 'initCharacterMap',
        value: function initCharacterMap() {
            this.chars = [];
            for (var x = 0; x < 16; x++) {
                for (var y = 0; y < 16; y++) {
                    var rect = new PIXI.Rectangle(x * this.charWidth, y * this.charHeight, this.charWidth, this.charHeight);
                    this.chars[x + y * 16] = new PIXI.Texture(this.font, rect);
                }
            }
        }
    }, {
        key: 'initBackgroundCells',
        value: function initBackgroundCells() {
            this.backCells = [];
            for (var x = 0; x < this.width; x++) {
                this.backCells[x] = [];
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Sprite(this.chars[Glyph.CHAR_FULL]);
                    cell.position.x = x * this.charWidth;
                    cell.position.y = y * this.charHeight;
                    cell.width = this.charWidth;
                    cell.height = this.charHeight;
                    cell.tint = Core.ColorUtils.toNumber(this.defaultBackground);
                    this.backCells[x][y] = cell;
                    this.stage.addChild(cell);
                }
            }
        }
    }, {
        key: 'initForegroundCells',
        value: function initForegroundCells() {
            this.foreCells = [];
            for (var x = 0; x < this.width; x++) {
                this.foreCells[x] = [];
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Sprite(this.chars[Glyph.CHAR_SPACE]);
                    cell.position.x = x * this.charWidth;
                    cell.position.y = y * this.charHeight;
                    cell.width = this.charWidth;
                    cell.height = this.charHeight;
                    cell.tint = Core.ColorUtils.toNumber(this.defaultForeground);
                    this.foreCells[x][y] = cell;
                    this.stage.addChild(cell);
                }
            }
        }
    }, {
        key: 'addGridOverlay',
        value: function addGridOverlay() {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Graphics();
                    cell.lineStyle(1, 0x444444, 0.5);
                    cell.beginFill(0, 0);
                    cell.drawRect(x * this.charWidth, y * this.charHeight, this.charWidth, this.charHeight);
                    this.stage.addChild(cell);
                }
            }
        }
        /*
        private animate() {
          requestAnimationFrame(this.animate.bind(this));
          this.renderer.render(this.stage);
        }
        */

    }, {
        key: 'render',
        value: function render() {
            if (this.loaded) {
                this.renderer.render(this.stage);
            }
        }
    }, {
        key: 'blit',
        value: function blit(console) {
            var offsetX = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var offsetY = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            var forceDirty = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            if (!this.loaded) {
                return false;
            }
            for (var x = 0; x < console.width; x++) {
                for (var y = 0; y < console.height; y++) {
                    if (forceDirty || console.isDirty[x][y]) {
                        var ascii = console.text[x][y];
                        var px = offsetX + x;
                        var py = offsetY + y;
                        if (ascii > 0 && ascii <= 255) {
                            this.foreCells[px][py].texture = this.chars[ascii];
                        }
                        this.foreCells[px][py].tint = Core.ColorUtils.toNumber(console.fore[x][y]);
                        this.backCells[px][py].tint = Core.ColorUtils.toNumber(console.back[x][y]);
                        console.cleanCell(x, y);
                    }
                }
            }
        }
    }, {
        key: 'getPositionFromPixels',
        value: function getPositionFromPixels(x, y) {
            if (!this.loaded) {
                return new Core.Position(-1, -1);
            }
            var dx = x - this.topLeftPosition.x;
            var dy = y - this.topLeftPosition.y;
            var rx = Math.floor(dx / this.charWidth);
            var ry = Math.floor(dy / this.charHeight);
            return new Core.Position(rx, ry);
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }]);

    return PixiConsole;
}();

module.exports = PixiConsole;

},{"./Glyph":4,"./core":37}],11:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Events = require('./events');
var Components = require('./components');
var Entities = require('./entities');
var Exceptions = require('./Exceptions');
var MapGenerator = require('./MapGenerator');
var MapView = require('./MapView');
var LogView = require('./LogView');

var Scene = function () {
    function Scene(engine, width, height) {
        _classCallCheck(this, Scene);

        this._engine = engine;
        this.width = width;
        this.height = height;
    }

    _createClass(Scene, [{
        key: 'start',
        value: function start() {
            Core.Position.setMaxValues(this.width, this.height - 5);
            var mapGenerator = new MapGenerator(this.width, this.height - 5);
            this._map = mapGenerator.generate();
            this.registerListeners();
            this.mapView = new MapView(this.engine, this.map, this.map.width, this.map.height);
            this.generateWily();
            this.logView = new LogView(this.engine, this.width, 5, this.player);
            this.generateRats();
        }
    }, {
        key: 'generateWily',
        value: function generateWily() {
            this.player = Entities.createWily(this.engine);
            this.positionEntity(this.player);
        }
    }, {
        key: 'generateRats',
        value: function generateRats() {
            var num = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];

            for (var i = 0; i < num; i++) {
                this.generateRat();
            }
        }
    }, {
        key: 'generateRat',
        value: function generateRat() {
            this.positionEntity(Entities.createRat(this.engine));
        }
    }, {
        key: 'positionEntity',
        value: function positionEntity(entity) {
            var component = entity.getComponent(Components.PhysicsComponent);
            var positioned = false;
            var tries = 0;
            var position = null;
            while (tries < 1000 && !positioned) {
                position = Core.Position.getRandom();
                positioned = this.isWithoutEntity(position);
            }
            if (positioned) {
                component.moveTo(position);
            }
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('isWithoutEntity', this.onIsWithoutEntity.bind(this)));
            this.engine.listen(new Events.Listener('movedFrom', this.onMovedFrom.bind(this)));
            this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this)));
            this.engine.listen(new Events.Listener('getTile', this.onGetTile.bind(this)));
        }
    }, {
        key: 'onGetTile',
        value: function onGetTile(event) {
            var position = event.data.position;
            return this.map.getTile(position);
        }
    }, {
        key: 'onMovedFrom',
        value: function onMovedFrom(event) {
            var tile = this.map.getTile(event.data.physicsComponent.position);
            if (!event.data.physicsComponent.blocking) {
                delete tile.props[event.data.entity.guid];
            } else {
                tile.entity = null;
            }
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            var tile = this.map.getTile(event.data.physicsComponent.position);
            if (!event.data.physicsComponent.blocking) {
                tile.props[event.data.entity.guid] = event.data.entity;
            } else {
                if (tile.entity) {
                    throw new Exceptions.EntityOverlapError('Two entities cannot be at the same spot');
                }
                tile.entity = event.data.entity;
            }
        }
    }, {
        key: 'onIsWithoutEntity',
        value: function onIsWithoutEntity(event) {
            var position = event.data.position;
            return this.isWithoutEntity(position);
        }
    }, {
        key: 'isWithoutEntity',
        value: function isWithoutEntity(position) {
            var tile = this.map.getTile(position);
            return tile.walkable && tile.entity === null;
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            var _this = this;

            this.mapView.render(function (console) {
                blitFunction(console, 0, 0);
            });
            this.logView.render(function (console) {
                blitFunction(console, 0, _this.height - 5);
            });
        }
    }, {
        key: 'engine',
        get: function get() {
            return this._engine;
        }
    }, {
        key: 'map',
        get: function get() {
            return this._map;
        }
    }]);

    return Scene;
}();

module.exports = Scene;

},{"./Exceptions":3,"./LogView":6,"./MapGenerator":8,"./MapView":9,"./components":34,"./core":37,"./entities":40,"./events":43}],12:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glyph = require('./Glyph');

var Tile = function () {
    function Tile(glyph, walkable, blocksSight) {
        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.walkable = walkable;
        this.blocksSight = blocksSight;
        this.entity = null;
        this.props = {};
    }

    _createClass(Tile, null, [{
        key: 'createTile',
        value: function createTile(desc) {
            return new Tile(desc.glyph, desc.walkable, desc.blocksSight);
        }
    }]);

    return Tile;
}();

Tile.EMPTY = {
    glyph: new Glyph(Glyph.CHAR_SPACE, 0xffffff, 0x000000),
    walkable: false,
    blocksSight: true
};
Tile.FLOOR = {
    glyph: new Glyph('\'', 0x222222, 0x000000),
    walkable: true,
    blocksSight: true
};
Tile.WALL = {
    glyph: new Glyph(Glyph.CHAR_HLINE, 0xffffff, 0x000000),
    walkable: false,
    blocksSight: true
};
module.exports = Tile;

},{"./Glyph":4}],13:[function(require,module,exports){
"use strict";

var Engine = require('./Engine');
var Scene = require('./Scene');
window.onload = function () {
    var engine = new Engine(60, 40, 'rogue');
    var scene = new Scene(engine, 60, 40);
    engine.start(scene);
};

},{"./Engine":2,"./Scene":11}],14:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Exceptions = require('../Exceptions');

var Action = function () {
    function Action() {
        _classCallCheck(this, Action);

        this.cost = 100;
    }

    _createClass(Action, [{
        key: 'act',
        value: function act() {
            throw new Exceptions.MissingImplementationError('Action.act must be overwritten');
        }
    }]);

    return Action;
}();

exports.Action = Action;

},{"../Exceptions":3}],15:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Exceptions = require('../Exceptions');

var Behaviour = function () {
    function Behaviour(entity) {
        _classCallCheck(this, Behaviour);

        this.entity = entity;
    }

    _createClass(Behaviour, [{
        key: 'getNextAction',
        value: function getNextAction() {
            throw new Exceptions.MissingImplementationError('Behaviour.getNextAction must be overwritten');
        }
    }]);

    return Behaviour;
}();

exports.Behaviour = Behaviour;

},{"../Exceptions":3}],16:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');

var NullAction = function (_Behaviours$Action) {
    _inherits(NullAction, _Behaviours$Action);

    function NullAction() {
        _classCallCheck(this, NullAction);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NullAction).apply(this, arguments));
    }

    _createClass(NullAction, [{
        key: "act",
        value: function act() {
            return this.cost;
        }
    }]);

    return NullAction;
}(Behaviours.Action);

exports.NullAction = NullAction;

},{"./index":20}],17:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Core = require('../core');
var Events = require('../events');
var Behaviours = require('./index');
var Components = require('../components');

var RandomWalkBehaviour = function (_Behaviours$Behaviour) {
    _inherits(RandomWalkBehaviour, _Behaviours$Behaviour);

    function RandomWalkBehaviour(engine, entity) {
        _classCallCheck(this, RandomWalkBehaviour);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RandomWalkBehaviour).call(this, entity));

        _this.engine = engine;
        _this.entity = entity;
        _this.physicsComponent = entity.getComponent(Components.PhysicsComponent);
        return _this;
    }

    _createClass(RandomWalkBehaviour, [{
        key: 'getNextAction',
        value: function getNextAction() {
            var positions = Core.Utils.randomizeArray(Core.Position.getNeighbours(this.physicsComponent.position));
            var isWithoutEntity = false;
            var position = null;
            while (!isWithoutEntity && positions.length > 0) {
                position = positions.pop();
                isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', { position: position }));
            }
            if (isWithoutEntity) {
                return new Behaviours.WalkAction(this.physicsComponent, position);
            } else {
                return new Behaviours.NullAction();
            }
        }
    }]);

    return RandomWalkBehaviour;
}(Behaviours.Behaviour);

exports.RandomWalkBehaviour = RandomWalkBehaviour;

},{"../components":34,"../core":37,"../events":43,"./index":20}],18:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');

var WalkAction = function (_Behaviours$Action) {
    _inherits(WalkAction, _Behaviours$Action);

    function WalkAction(physicsComponent, position) {
        _classCallCheck(this, WalkAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WalkAction).call(this));

        _this.physicsComponent = physicsComponent;
        _this.position = position;
        return _this;
    }

    _createClass(WalkAction, [{
        key: "act",
        value: function act() {
            this.physicsComponent.moveTo(this.position);
            return this.cost;
        }
    }]);

    return WalkAction;
}(Behaviours.Action);

exports.WalkAction = WalkAction;

},{"./index":20}],19:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');
var Entities = require('../entities');
var Components = require('../components');
var Glyph = require('../Glyph');

var WriteRuneAction = function (_Behaviours$Action) {
    _inherits(WriteRuneAction, _Behaviours$Action);

    function WriteRuneAction(engine, entity) {
        _classCallCheck(this, WriteRuneAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WriteRuneAction).call(this));

        _this.engine = engine;
        _this.physics = entity.getComponent(Components.PhysicsComponent);
        return _this;
    }

    _createClass(WriteRuneAction, [{
        key: 'act',
        value: function act() {
            var rune = new Entities.Entity(this.engine, 'Rune', 'rune');
            rune.addComponent(new Components.PhysicsComponent(this.engine, {
                position: this.physics.position,
                blocking: false
            }));
            rune.addComponent(new Components.RenderableComponent(this.engine, {
                glyph: new Glyph('#', 0x44ff88, 0x000000)
            }));
            rune.addComponent(new Components.SelfDestructComponent(this.engine, {
                turns: 10
            }));
            rune.addComponent(new Components.RuneFreezeComponent(this.engine));
            return this.cost;
        }
    }]);

    return WriteRuneAction;
}(Behaviours.Action);

exports.WriteRuneAction = WriteRuneAction;

},{"../Glyph":4,"../components":34,"../entities":40,"./index":20}],20:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Action'));
__export(require('./Behaviour'));
__export(require('./WalkAction'));
__export(require('./NullAction'));
__export(require('./WriteRuneAction'));
__export(require('./RandomWalkBehaviour'));

},{"./Action":14,"./Behaviour":15,"./NullAction":16,"./RandomWalkBehaviour":17,"./WalkAction":18,"./WriteRuneAction":19}],21:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Exceptions = require('../Exceptions');

var Component = function () {
    function Component(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Component);

        this._guid = Core.Utils.generateGuid();
        this._engine = engine;
        this.listeners = [];
    }

    _createClass(Component, [{
        key: 'registerEntity',
        value: function registerEntity(entity) {
            this._entity = entity;
            this.checkRequirements();
            this.initialize();
            this.registerListeners();
        }
    }, {
        key: 'checkRequirements',
        value: function checkRequirements() {}
    }, {
        key: 'registerListeners',
        value: function registerListeners() {}
    }, {
        key: 'initialize',
        value: function initialize() {}
    }, {
        key: 'destroy',
        value: function destroy() {
            var _this = this;

            if (!this.listeners || typeof this.listeners.forEach !== 'function') {
                throw new Exceptions.MissingImplementationError('`this.listeners` has been redefined, default `destroy` function should not be used. For: ' + this.entity.name);
            }
            this.listeners.forEach(function (listener) {
                _this.engine.removeListener(listener);
                _this.entity.removeListener(listener);
            });
            this.listeners = [];
        }
    }, {
        key: 'guid',
        get: function get() {
            return this._guid;
        }
    }, {
        key: 'entity',
        get: function get() {
            return this._entity;
        }
    }, {
        key: 'engine',
        get: function get() {
            return this._engine;
        }
    }]);

    return Component;
}();

exports.Component = Component;

},{"../Exceptions":3,"../core":37}],22:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Components = require('./index');
var Events = require('../events');

var EnergyComponent = function (_Components$Component) {
    _inherits(EnergyComponent, _Components$Component);

    function EnergyComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { regenratationRate: 100, max: 100 } : arguments[1];

        _classCallCheck(this, EnergyComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EnergyComponent).call(this, engine));

        _this._currentEnergy = _this._maxEnergy = data.max;
        _this._energyRegenerationRate = data.regenratationRate;
        return _this;
    }

    _createClass(EnergyComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this), 1)));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            var rate = this._energyRegenerationRate;
            var rateModifiers = this.entity.gather(new Events.Event('onEnergyRegeneration'));
            rateModifiers.forEach(function (modifier) {
                rate = rate * modifier;
            });
            this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + rate);
        }
    }, {
        key: 'useEnergy',
        value: function useEnergy(energy) {
            this._currentEnergy = this._currentEnergy - energy;
            return this._currentEnergy;
        }
    }, {
        key: 'currentEnergy',
        get: function get() {
            return this._currentEnergy;
        }
    }, {
        key: 'energyRegenerationRate',
        get: function get() {
            return this._energyRegenerationRate;
        }
    }, {
        key: 'maxEnergy',
        get: function get() {
            return this._maxEnergy;
        }
    }]);

    return EnergyComponent;
}(Components.Component);

exports.EnergyComponent = EnergyComponent;

},{"../events":43,"./index":34}],23:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var HealthComponent = function (_Components$Component) {
    _inherits(HealthComponent, _Components$Component);

    function HealthComponent() {
        _classCallCheck(this, HealthComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HealthComponent).apply(this, arguments));
    }

    _createClass(HealthComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.entity.listen(new Events.Listener('damage', this.onDamage.bind(this)));
        }
    }, {
        key: 'onDamage',
        value: function onDamage(event) {
            this.engine.removeEntity(this.entity);
            this.engine.emit(new Events.Event('message', {
                message: this.entity.name + ' was killed by ' + event.data.source.name + '.',
                target: this.entity
            }));
        }
    }]);

    return HealthComponent;
}(Components.Component);

exports.HealthComponent = HealthComponent;

},{"../events":43,"./index":34}],24:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Core = require('../core');
var Events = require('../events');
var Components = require('./index');
var Behaviours = require('../behaviours');
var InputHandler = require('../InputHandler');

var InputComponent = function (_Components$Component) {
    _inherits(InputComponent, _Components$Component);

    function InputComponent() {
        _classCallCheck(this, InputComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(InputComponent).apply(this, arguments));
    }

    _createClass(InputComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.energyComponent = this.entity.getComponent(Components.EnergyComponent);
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
            this.hasFocus = false;
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this))));
            this.engine.inputHandler.listen([InputHandler.KEY_UP, InputHandler.KEY_K], this.onMoveUp.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_U], this.onMoveUpRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_RIGHT, InputHandler.KEY_L], this.onMoveRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_N], this.onMoveDownRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_DOWN, InputHandler.KEY_J], this.onMoveDown.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_B], this.onMoveDownLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_LEFT, InputHandler.KEY_H], this.onMoveLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_Y], this.onMoveUpLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_PERIOD], this.onWait.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_0], this.onTrapOne.bind(this));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            if (this.energyComponent.currentEnergy >= 100) {
                this.act();
            }
        }
    }, {
        key: 'act',
        value: function act() {
            this.hasFocus = true;
            this.engine.emit(new Events.Event('pauseTime'));
        }
    }, {
        key: 'performAction',
        value: function performAction(action) {
            this.hasFocus = false;
            this.engine.emit(new Events.Event('resumeTime'));
            this.energyComponent.useEnergy(action.act());
        }
    }, {
        key: 'onWait',
        value: function onWait() {
            if (!this.hasFocus) {
                return;
            }
            this.performAction(new Behaviours.NullAction());
        }
    }, {
        key: 'onTrapOne',
        value: function onTrapOne() {
            if (!this.hasFocus) {
                return;
            }
            var action = this.entity.fire(new Events.Event('writeRune', {}));
            if (action) {
                this.performAction(action);
            }
        }
    }, {
        key: 'onMoveUp',
        value: function onMoveUp() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(0, -1));
        }
    }, {
        key: 'onMoveUpRight',
        value: function onMoveUpRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, -1));
        }
    }, {
        key: 'onMoveRight',
        value: function onMoveRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, 0));
        }
    }, {
        key: 'onMoveDownRight',
        value: function onMoveDownRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, 1));
        }
    }, {
        key: 'onMoveDown',
        value: function onMoveDown() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(0, 1));
        }
    }, {
        key: 'onMoveDownLeft',
        value: function onMoveDownLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, 1));
        }
    }, {
        key: 'onMoveLeft',
        value: function onMoveLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, 0));
        }
    }, {
        key: 'onMoveUpLeft',
        value: function onMoveUpLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, -1));
        }
    }, {
        key: 'handleMovement',
        value: function handleMovement(direction) {
            var position = Core.Position.add(this.physicsComponent.position, direction);
            var isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', { position: position }));
            if (isWithoutEntity) {
                this.performAction(new Behaviours.WalkAction(this.physicsComponent, position));
            }
        }
    }]);

    return InputComponent;
}(Components.Component);

exports.InputComponent = InputComponent;

},{"../InputHandler":5,"../behaviours":20,"../core":37,"../events":43,"./index":34}],25:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var PhysicsComponent = function (_Components$Component) {
    _inherits(PhysicsComponent, _Components$Component);

    function PhysicsComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { position: null, blocking: true } : arguments[1];

        _classCallCheck(this, PhysicsComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PhysicsComponent).call(this, engine));

        _this._position = data.position;
        _this._blocking = data.blocking;
        return _this;
    }

    _createClass(PhysicsComponent, [{
        key: 'initialize',
        value: function initialize() {
            if (this.position) {
                this.engine.emit(new Events.Event('movedTo', { physicsComponent: this, entity: this.entity }));
                this.engine.emit(new Events.Event('move', { physicsComponent: this, entity: this.entity }));
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            _get(Object.getPrototypeOf(PhysicsComponent.prototype), 'destroy', this).call(this);
            this.engine.emit(new Events.Event('movedFrom', { physicsComponent: this, entity: this.entity }));
        }
    }, {
        key: 'moveTo',
        value: function moveTo(position) {
            if (this._position) {
                this.engine.emit(new Events.Event('movedFrom', { physicsComponent: this, entity: this.entity }));
            }
            this._position = position;
            this.engine.emit(new Events.Event('movedTo', { physicsComponent: this, entity: this.entity }));
            this.engine.emit(new Events.Event('move', { physicsComponent: this, entity: this.entity }));
        }
    }, {
        key: 'blocking',
        get: function get() {
            return this._blocking;
        }
    }, {
        key: 'position',
        get: function get() {
            return this._position;
        }
    }]);

    return PhysicsComponent;
}(Components.Component);

exports.PhysicsComponent = PhysicsComponent;

},{"../events":43,"./index":34}],26:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Exceptions = require('../Exceptions');
var Components = require('./index');

var RenderableComponent = function (_Components$Component) {
    _inherits(RenderableComponent, _Components$Component);

    function RenderableComponent(engine, data) {
        _classCallCheck(this, RenderableComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RenderableComponent).call(this, engine));

        _this._glyph = data.glyph;
        return _this;
    }

    _createClass(RenderableComponent, [{
        key: 'checkRequirements',
        value: function checkRequirements() {
            if (!this.entity.hasComponent(Components.PhysicsComponent)) {
                throw new Exceptions.MissingComponentError('RenderableComponent requires PhysicsComponent');
            }
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            this.engine.emit(new Events.Event('renderableComponentCreated', { entity: this.entity, renderableComponent: this }));
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.engine.emit(new Events.Event('renderableComponentDestroyed', { entity: this.entity, renderableComponent: this }));
        }
    }, {
        key: 'glyph',
        get: function get() {
            return this._glyph;
        }
    }]);

    return RenderableComponent;
}(Components.Component);

exports.RenderableComponent = RenderableComponent;

},{"../Exceptions":3,"../events":43,"./index":34}],27:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('../behaviours');
var Components = require('./index');
var Events = require('../events');

var RoamingAIComponent = function (_Components$Component) {
    _inherits(RoamingAIComponent, _Components$Component);

    function RoamingAIComponent() {
        _classCallCheck(this, RoamingAIComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RoamingAIComponent).apply(this, arguments));
    }

    _createClass(RoamingAIComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.energyComponent = this.entity.getComponent(Components.EnergyComponent);
            this.randomWalkBehaviour = new Behaviours.RandomWalkBehaviour(this.engine, this.entity);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this))));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            if (this.energyComponent.currentEnergy >= 100) {
                var action = this.randomWalkBehaviour.getNextAction();
                this.energyComponent.useEnergy(action.act());
            }
        }
    }]);

    return RoamingAIComponent;
}(Components.Component);

exports.RoamingAIComponent = RoamingAIComponent;

},{"../behaviours":20,"../events":43,"./index":34}],28:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var RuneDamageComponent = function (_Components$Component) {
    _inherits(RuneDamageComponent, _Components$Component);

    function RuneDamageComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { radius: 1, charges: 1 } : arguments[1];

        _classCallCheck(this, RuneDamageComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RuneDamageComponent).call(this, engine));

        _this.radius = data.radius;
        _this.charges = data.charges;
        return _this;
    }

    _createClass(RuneDamageComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this), 50)));
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            if (this.charges <= 0) {
                return;
            }
            var eventPosition = event.data.physicsComponent.position;
            if (eventPosition.x == this.physicsComponent.position.x && eventPosition.y === this.physicsComponent.position.y) {
                event.data.entity.emit(new Events.Event('damage', {
                    source: this.entity
                }));
                this.charges--;
                if (this.charges <= 0) {
                    this.engine.removeEntity(this.entity);
                }
            }
        }
    }]);

    return RuneDamageComponent;
}(Components.Component);

exports.RuneDamageComponent = RuneDamageComponent;

},{"../events":43,"./index":34}],29:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var RuneFreezeComponent = function (_Components$Component) {
    _inherits(RuneFreezeComponent, _Components$Component);

    function RuneFreezeComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { radius: 1, charges: 1 } : arguments[1];

        _classCallCheck(this, RuneFreezeComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RuneFreezeComponent).call(this, engine));

        _this.radius = data.radius;
        _this.charges = data.charges;
        return _this;
    }

    _createClass(RuneFreezeComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this), 50)));
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            if (this.charges <= 0) {
                return;
            }
            var eventPosition = event.data.physicsComponent.position;
            if (eventPosition.x == this.physicsComponent.position.x && eventPosition.y === this.physicsComponent.position.y) {
                event.data.entity.addComponent(new Components.SlowComponent(this.engine, { factor: 0.5 }), {
                    duration: 10
                });
                this.charges--;
                if (this.charges <= 0) {
                    this.engine.removeEntity(this.entity);
                }
            }
        }
    }]);

    return RuneFreezeComponent;
}(Components.Component);

exports.RuneFreezeComponent = RuneFreezeComponent;

},{"../events":43,"./index":34}],30:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('../behaviours');
var Events = require('../events');
var Components = require('./index');

var RuneWriterComponent = function (_Components$Component) {
    _inherits(RuneWriterComponent, _Components$Component);

    function RuneWriterComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, RuneWriterComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RuneWriterComponent).call(this, engine));
    }

    _createClass(RuneWriterComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicalComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.entity.listen(new Events.Listener('writeRune', this.onWriteRune.bind(this)));
        }
    }, {
        key: 'onWriteRune',
        value: function onWriteRune(event) {
            var tile = this.engine.fire(new Events.Event('getTile', {
                position: this.physicalComponent.position
            }));
            var hasRune = false;
            for (var key in tile.props) {
                if (tile.props[key].type === 'rune') {
                    hasRune = true;
                }
            }
            if (hasRune) {
                return null;
            }
            return new Behaviours.WriteRuneAction(this.engine, this.entity);
        }
    }]);

    return RuneWriterComponent;
}(Components.Component);

exports.RuneWriterComponent = RuneWriterComponent;

},{"../behaviours":20,"../events":43,"./index":34}],31:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var SelfDestructComponent = function (_Components$Component) {
    _inherits(SelfDestructComponent, _Components$Component);

    function SelfDestructComponent(engine, data) {
        _classCallCheck(this, SelfDestructComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SelfDestructComponent).call(this, engine));

        _this.maxTurns = data.turns;
        _this.turnsLeft = data.turns;
        _this.listeners = [];
        return _this;
    }

    _createClass(SelfDestructComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('turn', this.onTurn.bind(this), 50)));
        }
    }, {
        key: 'onTurn',
        value: function onTurn(event) {
            this.turnsLeft--;
            if (this.turnsLeft < 0) {
                this.engine.removeEntity(this.entity);
            }
        }
    }]);

    return SelfDestructComponent;
}(Components.Component);

exports.SelfDestructComponent = SelfDestructComponent;

},{"../events":43,"./index":34}],32:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var SlowComponent = function (_Components$Component) {
    _inherits(SlowComponent, _Components$Component);

    function SlowComponent(engine, data) {
        _classCallCheck(this, SlowComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SlowComponent).call(this, engine));

        _this._factor = data.factor;
        return _this;
    }

    _createClass(SlowComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.entity.listen(new Events.Listener('onEnergyRegeneration', this.onEnergyRegeneration.bind(this), 50)));
            this.listeners.push(this.entity.listen(new Events.Listener('getStatusEffect', this.onGetStatusEffect.bind(this))));
        }
    }, {
        key: 'onEnergyRegeneration',
        value: function onEnergyRegeneration(event) {
            return this._factor;
        }
    }, {
        key: 'onGetStatusEffect',
        value: function onGetStatusEffect(event) {
            return {
                name: 'Slow',
                symbol: 'S'
            };
        }
    }, {
        key: 'factor',
        get: function get() {
            return this._factor;
        }
    }]);

    return SlowComponent;
}(Components.Component);

exports.SlowComponent = SlowComponent;

},{"../events":43,"./index":34}],33:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Components = require('./index');
var Events = require('../events');

var TimeHandlerComponent = function (_Components$Component) {
    _inherits(TimeHandlerComponent, _Components$Component);

    function TimeHandlerComponent() {
        _classCallCheck(this, TimeHandlerComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TimeHandlerComponent).apply(this, arguments));
    }

    _createClass(TimeHandlerComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.ticksPerTurn = 1;
            this.turnTime = 0;
            this._currentTurn = 0;
            this._currentTick = 0;
            this.paused = false;
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('pauseTime', this.onPauseTime.bind(this)));
            this.engine.listen(new Events.Listener('resumeTime', this.onResumeTime.bind(this)));
        }
    }, {
        key: 'onPauseTime',
        value: function onPauseTime(event) {
            this.paused = true;
        }
    }, {
        key: 'onResumeTime',
        value: function onResumeTime(event) {
            this.paused = false;
        }
    }, {
        key: 'engineTick',
        value: function engineTick(gameTime) {
            if (this.paused) {
                return;
            }
            this._currentTick++;
            this.engine.currentTick = this._currentTick;
            if (this._currentTick % this.ticksPerTurn === 0) {
                this._currentTurn++;
                this.engine.currentTurn = this._currentTurn;
                this.engine.emit(new Events.Event('turn', { currentTurn: this._currentTurn, currentTick: this._currentTick }));
                this.turnTime = gameTime;
            }
            this.engine.emit(new Events.Event('tick', { currentTurn: this._currentTurn, currentTick: this._currentTick }));
        }
    }, {
        key: 'currentTick',
        get: function get() {
            return this._currentTick;
        }
    }, {
        key: 'currentTurn',
        get: function get() {
            return this._currentTurn;
        }
    }]);

    return TimeHandlerComponent;
}(Components.Component);

exports.TimeHandlerComponent = TimeHandlerComponent;

},{"../events":43,"./index":34}],34:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Component'));
__export(require('./TimeHandlerComponent'));
__export(require('./SelfDestructComponent'));
__export(require('./RoamingAIComponent'));
__export(require('./EnergyComponent'));
__export(require('./InputComponent'));
__export(require('./RenderableComponent'));
__export(require('./PhysicsComponent'));
__export(require('./HealthComponent'));
__export(require('./RuneWriterComponent'));
__export(require('./RuneDamageComponent'));
__export(require('./RuneFreezeComponent'));
__export(require('./SlowComponent'));

},{"./Component":21,"./EnergyComponent":22,"./HealthComponent":23,"./InputComponent":24,"./PhysicsComponent":25,"./RenderableComponent":26,"./RoamingAIComponent":27,"./RuneDamageComponent":28,"./RuneFreezeComponent":29,"./RuneWriterComponent":30,"./SelfDestructComponent":31,"./SlowComponent":32,"./TimeHandlerComponent":33}],35:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ColorUtils = function () {
    function ColorUtils() {
        _classCallCheck(this, ColorUtils);
    }

    _createClass(ColorUtils, null, [{
        key: "multiply",

        /**
          Function: multiply
          Multiply a color with a number.
          > (r,g,b) * n == (r*n, g*n, b*n)
             Parameters:
          color - the color
          coef - the factor
             Returns:
          A new color as a number between 0x000000 and 0xFFFFFF
         */
        value: function multiply(color, coef) {
            var r = void 0,
                g = void 0,
                b = void 0;
            if (typeof color === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r = (color & 0xFF0000) >> 16;
                g = (color & 0x00FF00) >> 8;
                b = color & 0x0000FF;
            } else {
                var rgb = ColorUtils.toRgb(color);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            }
            r = Math.round(r * coef);
            g = Math.round(g * coef);
            b = Math.round(b * coef);
            r = r < 0 ? 0 : r > 255 ? 255 : r;
            g = g < 0 ? 0 : g > 255 ? 255 : g;
            b = b < 0 ? 0 : b > 255 ? 255 : b;
            return b | g << 8 | r << 16;
        }
    }, {
        key: "max",
        value: function max(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            if (r2 > r1) {
                r1 = r2;
            }
            if (g2 > g1) {
                g1 = g2;
            }
            if (b2 > b1) {
                b1 = b2;
            }
            return b1 | g1 << 8 | r1 << 16;
        }
    }, {
        key: "min",
        value: function min(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            if (r2 < r1) {
                r1 = r2;
            }
            if (g2 < g1) {
                g1 = g2;
            }
            if (b2 < b1) {
                b1 = b2;
            }
            return b1 | g1 << 8 | r1 << 16;
        }
    }, {
        key: "colorMultiply",
        value: function colorMultiply(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            r1 = Math.floor(r1 * r2 / 255);
            g1 = Math.floor(g1 * g2 / 255);
            b1 = Math.floor(b1 * b2 / 255);
            r1 = r1 < 0 ? 0 : r1 > 255 ? 255 : r1;
            g1 = g1 < 0 ? 0 : g1 > 255 ? 255 : g1;
            b1 = b1 < 0 ? 0 : b1 > 255 ? 255 : b1;
            return b1 | g1 << 8 | r1 << 16;
        }
        /**
          Function: computeIntensity
          Return the grayscale intensity between 0 and 1
         */

    }, {
        key: "computeIntensity",
        value: function computeIntensity(color) {
            // Colorimetric (luminance-preserving) conversion to grayscale
            var r = void 0,
                g = void 0,
                b = void 0;
            if (typeof color === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r = (color & 0xFF0000) >> 16;
                g = (color & 0x00FF00) >> 8;
                b = color & 0x0000FF;
            } else {
                var rgb = ColorUtils.toRgb(color);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            }
            return (0.2126 * r + 0.7152 * g + 0.0722 * b) * (1 / 255);
        }
        /**
          Function: add
          Add two colors.
          > (r1,g1,b1) + (r2,g2,b2) = (r1+r2,g1+g2,b1+b2)
             Parameters:
          col1 - the first color
          col2 - the second color
             Returns:
          A new color as a number between 0x000000 and 0xFFFFFF
         */

    }, {
        key: "add",
        value: function add(col1, col2) {
            var r = ((col1 & 0xFF0000) >> 16) + ((col2 & 0xFF0000) >> 16);
            var g = ((col1 & 0x00FF00) >> 8) + ((col2 & 0x00FF00) >> 8);
            var b = (col1 & 0x0000FF) + (col2 & 0x0000FF);
            if (r > 255) {
                r = 255;
            }
            if (g > 255) {
                g = 255;
            }
            if (b > 255) {
                b = 255;
            }
            return b | g << 8 | r << 16;
        }
        /**
          Function: toRgb
          Convert a string color into a [r,g,b] number array.
             Parameters:
          color - the color
             Returns:
          An array of 3 numbers [r,g,b] between 0 and 255.
         */

    }, {
        key: "toRgb",
        value: function toRgb(color) {
            if (typeof color === "number") {
                return ColorUtils.toRgbFromNumber(color);
            } else {
                return ColorUtils.toRgbFromString(color);
            }
        }
        /**
          Function: toWeb
          Convert a color into a CSS color format (as a string)
         */

    }, {
        key: "toWeb",
        value: function toWeb(color) {
            if (typeof color === "number") {
                var ret = color.toString(16);
                var missingZeroes = 6 - ret.length;
                if (missingZeroes > 0) {
                    ret = "000000".substr(0, missingZeroes) + ret;
                }
                return "#" + ret;
            } else {
                return color;
            }
        }
    }, {
        key: "toRgbFromNumber",
        value: function toRgbFromNumber(color) {
            var r = (color & 0xFF0000) >> 16;
            var g = (color & 0x00FF00) >> 8;
            var b = color & 0x0000FF;
            return [r, g, b];
        }
    }, {
        key: "toRgbFromString",
        value: function toRgbFromString(color) {
            color = color.toLowerCase();
            var stdColValues = ColorUtils.stdCol[String(color)];
            if (stdColValues) {
                return stdColValues;
            }
            if (color.charAt(0) === "#") {
                // #FFF or #FFFFFF format
                if (color.length === 4) {
                    // expand #FFF to #FFFFFF
                    color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
                }
                var r = parseInt(color.substr(1, 2), 16);
                var g = parseInt(color.substr(3, 2), 16);
                var b = parseInt(color.substr(5, 2), 16);
                return [r, g, b];
            } else if (color.indexOf("rgb(") === 0) {
                // rgb(r,g,b) format
                var rgbList = color.substr(4, color.length - 5).split(",");
                return [parseInt(rgbList[0], 10), parseInt(rgbList[1], 10), parseInt(rgbList[2], 10)];
            }
            return [0, 0, 0];
        }
        /**
          Function: toNumber
          Convert a string color into a number.
             Parameters:
          color - the color
             Returns:
          A number between 0x000000 and 0xFFFFFF.
         */

    }, {
        key: "toNumber",
        value: function toNumber(color) {
            if (typeof color === "number") {
                return color;
            }
            var scol = color;
            if (scol.charAt(0) === "#" && scol.length === 7) {
                return parseInt(scol.substr(1), 16);
            } else {
                var rgb = ColorUtils.toRgbFromString(scol);
                return rgb[0] * 65536 + rgb[1] * 256 + rgb[2];
            }
        }
    }]);

    return ColorUtils;
}();

ColorUtils.stdCol = {
    "aqua": [0, 255, 255],
    "black": [0, 0, 0],
    "blue": [0, 0, 255],
    "fuchsia": [255, 0, 255],
    "gray": [128, 128, 128],
    "green": [0, 128, 0],
    "lime": [0, 255, 0],
    "maroon": [128, 0, 0],
    "navy": [0, 0, 128],
    "olive": [128, 128, 0],
    "orange": [255, 165, 0],
    "purple": [128, 0, 128],
    "red": [255, 0, 0],
    "silver": [192, 192, 192],
    "teal": [0, 128, 128],
    "white": [255, 255, 255],
    "yellow": [255, 255, 0]
};
exports.ColorUtils = ColorUtils;

},{}],36:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = function () {
    function Position(x, y) {
        _classCallCheck(this, Position);

        this._x = x;
        this._y = y;
    }

    _createClass(Position, [{
        key: "x",
        get: function get() {
            return this._x;
        }
    }, {
        key: "y",
        get: function get() {
            return this._y;
        }
    }], [{
        key: "setMaxValues",
        value: function setMaxValues(w, h) {
            Position.maxWidth = w;
            Position.maxHeight = h;
        }
    }, {
        key: "getRandom",
        value: function getRandom() {
            var width = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];
            var height = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

            if (width === -1) {
                width = Position.maxWidth;
            }
            if (height === -1) {
                height = Position.maxHeight;
            }
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            return new Position(x, y);
        }
    }, {
        key: "getNeighbours",
        value: function getNeighbours(pos) {
            var width = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
            var height = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
            var onlyCardinal = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            if (width === -1) {
                width = Position.maxWidth;
            }
            if (height === -1) {
                height = Position.maxHeight;
            }
            var x = pos.x;
            var y = pos.y;
            var positions = [];
            if (x > 0) {
                positions.push(new Position(x - 1, y));
            }
            if (x < width - 1) {
                positions.push(new Position(x + 1, y));
            }
            if (y > 0) {
                positions.push(new Position(x, y - 1));
            }
            if (y < height - 1) {
                positions.push(new Position(x, y + 1));
            }
            if (!onlyCardinal) {
                if (x > 0 && y > 0) {
                    positions.push(new Position(x - 1, y - 1));
                }
                if (x > 0 && y < height - 1) {
                    positions.push(new Position(x - 1, y + 1));
                }
                if (x < width - 1 && y < height - 1) {
                    positions.push(new Position(x + 1, y + 1));
                }
                if (x < width - 1 && y > 0) {
                    positions.push(new Position(x + 1, y - 1));
                }
            }
            return positions;
        }
    }, {
        key: "getDirections",
        value: function getDirections() {
            var onlyCardinal = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var directions = [];
            directions.push(new Position(0, -1));
            directions.push(new Position(0, 1));
            directions.push(new Position(-1, 0));
            directions.push(new Position(1, 0));
            if (!onlyCardinal) {
                directions.push(new Position(-1, -1));
                directions.push(new Position(1, 1));
                directions.push(new Position(-1, 1));
                directions.push(new Position(1, -1));
            }
            return directions;
        }
    }, {
        key: "add",
        value: function add(a, b) {
            return new Position(a.x + b.x, a.y + b.y);
        }
    }]);

    return Position;
}();

exports.Position = Position;

},{}],37:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Color'));
__export(require('./Position'));
var Utils;
(function (Utils) {
    // CRC32 utility. Adapted from http://stackoverflow.com/questions/18638900/javascript-crc32
    var crcTable = void 0;
    function makeCRCTable() {
        var c = void 0;
        crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
            }
            crcTable[n] = c;
        }
    }
    function buildMatrix(w, h, value) {
        var ret = [];
        for (var x = 0; x < w; ++x) {
            ret[x] = [];
            for (var y = 0; y < h; ++y) {
                ret[x][y] = value;
            }
        }
        return ret;
    }
    Utils.buildMatrix = buildMatrix;
    function crc32(str) {
        if (!crcTable) {
            makeCRCTable();
        }
        var crc = 0 ^ -1;
        for (var i = 0, len = str.length; i < len; ++i) {
            crc = crc >>> 8 ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
        return (crc ^ -1) >>> 0;
    }
    Utils.crc32 = crc32;
    ;
    function toCamelCase(input) {
        return input.toLowerCase().replace(/(\b|_)\w/g, function (m) {
            return m.toUpperCase().replace(/_/, "");
        });
    }
    Utils.toCamelCase = toCamelCase;
    function generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }
    Utils.generateGuid = generateGuid;
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Utils.getRandom = getRandom;
    function getRandomIndex(array) {
        return array[getRandom(0, array.length - 1)];
    }
    Utils.getRandomIndex = getRandomIndex;
    function randomizeArray(array) {
        if (array.length <= 1) return array;
        for (var i = 0; i < array.length; i++) {
            var randomChoiceIndex = getRandom(i, array.length - 1);
            var _ref = [array[randomChoiceIndex], array[i]];
            array[i] = _ref[0];
            array[randomChoiceIndex] = _ref[1];
        }
        return array;
    }
    Utils.randomizeArray = randomizeArray;
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
    Utils.applyMixins = applyMixins;
})(Utils = exports.Utils || (exports.Utils = {}));

},{"./Color":35,"./Position":36}],38:[function(require,module,exports){
"use strict";

var Components = require('../components');
var Entities = require('./index');
var Glyph = require('../Glyph');
function createWily(engine) {
    var wily = new Entities.Entity(engine, 'Wily', 'player');
    wily.addComponent(new Components.PhysicsComponent(engine));
    wily.addComponent(new Components.RenderableComponent(engine, {
        glyph: new Glyph('@', 0xffffff, 0x000000)
    }));
    wily.addComponent(new Components.EnergyComponent(engine));
    wily.addComponent(new Components.InputComponent(engine));
    wily.addComponent(new Components.RuneWriterComponent(engine));
    wily.addComponent(new Components.HealthComponent(engine));
    return wily;
}
exports.createWily = createWily;
function createRat(engine) {
    var rat = new Entities.Entity(engine, 'Rat', 'vermin');
    rat.addComponent(new Components.PhysicsComponent(engine));
    rat.addComponent(new Components.RenderableComponent(engine, {
        glyph: new Glyph('r', 0xffffff, 0x000000)
    }));
    rat.addComponent(new Components.EnergyComponent(engine));
    rat.addComponent(new Components.RoamingAIComponent(engine));
    rat.addComponent(new Components.HealthComponent(engine));
    return rat;
}
exports.createRat = createRat;

},{"../Glyph":4,"../components":34,"./index":40}],39:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Events = require('../events');
var Mixins = require('../mixins');

var Entity = function () {
    function Entity(engine) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var type = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        _classCallCheck(this, Entity);

        this.engine = engine;
        this._guid = Core.Utils.generateGuid();
        this._name = name;
        this._type = type;
        this.components = [];
        this.engine.registerEntity(this);
    }

    _createClass(Entity, [{
        key: 'destroy',
        value: function destroy() {
            this.components.forEach(function (component) {
                component.destroy();
                component = null;
            });
            this.engine.removeEntity(this);
        }
    }, {
        key: 'addComponent',
        value: function addComponent(component) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            this.components.push(component);
            component.registerEntity(this);
            if (options && options.duration) {
                var delayedComponentRemover = new DelayedComponentRemover();
                delayedComponentRemover.triggerTurn = this.engine.currentTurn + options.duration;
                delayedComponentRemover.entity = this;
                delayedComponentRemover.engine = this.engine;
                delayedComponentRemover.guid = component.guid;
                delayedComponentRemover.listener = this.engine.listen(new Events.Listener('turn', delayedComponentRemover.check.bind(delayedComponentRemover)));
            }
        }
    }, {
        key: 'hasComponent',
        value: function hasComponent(componentType) {
            return this.components.filter(function (component) {
                return component instanceof componentType;
            }).length > 0;
        }
    }, {
        key: 'getComponent',
        value: function getComponent(componentType) {
            var component = this.components.filter(function (component) {
                return component instanceof componentType;
            });
            if (component.length === 0) {
                return null;
            }
            return component[0];
        }
    }, {
        key: 'removeComponent',
        value: function removeComponent(guid) {
            var idx = this.components.findIndex(function (component) {
                return component.guid === guid;
            });
            if (idx >= 0) {
                this.components[idx].destroy();
                this.components.splice(idx, 1);
            }
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'guid',
        get: function get() {
            return this._guid;
        }
    }]);

    return Entity;
}();

exports.Entity = Entity;

var DelayedComponentRemover = function () {
    function DelayedComponentRemover() {
        _classCallCheck(this, DelayedComponentRemover);
    }

    _createClass(DelayedComponentRemover, [{
        key: 'check',
        value: function check(event) {
            if (event.data.currentTurn >= this.triggerTurn) {
                this.entity.removeComponent(this.guid);
                this.engine.removeListener(this.listener);
            }
        }
    }]);

    return DelayedComponentRemover;
}();

Core.Utils.applyMixins(Entity, [Mixins.EventHandler]);

},{"../core":37,"../events":43,"../mixins":50}],40:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Creator'));
__export(require('./Entity'));

},{"./Creator":38,"./Entity":39}],41:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function Event(type) {
    var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Event);

    this.type = type;
    this.data = data;
};

exports.Event = Event;

},{}],42:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');

var Listener = function Listener(type, callback) {
    var priority = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];
    var guid = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    _classCallCheck(this, Listener);

    this.type = type;
    this.priority = priority;
    this.callback = callback;
    this.guid = guid || Core.Utils.generateGuid();
};

exports.Listener = Listener;

},{"../core":37}],43:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Event'));
__export(require('./Listener'));

},{"./Event":41,"./Listener":42}],44:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var MazeRecursiveBacktrackGenerator = function () {
    function MazeRecursiveBacktrackGenerator(map, position) {
        _classCallCheck(this, MazeRecursiveBacktrackGenerator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.maxAttemps = 50000;
        this.attempts = 0;
        this.stack = [];
        this.map[position.x][position.y] = 0;
        this.populateStack(position);
    }

    _createClass(MazeRecursiveBacktrackGenerator, [{
        key: 'populateStack',
        value: function populateStack(position) {
            var neighbours = Core.Position.getNeighbours(position, this.width, this.height, true);
            var newCells = [];
            for (var direction in neighbours) {
                var _position = neighbours[direction];
                if (_position && Map.Utils.canCarve(this.map, _position, 1)) {
                    newCells.push(_position);
                }
            }
            if (newCells.length > 0) {
                this.stack = this.stack.concat(Core.Utils.randomizeArray(newCells));
            }
        }
    }, {
        key: 'iterate',
        value: function iterate() {
            this.attempts++;
            if (this.attempts > this.maxAttemps) {
                console.log('max attempts done');
                return null;
            }
            var pos = void 0;
            while (this.stack && this.stack.length > 0) {
                pos = this.stack.pop();
                if (Map.Utils.canCarve(this.map, pos, 1)) {
                    this.map[pos.x][pos.y] = 0;
                    this.populateStack(pos);
                    return pos;
                }
            }
            return null;
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }]);

    return MazeRecursiveBacktrackGenerator;
}();

exports.MazeRecursiveBacktrackGenerator = MazeRecursiveBacktrackGenerator;

},{"../core":37,"./index":48}],45:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var RoomGenerator = function () {
    function RoomGenerator(map) {
        var maxAttempts = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];

        _classCallCheck(this, RoomGenerator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.maxAttempts = maxAttempts;
    }

    _createClass(RoomGenerator, [{
        key: 'isSpaceAvailable',
        value: function isSpaceAvailable(x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if (!Map.Utils.canCarve(this.map, new Core.Position(i, j), 0)) {
                        return false;
                    }
                }
            }
            return true;
        }
    }, {
        key: 'iterate',
        value: function iterate() {
            var roomGenerated = false;
            var attempts = 0;
            while (!roomGenerated && attempts < this.maxAttempts) {
                roomGenerated = this.generateRoom();
                attempts++;
            }
            return roomGenerated;
        }
    }, {
        key: 'generateRoom',
        value: function generateRoom() {
            var size = Core.Utils.getRandom(3, 5);
            var rectangularity = Core.Utils.getRandom(1, 3);
            var width = void 0;
            var height = void 0;
            if (Math.random() > 0.5) {
                height = size;
                width = size + rectangularity;
            } else {
                width = size;
                height = size + rectangularity;
            }
            var x = Core.Utils.getRandom(0, this.width - width - 2);
            x = Math.floor(x / 2) * 2 + 1;
            var y = Core.Utils.getRandom(0, this.height - height - 2);
            y = Math.floor(y / 2) * 2 + 1;
            if (this.isSpaceAvailable(x, y, width, height)) {
                for (var i = x; i < x + width; i++) {
                    for (var j = y; j < y + height; j++) {
                        this.map[i][j] = 0;
                    }
                }
                return true;
            }
            return false;
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }]);

    return RoomGenerator;
}();

exports.RoomGenerator = RoomGenerator;

},{"../core":37,"./index":48}],46:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var TopologyCombinator = function () {
    function TopologyCombinator(map) {
        _classCallCheck(this, TopologyCombinator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.topologies = [];
        for (var x = 0; x < this.width; x++) {
            this.topologies[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.topologies[x][y] = 0;
            }
        }
    }

    _createClass(TopologyCombinator, [{
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            this.topologyId = 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    this.addTopology(new Core.Position(x, y));
                }
            }
            return this.topologies;
        }
    }, {
        key: 'combine',
        value: function combine() {
            var i = 2;
            var max = this.topologyId;
            var remainingTopologies = [];
            for (var j = 2; j <= this.topologyId; j++) {
                remainingTopologies.push(j);
            }
            while (remainingTopologies.length > 0 && i < max * 5) {
                var topologyId = remainingTopologies.shift();
                i++;
                if (!this.combineTopology(1, topologyId)) {
                    remainingTopologies.push(topologyId);
                }
            }
        }
    }, {
        key: 'combineTopology',
        value: function combineTopology(a, b) {
            var edges = this.getEdges(a, b);
            if (edges.length === 0) {
                return false;
            }
            var combined = false;
            while (!combined && edges.length > 0) {
                var idx = Core.Utils.getRandom(0, edges.length - 1);
                var edge = edges[idx];
                edges.splice(idx, 1);
                var surroundingTiles = Map.Utils.countSurroundingTiles(this.map, edge);
                if (surroundingTiles === 2) {
                    this.map[edge.x][edge.y] = 0;
                    this.topologies[edge.x][edge.y] = a;
                    combined = true;
                }
            }
            if (combined) {
                for (var x = 0; x < this.width; x++) {
                    for (var y = 0; y < this.height; y++) {
                        if (this.topologies[x][y] === b) {
                            this.topologies[x][y] = a;
                        }
                    }
                }
            }
            return combined;
        }
    }, {
        key: 'getEdges',
        value: function getEdges(a, b) {
            var _this = this;

            var hasTopologyNeighbour = function hasTopologyNeighbour(position, topologyId) {
                var neighbours = Core.Position.getNeighbours(position, -1, -1, true);
                return neighbours.filter(function (position) {
                    return _this.topologies[position.x][position.y] === topologyId;
                }).length > 0;
            };
            var edges = [];
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var position = new Core.Position(x, y);
                    if (hasTopologyNeighbour(position, a) && hasTopologyNeighbour(position, b)) {
                        edges.push(position);
                    }
                }
            }
            return edges;
        }
    }, {
        key: 'addTopology',
        value: function addTopology(position) {
            var _this2 = this;

            var topologyId = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

            var x = position.x;
            var y = position.y;
            if (this.map[x][y] !== 0 || this.topologies[x][y] !== 0) {
                return;
            }
            if (topologyId === -1) {
                this.topologyId++;
                topologyId = this.topologyId;
            }
            this.topologies[x][y] = topologyId;
            var neighbours = Core.Position.getNeighbours(new Core.Position(x, y), -1, -1, true);
            neighbours.forEach(function (position) {
                if (_this2.map[position.x][position.y] === 0 && _this2.topologies[position.x][position.y] === 0) {
                    _this2.addTopology(position, topologyId);
                }
            });
        }
    }]);

    return TopologyCombinator;
}();

exports.TopologyCombinator = TopologyCombinator;

},{"../core":37,"./index":48}],47:[function(require,module,exports){
"use strict";

var Core = require('../core');
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 1] = "None";
    Direction[Direction["North"] = 2] = "North";
    Direction[Direction["East"] = 3] = "East";
    Direction[Direction["South"] = 4] = "South";
    Direction[Direction["West"] = 5] = "West";
})(Direction || (Direction = {}));
var Utils;
(function (Utils) {
    function carveable(map, position) {
        if (position.x < 0 || position.x > map.length - 1) {
            return false;
        }
        if (position.y < 0 || position.y > map[0].length - 1) {
            return false;
        }
        return map[position.x][position.y] === 1;
    }
    function findCarveableSpot(map) {
        var width = map.length;
        var height = map[0].length;
        var position = null;
        var carvablesPositions = [];
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var _position = new Core.Position(Core.Utils.getRandom(0, width), Core.Utils.getRandom(0, height));
                if (Utils.canCarve(map, _position, 0, true)) {
                    carvablesPositions.push(_position);
                }
            }
        }
        if (carvablesPositions.length > 0) {
            return Core.Utils.getRandomIndex(carvablesPositions);
        }
        return null;
    }
    Utils.findCarveableSpot = findCarveableSpot;
    function countSurroundingTiles(map, position) {
        var checkDiagonals = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var connections = 0;
        if (position.y > 0 && map[position.x][position.y - 1] === 0) {
            connections++;
        }
        if (position.y < map[0].length - 1 && map[position.x][position.y + 1] === 0) {
            connections++;
        }
        if (position.x > 0 && map[position.x - 1][position.y] === 0) {
            connections++;
        }
        if (position.x < map.length - 1 && map[position.x + 1][position.y] === 0) {
            connections++;
        }
        if (checkDiagonals) {
            if (position.y > 0 && position.x > 0 && map[position.x - 1][position.y - 1] === 0) {
                connections++;
            }
            if (position.y < map[0].length - 1 && position.x < map.length - 1 && map[position.x + 1][position.y + 1] === 0) {
                connections++;
            }
            if (position.x > 0 && position.y < map[0].length - 1 && map[position.x - 1][position.y + 1] === 0) {
                connections++;
            }
            if (position.x < map.length - 1 && position.y > 0 && map[position.x + 1][position.y - 1] === 0) {
                connections++;
            }
        }
        return connections;
    }
    Utils.countSurroundingTiles = countSurroundingTiles;
    function canCarve(map, position) {
        var allowedConnections = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var checkDiagonals = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        if (!carveable(map, position)) {
            return false;
        }
        var connectedFrom = Direction.None;
        var connections = 0;
        if (position.y > 0 && map[position.x][position.y - 1] === 0) {
            connectedFrom = Direction.North;
            connections++;
        }
        if (position.y < map[0].length - 1 && map[position.x][position.y + 1] === 0) {
            connectedFrom = Direction.South;
            connections++;
        }
        if (position.x > 0 && map[position.x - 1][position.y] === 0) {
            connectedFrom = Direction.West;
            connections++;
        }
        if (position.x < map.length - 1 && map[position.x + 1][position.y] === 0) {
            connectedFrom = Direction.East;
            connections++;
        }
        if (checkDiagonals) {
            if (position.y > 0 && position.x > 0 && map[position.x - 1][position.y - 1] === 0) {
                connections++;
            }
            if (position.y < map[0].length - 1 && position.x < map.length - 1 && map[position.x + 1][position.y + 1] === 0) {
                connections++;
            }
            if (position.x > 0 && position.y < map[0].length - 1 && map[position.x - 1][position.y + 1] === 0) {
                connections++;
            }
            if (position.x < map.length - 1 && position.y > 0 && map[position.x + 1][position.y - 1] === 0) {
                connections++;
            }
        }
        if (connections > allowedConnections) {
            return false;
        }
        return canCarveFrom(map, position, connectedFrom);
    }
    Utils.canCarve = canCarve;
    function canCarveFrom(map, position, direction) {
        if (map[position.x][position.y] === 0) {
            return false;
        }
        switch (direction) {
            case Direction.South:
                return carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x - 1, position.y - 1)) && carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y));
            case Direction.North:
                return carveable(map, new Core.Position(position.x + 1, position.y)) && carveable(map, new Core.Position(position.x + 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1)) && carveable(map, new Core.Position(position.x - 1, position.y + 1)) && carveable(map, new Core.Position(position.x - 1, position.y));
            case Direction.West:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y)) && carveable(map, new Core.Position(position.x + 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1));
            case Direction.East:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x - 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1));
            case Direction.None:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x, position.y + 1)) && carveable(map, new Core.Position(position.x + 1, position.y));
        }
        return false;
    }
    Utils.canCarveFrom = canCarveFrom;
})(Utils = exports.Utils || (exports.Utils = {}));

},{"../core":37}],48:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./RoomGenerator'));
__export(require('./MazeRecursiveBacktrackGenerator'));
__export(require('./Utils'));
__export(require('./TopologyCombinator'));

},{"./MazeRecursiveBacktrackGenerator":44,"./RoomGenerator":45,"./TopologyCombinator":46,"./Utils":47}],49:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = function () {
    function EventHandler() {
        _classCallCheck(this, EventHandler);

        this.listeners = {};
    }

    _createClass(EventHandler, [{
        key: "listen",
        value: function listen(listener) {
            if (!this.listeners) {
                this.listeners = {};
            }
            if (!this.listeners[listener.type]) {
                this.listeners[listener.type] = [];
            }
            this.listeners[listener.type].push(listener);
            this.listeners[listener.type] = this.listeners[listener.type].sort(function (a, b) {
                return a.priority - b.priority;
            });
            return listener;
        }
    }, {
        key: "removeListener",
        value: function removeListener(listener) {
            if (!this.listeners || !this.listeners[listener.type]) {
                return null;
            }
            var idx = this.listeners[listener.type].findIndex(function (l) {
                return l.guid === listener.guid;
            });
            if (typeof idx === 'number') {
                this.listeners[listener.type].splice(idx, 1);
            }
        }
    }, {
        key: "emit",
        value: function emit(event) {
            if (!this.listeners[event.type]) {
                return null;
            }
            var listeners = this.listeners[event.type].map(function (i) {
                return i;
            });
            listeners.forEach(function (listener) {
                listener.callback(event);
            });
        }
    }, {
        key: "is",
        value: function is(event) {
            if (!this.listeners[event.type]) {
                return true;
            }
            var returnedValue = true;
            this.listeners[event.type].forEach(function (listener) {
                if (!returnedValue) {
                    return;
                }
                returnedValue = listener.callback(event);
            });
            return returnedValue;
        }
    }, {
        key: "fire",
        value: function fire(event) {
            if (!this.listeners[event.type]) {
                return null;
            }
            var returnedValue = null;
            this.listeners[event.type].forEach(function (listener) {
                returnedValue = listener.callback(event);
            });
            return returnedValue;
        }
    }, {
        key: "gather",
        value: function gather(event) {
            if (!this.listeners[event.type]) {
                return [];
            }
            var values = [];
            this.listeners[event.type].forEach(function (listener) {
                values.push(listener.callback(event));
            });
            return values;
        }
    }]);

    return EventHandler;
}();

exports.EventHandler = EventHandler;

},{}],50:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./EventHandler'));

},{"./EventHandler":49}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIkdseXBoLnRzIiwiSW5wdXRIYW5kbGVyLnRzIiwiTG9nVmlldy50cyIsIk1hcC50cyIsIk1hcEdlbmVyYXRvci50cyIsIk1hcFZpZXcudHMiLCJQaXhpQ29uc29sZS50cyIsIlNjZW5lLnRzIiwiVGlsZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVGcmVlemVDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvU2xvd0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWFwL01hemVSZWN1cnNpdmVCYWNrdHJhY2tHZW5lcmF0b3IudHMiLCJtYXAvUm9vbUdlbmVyYXRvci50cyIsIm1hcC9Ub3BvbG9neUNvbWJpbmF0b3IudHMiLCJtYXAvVXRpbHMudHMiLCJtYXAvaW5kZXgudHMiLCJtaXhpbnMvRXZlbnRIYW5kbGVyLnRzIiwibWl4aW5zL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsSUFBWSxBQUFJLGVBQU0sQUFBUSxBQUFDO0FBQy9CLElBQU8sQUFBSyxnQkFBVyxBQUFTLEFBQUMsQUFBQyxBQUVsQzs7O0FBOEJFLHFCQUFZLEFBQWEsT0FBRSxBQUFjO1lBQUUsQUFBVSxtRUFBZSxBQUFRO1lBQUUsQUFBVSxtRUFBZSxBQUFROzs7O0FBQzdHLEFBQUksYUFBQyxBQUFNLFNBQUcsQUFBSyxBQUFDO0FBQ3BCLEFBQUksYUFBQyxBQUFPLFVBQUcsQUFBTSxBQUFDO0FBRXRCLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFDakMsQUFBSSxhQUFDLEFBQWlCLG9CQUFHLEFBQU8sQUFBQztBQUVqQyxBQUFJLGFBQUMsQUFBSyxRQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVyxZQUFTLEFBQUksS0FBQyxBQUFLLE9BQUUsQUFBSSxLQUFDLEFBQU0sUUFBRSxBQUFLLE1BQUMsQUFBVSxBQUFDLEFBQUM7QUFDdkYsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBYSxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSSxLQUFDLEFBQWlCLEFBQUMsQUFBQztB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QUFBTyxhQUFFLENBQUMsQUFBQyxHQUFFLEFBQUMsR0FBRSxBQUFDLEFBQUM7QUFDbEIsQUFBTSxZQUFFLENBQUMsQUFBQyxHQUFFLEFBQUMsR0FBRSxBQUFHLEFBQUM7QUFDbkIsQUFBUyxlQUFFLENBQUMsQUFBRyxLQUFFLEFBQUMsR0FBRSxBQUFHLEFBQUM7QUFDeEIsQUFBTSxZQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFHLEFBQUM7QUFDdkIsQUFBTyxhQUFFLENBQUMsQUFBQyxHQUFFLEFBQUcsS0FBRSxBQUFDLEFBQUM7QUFDcEIsQUFBTSxZQUFFLENBQUMsQUFBQyxHQUFFLEFBQUcsS0FBRSxBQUFDLEFBQUM7QUFDbkIsQUFBUSxjQUFFLENBQUMsQUFBRyxLQUFFLEFBQUMsR0FBRSxBQUFDLEFBQUM7QUFDckIsQUFBTSxZQUFFLENBQUMsQUFBQyxHQUFFLEFBQUMsR0FBRSxBQUFHLEFBQUM7QUFDbkIsQUFBTyxhQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFDLEFBQUM7QUFDdEIsQUFBUSxjQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFDLEFBQUM7QUFDdkIsQUFBUSxjQUFFLENBQUMsQUFBRyxLQUFFLEFBQUMsR0FBRSxBQUFHLEFBQUM7QUFDdkIsQUFBSyxXQUFFLENBQUMsQUFBRyxLQUFFLEFBQUMsR0FBRSxBQUFDLEFBQUM7QUFDbEIsQUFBUSxjQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFHLEFBQUM7QUFDekIsQUFBTSxZQUFFLENBQUMsQUFBQyxHQUFFLEFBQUcsS0FBRSxBQUFHLEFBQUM7QUFDckIsQUFBTyxhQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFHLEFBQUM7QUFDeEIsQUFBUSxjQUFFLENBQUMsQUFBRyxLQUFFLEFBQUcsS0FBRSxBQUFDLEFBQUMsQUFDeEIsQUFBQztBQWxCc0I7QUE3TGIsUUFBVSxhQXlTdEI7OztBQzVTRDs7Ozs7OztBQU9FLHNCQUFZLEFBQVMsR0FBRSxBQUFTOzs7QUFDOUIsQUFBSSxh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RSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDM0UsaUJBQUssQUFBUyxVQUFDLEFBQUs7QUFDbEIsQUFBTSx1QkFBQyxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsT0FDekQsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDN0QsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQztBQUMzRSxpQkFBSyxBQUFTLFVBQUMsQUFBSTtBQUNqQixBQUFNLHVCQUFDLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUN6RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLEFBQUMsQUFBQyxPQUM3RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxBQUFDO0FBQzNFLGlCQUFLLEFBQVMsVUFBQyxBQUFJO0FBQ2pCLEFBQU0sdUJBQUMsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ3pELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDM0UsaUJBQUssQUFBUyxVQUFDLEFBQUk7QUFDakIsQUFBTSx1QkFBQyxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDekQsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUM3RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUM3RSxBQUFDOztBQUNELEFBQU0sZUFBQyxBQUFLLEFBQUMsQUFDZjtBQUFDO0FBckNlLFVBQVksZUFxQzNCLEFBQ0g7QUFBQyxHQXZKZ0IsQUFBSyxRQUFMLFFBQUssVUFBTCxRQUFLLFFBdUpyQjs7Ozs7Ozs7OztBQ2pLRCxpQkFBYyxBQUFpQixBQUFDO0FBQ2hDLGlCQUFjLEFBQW1DLEFBQUM7QUFDbEQsaUJBQWMsQUFBUyxBQUFDO0FBQ3hCLGlCQUFjLEFBQXNCLEFBQUM7OztBQ1FyQzs7Ozs7OztBQUFBOzs7QUFDVSxhQUFTLFlBQXlDLEFBQUUsQUFBQyxBQWlGL0Q7QUEvRUUsQUFBTSxBQStFUDs7OzsrQkEvRVEsQUFBeUI7QUFDOUIsQUFBRSxBQUFDLGdCQUFDLENBQUMsQUFBSSxLQUFDLEFBQVMsQUFBQyxXQUFDLEFBQUM7QUFDcEIsQUFBSSxxQkFBQyxBQUFTLFlBQUcsQUFBRSxBQUFDLEFBQ3RCO0FBQUM7QUFDRCxBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQVEsU0FBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDbkMsQUFBSSxxQkFBQyxBQUFTLFVBQUMsQUFBUSxTQUFDLEFBQUksQUFBQyxRQUFHLEFBQUUsQUFBQyxBQUNyQztBQUFDO0FBRUQsQUFBSSxpQkFBQyxBQUFTLFVBQUMsQUFBUSxTQUFDLEFBQUksQUFBQyxNQUFDLEFBQUksS0FBQyxBQUFRLEFBQUMsQUFBQztBQUM3QyxBQUFJLGlCQUFDLEFBQVMsVUFBQyxBQUFRLFNBQUMsQUFBSSxBQUFDLGFBQVEsQUFBUyxVQUFDLEFBQVEsU0FBQyxBQUFJLEFBQUMsTUFBQyxBQUFJLGVBQUUsQUFBa0IsR0FBRSxBQUFrQjtBQUF2Qyx1QkFBNEMsQUFBQyxFQUFDLEFBQVEsV0FBRyxBQUFDLEVBQUMsQUFBUSxBQUFDLEFBQUM7YUFBeEcsQUFBSTtBQUVwQyxBQUFNLG1CQUFDLEFBQVEsQUFBQyxBQUNsQjtBQUFDLEFBRUQsQUFBYzs7O3VDQUFDLEFBQXlCO0FBQ3RDLEFBQUUsQUFBQyxnQkFBQyxDQUFDLEFBQUksS0FBQyxBQUFTLGFBQUksQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQVEsU0FBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDdEQsQUFBTSx1QkFBQyxBQUFJLEFBQUMsQUFDZDtBQUFDO0FBRUQsZ0JBQU0sQUFBRyxXQUFRLEFBQVMsVUFBQyxBQUFRLFNBQUMsQUFBSSxBQUFDLE1BQUMsQUFBUyxVQUFDLFVBQUMsQUFBQztBQUNwRCxBQUFNLHVCQUFDLEFBQUMsRUFBQyxBQUFJLFNBQUssQUFBUSxTQUFDLEFBQUksQUFBQyxBQUNsQztBQUFDLEFBQUMsQUFBQyxhQUZTLEFBQUk7QUFHaEIsQUFBRSxBQUFDLGdCQUFDLE9BQU8sQUFBRyxRQUFLLEFBQVEsQUFBQyxVQUFDLEFBQUM7QUFDNUIsQUFBSSxxQkFBQyxBQUFTLFVBQUMsQUFBUSxTQUFDLEFBQUksQUFBQyxNQUFDLEFBQU0sT0FBQyxBQUFHLEtBQUUsQUFBQyxBQUFDLEFBQUMsQUFDL0M7QUFBQyxBQUNIO0FBQUMsQUFFRCxBQUFJOzs7NkJBQUMsQUFBbUI7QUFDdEIsQUFBRSxBQUFDLGdCQUFDLENBQUMsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFDO0FBQ2hDLEFBQU0sdUJBQUMsQUFBSSxBQUFDLEFBQ2Q7QUFBQztBQUNELGdCQUFNLEFBQVMsaUJBQVEsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsTUFBQyxBQUFHLGNBQUUsQUFBQztBQUFGLHVCQUFPLEFBQUMsQUFBQyxBQUFDO2FBQXpDLEFBQUk7QUFFdEIsQUFBUyxzQkFBQyxBQUFPLFFBQUMsVUFBQyxBQUFRO0FBQ3pCLEFBQVEseUJBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQzNCO0FBQUMsQUFBQyxBQUFDLEFBQ0w7QUFBQyxBQUVELEFBQUU7OzsyQkFBQyxBQUFtQjtBQUNwQixBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDaEMsQUFBTSx1QkFBQyxBQUFJLEFBQUMsQUFDZDtBQUFDO0FBRUQsZ0JBQUksQUFBYSxnQkFBRyxBQUFJLEFBQUM7QUFFekIsQUFBSSxpQkFBQyxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUksQUFBQyxNQUFDLEFBQU8sUUFBQyxVQUFDLEFBQVE7QUFDMUMsQUFBRSxBQUFDLG9CQUFDLENBQUMsQUFBYSxBQUFDLGVBQUMsQUFBQztBQUNuQixBQUFNLEFBQUMsQUFDVDtBQUFDO0FBQ0QsQUFBYSxnQ0FBRyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQzNDO0FBQUMsQUFBQyxBQUFDO0FBQ0gsQUFBTSxtQkFBQyxBQUFhLEFBQUMsQUFDdkI7QUFBQyxBQUVELEFBQUk7Ozs2QkFBQyxBQUFtQjtBQUN0QixBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDaEMsQUFBTSx1QkFBQyxBQUFJLEFBQUMsQUFDZDtBQUFDO0FBRUQsZ0JBQUksQUFBYSxnQkFBRyxBQUFJLEFBQUM7QUFFekIsQUFBSSxpQkFBQyxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUksQUFBQyxNQUFDLEFBQU8sUUFBQyxVQUFDLEFBQVE7QUFDMUMsQUFBYSxnQ0FBRyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQzNDO0FBQUMsQUFBQyxBQUFDO0FBQ0gsQUFBTSxtQkFBQyxBQUFhLEFBQUMsQUFDdkI7QUFBQyxBQUVELEFBQU07OzsrQkFBQyxBQUFtQjtBQUN4QixBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDaEMsQUFBTSx1QkFBQyxBQUFFLEFBQUMsQUFDWjtBQUFDO0FBRUQsZ0JBQUksQUFBTSxTQUFHLEFBQUU7QUFFZixBQUFJLGlCQUFDLEFBQVMsVUFBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLE1BQUMsQUFBTyxRQUFDLFVBQUMsQUFBUTtBQUMxQyxBQUFNLHVCQUFDLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQUMsQUFDeEM7QUFBQyxBQUFDLEFBQUM7QUFDSCxBQUFNLG1CQUFDLEFBQU0sQUFBQyxBQUNoQjtBQUFDLEFBQ0gsQUFBQzs7Ozs7O0FBbEZZLFFBQVksZUFrRnhCOzs7Ozs7Ozs7O0FDN0ZELGlCQUFjLEFBQWdCLEFBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5jbGFzcyBDb25zb2xlIHtcbiAgcHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcbiAgZ2V0IHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcbiAgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgcHJpdmF0ZSBfdGV4dDogbnVtYmVyW11bXTtcbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHQ7XG4gIH1cbiAgcHJpdmF0ZSBfZm9yZTogQ29yZS5Db2xvcltdW107XG4gIGdldCBmb3JlKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JlO1xuICB9XG4gIHByaXZhdGUgX2JhY2s6IENvcmUuQ29sb3JbXVtdO1xuICBnZXQgYmFjaygpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFjaztcbiAgfVxuICBwcml2YXRlIF9pc0RpcnR5OiBib29sZWFuW11bXTtcbiAgZ2V0IGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRGlydHk7XG4gIH1cblxuICBwcml2YXRlIGRlZmF1bHRCYWNrZ3JvdW5kOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGRlZmF1bHRGb3JlZ3JvdW5kOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmb3JlZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGJhY2tncm91bmQ6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCA9IDB4MDAwMDA7XG4gICAgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCA9IDB4ZmZmZmY7XG5cbiAgICB0aGlzLl90ZXh0ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBHbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLl9mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5fYmFjayA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMuX2lzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFuQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX2lzRGlydHlbeF1beV0gPSBmYWxzZTtcbiAgfVxuXG4gIHByaW50KHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbG9yOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYpIHtcbiAgICBsZXQgYmVnaW4gPSAwO1xuICAgIGxldCBlbmQgPSB0ZXh0Lmxlbmd0aDtcbiAgICBpZiAoeCArIGVuZCA+IHRoaXMud2lkdGgpIHtcbiAgICAgIGVuZCA9IHRoaXMud2lkdGggLSB4O1xuICAgIH1cbiAgICBpZiAoeCA8IDApIHtcbiAgICAgIGVuZCArPSB4O1xuICAgICAgeCA9IDA7XG4gICAgfVxuICAgIHRoaXMuc2V0Rm9yZWdyb3VuZChjb2xvciwgeCwgeSwgZW5kLCAxKTtcbiAgICBmb3IgKGxldCBpID0gYmVnaW47IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpcy5zZXRUZXh0KHRleHQuY2hhckNvZGVBdChpKSwgeCArIGksIHkpO1xuICAgIH1cbiAgfVxuXG4gIHNldFRleHQoYXNjaWk6IG51bWJlciB8IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICBpZiAodHlwZW9mIGFzY2lpID09PSAnc3RyaW5nJykge1xuICAgICAgYXNjaWkgPSAoPHN0cmluZz5hc2NpaSkuY2hhckNvZGVBdCgwKTtcbiAgICB9XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fdGV4dCwgYXNjaWksIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0Rm9yZWdyb3VuZChjb2xvcjogQ29yZS5Db2xvciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl9mb3JlLCBjb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBzZXRCYWNrZ3JvdW5kKGNvbG9yOiBDb3JlLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX2JhY2ssIGNvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0TWF0cml4PFQ+KG1hdHJpeDogVFtdW10sIHZhbHVlOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICBpZiAobWF0cml4W2ldW2pdID09PSB2YWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeFtpXVtqXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5W2ldW2pdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0ID0gQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4vbWl4aW5zJztcblxuaW1wb3J0IFBpeGlDb25zb2xlID0gcmVxdWlyZSgnLi9QaXhpQ29uc29sZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vSW5wdXRIYW5kbGVyJyk7XG5cbmltcG9ydCBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxuaW50ZXJmYWNlIEZyYW1lUmVuZGVyZXIge1xuICAoZWxhcHNlZFRpbWU6IG51bWJlcik6IHZvaWQ7XG59XG5sZXQgcmVuZGVyZXI6IEZyYW1lUmVuZGVyZXI7XG5sZXQgZnJhbWVMb29wOiAoY2FsbGJhY2s6IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG5sZXQgZnJhbWVGdW5jID0gKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG4gIHJlbmRlcmVyKGVsYXBzZWRUaW1lKTtcbn1cblxubGV0IGxvb3AgPSAodGhlUmVuZGVyZXI6IEZyYW1lUmVuZGVyZXIpID0+IHtcbiAgcmVuZGVyZXIgPSB0aGVSZW5kZXJlcjtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG59XG5cbmNsYXNzIEVuZ2luZSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcblxuICBwcml2YXRlIHBpeGlDb25zb2xlOiBQaXhpQ29uc29sZTtcblxuICBwcml2YXRlIGdhbWVUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGVuZ2luZVRpY2tzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcbiAgcHJpdmF0ZSBlbmdpbmVUaWNrTGVuZ3RoOiBudW1iZXIgPSAxMDA7XG4gIHByaXZhdGUgZWxhcHNlZFRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdGltZUhhbmRsZXJDb21wb25lbnQ6IENvbXBvbmVudHMuVGltZUhhbmRsZXJDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuICBwcml2YXRlIHRvRGVzdHJveTogRW50aXRpZXMuRW50aXR5W107XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyOiBJbnB1dEhhbmRsZXI7XG4gIGdldCBpbnB1dEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0SGFuZGxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRTY2VuZTogU2NlbmU7XG4gIGdldCBjdXJyZW50U2NlbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTY2VuZTtcbiAgfVxuXG4gIHB1YmxpYyBjdXJyZW50VGljazogbnVtYmVyO1xuICBwdWJsaWMgY3VycmVudFR1cm46IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FudmFzSWQ6IHN0cmluZykge1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5jYW52YXNJZCA9IGNhbnZhc0lkO1xuXG4gICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG5cbiAgICB0aGlzLmN1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gMDtcblxuICAgIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQgPSAxMDtcbiAgICBmcmFtZUxvb3AgPSAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAoPGFueT53aW5kb3cpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbihjYWxsYmFjazogKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCwgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5lbmdpbmVUaWNrTGVuZ3RoID0gMTAwMCAvIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQ7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcih0aGlzKTtcbiAgfVxuXG4gIHN0YXJ0KHNjZW5lOiBTY2VuZSkge1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZSA9IHNjZW5lO1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZS5zdGFydCgpO1xuXG4gICAgbGV0IHRpbWVLZWVwZXIgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMsICd0aW1lS2VlcGVyJyk7XG4gICAgdGhpcy50aW1lSGFuZGxlckNvbXBvbmVudCA9IG5ldyBDb21wb25lbnRzLlRpbWVIYW5kbGVyQ29tcG9uZW50KHRoaXMpO1xuICAgIHRpbWVLZWVwZXIuYWRkQ29tcG9uZW50KHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQpO1xuXG4gICAgdGhpcy5waXhpQ29uc29sZSA9IG5ldyBQaXhpQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5jYW52YXNJZCwgMHhmZmZmZmYsIDB4MDAwMDAwKTtcbiAgICBsb29wKCh0aW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IHRpbWUgLSB0aGlzLmdhbWVUaW1lO1xuXG4gICAgICBpZiAodGhpcy5lbGFwc2VkVGltZSA+PSB0aGlzLmVuZ2luZVRpY2tMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5nYW1lVGltZSA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQuZW5naW5lVGljayh0aGlzLmdhbWVUaW1lKTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdGllcygpO1xuXG4gICAgICAgIHNjZW5lLnJlbmRlcigoY29uc29sZTogQ29uc29sZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgICB0aGlzLnBpeGlDb25zb2xlLmJsaXQoY29uc29sZSwgeCwgeSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5waXhpQ29uc29sZS5yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ3VpZF0gPSBlbnRpdHk7XG4gIH1cblxuICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGVudGl0eSk7XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFbnRpdGllcygpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgIGVudGl0eS5kZXN0cm95KCk7XG4gICAgICB0aGlzLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnZW50aXR5RGVzdHJveWVkJywge2VudGl0eTogZW50aXR5fSkpO1xuICAgICAgZGVsZXRlIHRoaXMuZW50aXRpZXNbZW50aXR5Lmd1aWRdO1xuICAgIH0pO1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG4gIH1cblxuICBnZXRFbnRpdHkoZ3VpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbZ3VpZF07XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbmdpbmUsIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG5cbmV4cG9ydCA9IEVuZ2luZTtcbiIsImV4cG9ydCBjbGFzcyBNaXNzaW5nQ29tcG9uZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5T3ZlcmxhcEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuY2xhc3MgR2x5cGgge1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRlVMTDogbnVtYmVyID0gMTI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1BBQ0U6IG51bWJlciA9IDMyO1xuXHQvLyBzaW5nbGUgd2FsbHNcblx0cHVibGljIHN0YXRpYyBDSEFSX0hMSU5FOiBudW1iZXIgPSAxOTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9WTElORTogbnVtYmVyID0gMTc5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1c6IG51bWJlciA9IDE5MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NFOiBudW1iZXIgPSAyMTg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OVzogbnVtYmVyID0gMjE3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTkU6IG51bWJlciA9IDE5Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVc6IG51bWJlciA9IDE4MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRUU6IG51bWJlciA9IDE5NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRU46IG51bWJlciA9IDE5Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVM6IG51bWJlciA9IDE5NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NST1NTOiBudW1iZXIgPSAxOTc7XG5cdC8vIGRvdWJsZSB3YWxsc1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREhMSU5FOiBudW1iZXIgPSAyMDU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVkxJTkU6IG51bWJlciA9IDE4Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RORTogbnVtYmVyID0gMTg3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRE5XOiBudW1iZXIgPSAyMDE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EU0U6IG51bWJlciA9IDE4ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RTVzogbnVtYmVyID0gMjAwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVc6IG51bWJlciA9IDE4NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVFOiBudW1iZXIgPSAyMDQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFTjogbnVtYmVyID0gMjAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVM6IG51bWJlciA9IDIwMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RDUk9TUzogbnVtYmVyID0gMjA2O1xuXHQvLyBibG9ja3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzE6IG51bWJlciA9IDE3Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMjogbnVtYmVyID0gMTc3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0szOiBudW1iZXIgPSAxNzg7XG5cdC8vIGFycm93cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX046IG51bWJlciA9IDI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfUzogbnVtYmVyID0gMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19FOiBudW1iZXIgPSAyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX1c6IG51bWJlciA9IDI3O1xuXHQvLyBhcnJvd3Mgd2l0aG91dCB0YWlsIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX046IG51bWJlciA9IDMwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1M6IG51bWJlciA9IDMxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX0U6IG51bWJlciA9IDE2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1c6IG51bWJlciA9IDE3O1xuXHQvLyBkb3VibGUgYXJyb3dzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX0g6IG51bWJlciA9IDI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX1Y6IG51bWJlciA9IDE4O1xuXHQvLyBHVUkgc3R1ZmYgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DSEVDS0JPWF9VTlNFVDogbnVtYmVyID0gMjI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0hFQ0tCT1hfU0VUOiBudW1iZXIgPSAyMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SQURJT19VTlNFVDogbnVtYmVyID0gOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JBRElPX1NFVDogbnVtYmVyID0gMTA7XG5cdC8vIHN1Yi1waXhlbCByZXNvbHV0aW9uIGtpdCBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTlc6IG51bWJlciA9IDIyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTkU6IG51bWJlciA9IDIyNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTjogbnVtYmVyID0gMjI4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9TRTogbnVtYmVyID0gMjI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9ESUFHOiBudW1iZXIgPSAyMzA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX0U6IG51bWJlciA9IDIzMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfU1c6IG51bWJlciA9IDIzMjtcblx0Ly8gbWlzY2VsbGFuZW91cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NNSUxJRSA6IG51bWJlciA9ICAxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU01JTElFX0lOViA6IG51bWJlciA9ICAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSEVBUlQgOiBudW1iZXIgPSAgMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJQU1PTkQgOiBudW1iZXIgPSAgNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NMVUIgOiBudW1iZXIgPSAgNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NQQURFIDogbnVtYmVyID0gIDY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVQgOiBudW1iZXIgPSAgNztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVF9JTlYgOiBudW1iZXIgPSAgODtcblx0cHVibGljIHN0YXRpYyBDSEFSX01BTEUgOiBudW1iZXIgPSAgMTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GRU1BTEUgOiBudW1iZXIgPSAgMTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OT1RFIDogbnVtYmVyID0gIDEzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTk9URV9ET1VCTEUgOiBudW1iZXIgPSAgMTQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9MSUdIVCA6IG51bWJlciA9ICAxNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0VYQ0xBTV9ET1VCTEUgOiBudW1iZXIgPSAgMTk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QSUxDUk9XIDogbnVtYmVyID0gIDIwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU0VDVElPTiA6IG51bWJlciA9ICAyMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVU5EIDogbnVtYmVyID0gIDE1Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX01VTFRJUExJQ0FUSU9OIDogbnVtYmVyID0gIDE1ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZVTkNUSU9OIDogbnVtYmVyID0gIDE1OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JFU0VSVkVEIDogbnVtYmVyID0gIDE2OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0hBTEYgOiBudW1iZXIgPSAgMTcxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfT05FX1FVQVJURVIgOiBudW1iZXIgPSAgMTcyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ09QWVJJR0hUIDogbnVtYmVyID0gIDE4NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NFTlQgOiBudW1iZXIgPSAgMTg5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfWUVOIDogbnVtYmVyID0gIDE5MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NVUlJFTkNZIDogbnVtYmVyID0gIDIwNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RIUkVFX1FVQVJURVJTIDogbnVtYmVyID0gIDI0Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJVklTSU9OIDogbnVtYmVyID0gIDI0Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0dSQURFIDogbnVtYmVyID0gIDI0ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX1VNTEFVVCA6IG51bWJlciA9ICAyNDk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1cxIDogbnVtYmVyID0gIDI1MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzMgOiBudW1iZXIgPSAgMjUyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMiA6IG51bWJlciA9ICAyNTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVRfU1FVQVJFIDogbnVtYmVyID0gIDI1NDtcblxuICBwcml2YXRlIF9nbHlwaDogbnVtYmVyO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG4gIHByaXZhdGUgX2ZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGZvcmVncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yZWdyb3VuZENvbG9yO1xuICB9XG4gIHByaXZhdGUgX2JhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGJhY2tncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZzogc3RyaW5nIHwgbnVtYmVyID0gR2x5cGguQ0hBUl9TUEFDRSwgZjogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl9nbHlwaCA9IHR5cGVvZiBnID09PSAnc3RyaW5nJyA/IGcuY2hhckNvZGVBdCgwKSA6IGc7XG4gICAgdGhpcy5fZm9yZWdyb3VuZENvbG9yID0gZjtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgPSBiO1xuICB9XG59XG5cbmV4cG9ydCA9IEdseXBoO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5cbmNsYXNzIElucHV0SGFuZGxlciB7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1BFUklPRDogbnVtYmVyID0gMTkwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9MRUZUOiBudW1iZXIgPSAzNztcbiAgcHVibGljIHN0YXRpYyBLRVlfVVA6IG51bWJlciA9IDM4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9SSUdIVDogbnVtYmVyID0gMzk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0RPV046IG51bWJlciA9IDQwO1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZXzA6IG51bWJlciA9IDQ4O1xuICBwdWJsaWMgc3RhdGljIEtFWV8xOiBudW1iZXIgPSA0OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfMjogbnVtYmVyID0gNTA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzM6IG51bWJlciA9IDUxO1xuICBwdWJsaWMgc3RhdGljIEtFWV80OiBudW1iZXIgPSA1MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfNTogbnVtYmVyID0gNTM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzY6IG51bWJlciA9IDU0O1xuICBwdWJsaWMgc3RhdGljIEtFWV83OiBudW1iZXIgPSA1NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfODogbnVtYmVyID0gNTY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzk6IG51bWJlciA9IDU3O1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZX0E6IG51bWJlciA9IDY1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9COiBudW1iZXIgPSA2NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfQzogbnVtYmVyID0gNjc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0Q6IG51bWJlciA9IDY4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9FOiBudW1iZXIgPSA2OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfRjogbnVtYmVyID1cdDcwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9HOiBudW1iZXIgPVx0NzE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0g6IG51bWJlciA9XHQ3MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfSTogbnVtYmVyID1cdDczO1xuICBwdWJsaWMgc3RhdGljIEtFWV9KOiBudW1iZXIgPVx0NzQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0s6IG51bWJlciA9XHQ3NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfTDogbnVtYmVyID1cdDc2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9NOiBudW1iZXIgPVx0Nzc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX046IG51bWJlciA9XHQ3ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfTzogbnVtYmVyID1cdDc5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9QOiBudW1iZXIgPVx0ODA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1E6IG51bWJlciA9XHQ4MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfUjogbnVtYmVyID1cdDgyO1xuICBwdWJsaWMgc3RhdGljIEtFWV9TOiBudW1iZXIgPVx0ODM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1Q6IG51bWJlciA9XHQ4NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfVTogbnVtYmVyID1cdDg1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9WOiBudW1iZXIgPVx0ODY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1c6IG51bWJlciA9XHQ4NztcbiAgcHVibGljIHN0YXRpYyBLRVlfWDogbnVtYmVyID1cdDg4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9ZOiBudW1iZXIgPVx0ODk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1o6IG51bWJlciA9XHQ5MDtcblxuICBwcml2YXRlIGxpc3RlbmVyczoge1trZXljb2RlOiBudW1iZXJdOiAoKCkgPT4gYW55KVtdfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMubGlzdGVuZXJzW2V2ZW50LmtleUNvZGVdKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tldmVudC5rZXlDb2RlXS5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGxpc3RlbihrZXljb2RlczogbnVtYmVyW10sIGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcbiAgICBrZXljb2Rlcy5mb3JFYWNoKChrZXljb2RlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2tleWNvZGVdKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2tleWNvZGVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlbmVyc1trZXljb2RlXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBJbnB1dEhhbmRsZXI7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgTG9nVmlldyB7XG4gIHByaXZhdGUgY3VycmVudFR1cm46IG51bWJlcjtcbiAgcHJpdmF0ZSBtZXNzYWdlczoge3R1cm46IG51bWJlciwgbWVzc2FnZTogc3RyaW5nfVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG4gIHByaXZhdGUgcGxheWVyOiBFbnRpdGllcy5FbnRpdHk7XG4gIHByaXZhdGUgbWF4TWVzc2FnZXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBlZmZlY3RzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lLCBwcml2YXRlIHdpZHRoOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIsIHBsYXllcjogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSAxO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm1heE1lc3NhZ2VzID0gdGhpcy5oZWlnaHQgLSAxO1xuXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5lZmZlY3RzID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3R1cm4nLFxuICAgICAgdGhpcy5vblR1cm4uYmluZCh0aGlzKVxuICAgICkpO1xuXG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbWVzc2FnZScsXG4gICAgICB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHVybihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50VHVybiA9IGV2ZW50LmRhdGEuY3VycmVudFR1cm47XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCAmJiB0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoIC0gMV0udHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAxMCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGxheWVyKSB7XG4gICAgICB0aGlzLmVmZmVjdHMgPSB0aGlzLnBsYXllci5nYXRoZXIobmV3IEV2ZW50cy5FdmVudCgnZ2V0U3RhdHVzRWZmZWN0JykpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25NZXNzYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQoe1xuICAgICAgICB0dXJuOiB0aGlzLmN1cnJlbnRUdXJuLFxuICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiB0aGlzLm1heE1lc3NhZ2VzKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSkge1xuICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KCcgJywgMCwgMCwgdGhpcy5jb25zb2xlLndpZHRoLCB0aGlzLmNvbnNvbGUuaGVpZ2h0KTtcblxuICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KCcgJywgdGhpcy53aWR0aCAtIDEwLCAwLCAxMCk7XG4gICAgdGhpcy5jb25zb2xlLnByaW50KCdUdXJuOiAnICsgdGhpcy5jdXJyZW50VHVybiwgdGhpcy53aWR0aCAtIDEwLCAwLCAweGZmZmZmZik7XG4gICAgaWYgKHRoaXMuZWZmZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgc3RyID0gdGhpcy5lZmZlY3RzLnJlZHVjZSgoYWNjLCBlZmZlY3QsIGlkeCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICsgZWZmZWN0Lm5hbWUgKyAoaWR4ICE9PSB0aGlzLmVmZmVjdHMubGVuZ3RoIC0gMSA/ICcsICcgOiAnJyk7XG4gICAgICB9LCAnRWZmZWN0czogJyk7XG4gICAgICB0aGlzLmNvbnNvbGUucHJpbnQoc3RyLCAwLCAwLCAweGZmZmZmZik7XG4gICAgfVxuICAgIHRoaXMuY29uc29sZS5wcmludFxuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaCgoZGF0YSwgaWR4KSA9PiB7XG4gICAgICAgIGxldCBjb2xvciA9IDB4ZmZmZmZmO1xuICAgICAgICBpZiAoZGF0YS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDUpIHtcbiAgICAgICAgICBjb2xvciA9IDB4NjY2NjY2O1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAyKSB7XG4gICAgICAgICAgY29sb3IgPSAweGFhYWFhYTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnNvbGUucHJpbnQoZGF0YS5tZXNzYWdlLCAwLCB0aGlzLmhlaWdodCAtIGlkeCwgY29sb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGJsaXRGdW5jdGlvbih0aGlzLmNvbnNvbGUpO1xuICB9XG59XG5cbmV4cG9ydCA9IExvZ1ZpZXc7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi9UaWxlJyk7XG5cbmNsYXNzIE1hcCB7XG4gIHByaXZhdGUgX3dpZHRoO1xuICBnZXQgd2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG4gIHByaXZhdGUgX2hlaWdodDtcbiAgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG4gIHB1YmxpYyB0aWxlczogVGlsZVtdW107XG5cbiAgY29uc3RydWN0b3IodzogbnVtYmVyLCBoOiBudW1iZXIpIHtcbiAgICB0aGlzLl93aWR0aCA9IHc7XG4gICAgdGhpcy5faGVpZ2h0ID0gaDtcbiAgICB0aGlzLnRpbGVzID0gW107XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl93aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLnRpbGVzW3hdID0gW107XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2hlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMudGlsZXNbeF1beV0gPSBUaWxlLmNyZWF0ZVRpbGUoVGlsZS5FTVBUWSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VGlsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IFRpbGUge1xuICAgIHJldHVybiB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldO1xuICB9XG5cbiAgc2V0VGlsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogVGlsZSkge1xuICAgIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSB0aWxlO1xuICB9XG5cbiAgZm9yRWFjaChjYWxsYmFjazogKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLl9oZWlnaHQ7IHkrKykge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl93aWR0aDsgeCsrKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpLCB0aGlzLnRpbGVzW3hdW3ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc1dhbGthYmxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0ud2Fsa2FibGU7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgR2VuZXJhdG9yIGZyb20gJy4vbWFwJztcblxuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5jbGFzcyBNYXBHZW5lcmF0b3Ige1xuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZm9yZWdyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSAweDAwMDAwMDtcbiAgICB0aGlzLmZvcmVncm91bmRDb2xvciA9IDB4YWFhYWFhO1xuICB9XG5cbiAgZ2VuZXJhdGUoKTogTWFwIHtcbiAgICBsZXQgY2VsbHM6IG51bWJlcltdW10gPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAxKTtcbiAgICBsZXQgbWFwID0gbmV3IE1hcCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBsZXQgcm9vbUdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IuUm9vbUdlbmVyYXRvcihjZWxscyk7XG5cbiAgICB3aGlsZSAocm9vbUdlbmVyYXRvci5pdGVyYXRlKCkpIHtcbiAgICB9XG5cbiAgICBjZWxscyA9IHJvb21HZW5lcmF0b3IuZ2V0TWFwKCk7XG5cbiAgICBsZXQgc3RhcnRQb3NpdGlvbiA9IEdlbmVyYXRvci5VdGlscy5maW5kQ2FydmVhYmxlU3BvdChjZWxscyk7XG4gICAgbGV0IG1hemVHZW5lcmF0b3IgPSBudWxsO1xuXG4gICAgd2hpbGUgKHN0YXJ0UG9zaXRpb24gIT09IG51bGwpIHtcbiAgICAgIG1hemVHZW5lcmF0b3IgPSBuZXcgR2VuZXJhdG9yLk1hemVSZWN1cnNpdmVCYWNrdHJhY2tHZW5lcmF0b3IoY2VsbHMsIHN0YXJ0UG9zaXRpb24pO1xuICAgICAgd2hpbGUgKG1hemVHZW5lcmF0b3IuaXRlcmF0ZSgpKSB7IH1cbiAgICAgIGNlbGxzID0gbWF6ZUdlbmVyYXRvci5nZXRNYXAoKTtcbiAgICAgIHN0YXJ0UG9zaXRpb24gPSBHZW5lcmF0b3IuVXRpbHMuZmluZENhcnZlYWJsZVNwb3QoY2VsbHMpO1xuICAgIH1cblxuICAgIGNlbGxzID0gbWF6ZUdlbmVyYXRvci5nZXRNYXAoKTtcblxuICAgIGxldCB0b3BvbG9neUNvbWJpbmF0b3IgPSBuZXcgR2VuZXJhdG9yLlRvcG9sb2d5Q29tYmluYXRvcihjZWxscyk7XG4gICAgdG9wb2xvZ3lDb21iaW5hdG9yLmluaXRpYWxpemUoKTtcbiAgICB0b3BvbG9neUNvbWJpbmF0b3IuY29tYmluZSgpO1xuXG4gICAgY2VsbHMgPSB0b3BvbG9neUNvbWJpbmF0b3IuZ2V0TWFwKCk7XG5cbiAgICBsZXQgdGlsZTogVGlsZTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmIChjZWxsc1t4XVt5XSA9PT0gMCkge1xuICAgICAgICAgIHRpbGUgPSBUaWxlLmNyZWF0ZVRpbGUoVGlsZS5GTE9PUik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlsZSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLldBTEwpO1xuICAgICAgICAgIHRpbGUuZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9CTE9DSzMsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgbWFwLnNldFRpbGUobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICBwcml2YXRlIGdldFdhbGxHbHlwaCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2VsbHM6IG51bWJlcltdW10pOiBHbHlwaCB7XG4gICAgbGV0IFcgPSAoeCA+IDAgJiYgY2VsbHNbeCAtIDFdW3ldID09PSAxKTtcbiAgICBsZXQgRSA9ICh4IDwgdGhpcy53aWR0aCAtIDEgJiYgY2VsbHNbeCArIDFdW3ldID09PSAxKTtcbiAgICBsZXQgTiA9ICh5ID4gMCAmJiBjZWxsc1t4XVt5IC0gMV0gPT09IDEpO1xuICAgIGxldCBTID0gKHkgPCB0aGlzLmhlaWdodCAtIDEgJiYgY2VsbHNbeF1beSArIDFdID09PSAxKTtcblxuICAgIGxldCBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIGlmIChXICYmIEUgJiYgUyAmJiBOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoKFcgfHwgRSkgJiYgIVMgJiYgIU4pIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmICgoUyB8fCBOKSAmJiAhVyAmJiAhRSkge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9WTElORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgRSAmJiAhVyAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgVyAmJiAhRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgRSAmJiAhVyAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiAhRSAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9OVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiBFICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRU4sIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmIChTICYmIFcgJiYgRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9URUVTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBTICYmIEUgJiYgIVcpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgUyAmJiBXICYmICFFKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRVcsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdseXBoO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcEdlbmVyYXRvcjtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuXG5jbGFzcyBNYXBWaWV3IHtcbiAgcHJpdmF0ZSByZW5kZXJhYmxlRW50aXRpZXM6ICh7Z3VpZDogc3RyaW5nLCByZW5kZXJhYmxlOiBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQsIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudH0pW107XG4gIHByaXZhdGUgcmVuZGVyYWJsZUl0ZW1zOiAoe2d1aWQ6IHN0cmluZywgcmVuZGVyYWJsZTogQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50LCBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnR9KVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSBtYXA6IE1hcCwgcHJpdmF0ZSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICAgIHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcyA9IFtdO1xuICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJyxcbiAgICAgIHRoaXMub25SZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsXG4gICAgICB0aGlzLm9uUmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uUmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgcGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZXZlbnQuZGF0YS5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgbGV0IGlkeCA9IG51bGw7XG5cbiAgICBpZiAocGh5c2ljcy5ibG9ja2luZykge1xuICAgICAgaWR4ID0gdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZmluZEluZGV4KChlbnRpdHkpID0+IHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS5ndWlkID09PSBldmVudC5kYXRhLmVudGl0eS5ndWlkO1xuICAgICAgfSk7XG4gICAgICBpZiAoaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZHggPSB0aGlzLnJlbmRlcmFibGVJdGVtcy5maW5kSW5kZXgoKGVudGl0eSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50aXR5Lmd1aWQgPT09IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChpZHggIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCBwaHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5ldmVudC5kYXRhLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcblxuICAgIGlmIChwaHlzaWNzLmJsb2NraW5nKSB7XG4gICAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5wdXNoKHtcbiAgICAgICAgZ3VpZDogZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZCxcbiAgICAgICAgcmVuZGVyYWJsZTogZXZlbnQuZGF0YS5yZW5kZXJhYmxlQ29tcG9uZW50LFxuICAgICAgICBwaHlzaWNzOiBwaHlzaWNzXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMucHVzaCh7XG4gICAgICAgIGd1aWQ6IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQsXG4gICAgICAgIHJlbmRlcmFibGU6IGV2ZW50LmRhdGEucmVuZGVyYWJsZUNvbXBvbmVudCxcbiAgICAgICAgcGh5c2ljczogcGh5c2ljc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKGJsaXRGdW5jdGlvbjogYW55KSB7XG4gICAgdGhpcy5yZW5kZXJNYXAodGhpcy5jb25zb2xlKTtcbiAgICBibGl0RnVuY3Rpb24odGhpcy5jb25zb2xlKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyTWFwKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoY29uc29sZSk7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyhjb25zb2xlKTtcbiAgICB0aGlzLnJlbmRlckVudGl0aWVzKGNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFbnRpdGllcyhjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEucmVuZGVyYWJsZSAmJiBkYXRhLnBoeXNpY3MpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChjb25zb2xlLCBkYXRhLnJlbmRlcmFibGUuZ2x5cGgsIGRhdGEucGh5c2ljcy5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW1zKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZW5kZXJhYmxlICYmIGRhdGEucGh5c2ljcykge1xuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGNvbnNvbGUsIGRhdGEucmVuZGVyYWJsZS5nbHlwaCwgZGF0YS5waHlzaWNzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyR2x5cGgoY29uc29sZTogQ29uc29sZSwgZ2x5cGg6IEdseXBoLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnNvbGUuc2V0VGV4dChnbHlwaC5nbHlwaCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgY29uc29sZS5zZXRGb3JlZ3JvdW5kKGdseXBoLmZvcmVncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJhY2tncm91bmQoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMubWFwLmZvckVhY2goKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSA9PiB7XG4gICAgICBsZXQgZ2x5cGggPSB0aWxlLmdseXBoO1xuICAgICAgY29uc29sZS5zZXRUZXh0KGdseXBoLmdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgIGNvbnNvbGUuc2V0Rm9yZWdyb3VuZChnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgY29uc29sZS5zZXRCYWNrZ3JvdW5kKGdseXBoLmJhY2tncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwVmlldztcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL3R5cGluZ3MvaW5kZXguZC50cycgLz5cblxuaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuXG5jbGFzcyBQaXhpQ29uc29sZSB7XG4gIHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgY2FudmFzSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSB0ZXh0OiBudW1iZXJbXVtdO1xuICBwcml2YXRlIGZvcmU6IENvcmUuQ29sb3JbXVtdO1xuICBwcml2YXRlIGJhY2s6IENvcmUuQ29sb3JbXVtdO1xuICBwcml2YXRlIGlzRGlydHk6IGJvb2xlYW5bXVtdO1xuXG4gIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcbiAgcHJpdmF0ZSBzdGFnZTogUElYSS5Db250YWluZXI7XG5cbiAgcHJpdmF0ZSBsb2FkZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBjaGFyV2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFySGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBmb250OiBQSVhJLkJhc2VUZXh0dXJlO1xuICBwcml2YXRlIGNoYXJzOiBQSVhJLlRleHR1cmVbXTtcblxuICBwcml2YXRlIGZvcmVDZWxsczogUElYSS5TcHJpdGVbXVtdO1xuICBwcml2YXRlIGJhY2tDZWxsczogUElYSS5TcHJpdGVbXVtdO1xuXG4gIHByaXZhdGUgZGVmYXVsdEJhY2tncm91bmQ6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZGVmYXVsdEZvcmVncm91bmQ6IENvcmUuQ29sb3I7XG5cbiAgcHJpdmF0ZSBjYW52YXM6IGFueTtcbiAgcHJpdmF0ZSB0b3BMZWZ0UG9zaXRpb246IENvcmUuUG9zaXRpb247XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbnZhc0lkOiBzdHJpbmcsIGZvcmVncm91bmQ6IENvcmUuQ29sb3IgPSAweGZmZmZmZiwgYmFja2dyb3VuZDogQ29yZS5Db2xvciA9IDB4MDAwMDAwKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhc0lkID0gY2FudmFzSWQ7XG5cbiAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKTtcblxuICAgIHRoaXMubG9hZEZvbnQoKTtcbiAgICB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kID0gMHgwMDAwMDtcbiAgICB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kID0gMHhmZmZmZjtcblxuICAgIHRoaXMudGV4dCA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8bnVtYmVyPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgR2x5cGguQ0hBUl9TUEFDRSk7XG4gICAgdGhpcy5mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5iYWNrID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgdGhpcy5pc0RpcnR5ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG4gIH1cblxuICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgbG9hZEZvbnQoKSB7XG4gICAgbGV0IGZvbnRVcmwgPSAnLi90ZXJtaW5hbDE2eDE2LnBuZyc7XG4gICAgdGhpcy5mb250ID0gUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoZm9udFVybCwgZmFsc2UsIFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVCk7XG4gICAgaWYgKHRoaXMuZm9udC5oYXNMb2FkZWQpIHtcbiAgICAgIHRoaXMub25Gb250TG9hZGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9udC5vbignbG9hZGVkJywgdGhpcy5vbkZvbnRMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZvbnRMb2FkZWQoKSB7XG4gICAgdGhpcy5jaGFyV2lkdGggPSB0aGlzLmZvbnQud2lkdGggLyAxNjtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSB0aGlzLmZvbnQuaGVpZ2h0IC8gMTY7XG5cbiAgICB0aGlzLmluaXRDYW52YXMoKTtcbiAgICB0aGlzLmluaXRDaGFyYWN0ZXJNYXAoKTtcbiAgICB0aGlzLmluaXRCYWNrZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmluaXRGb3JlZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmFkZEdyaWRPdmVybGF5KClcbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgLy90aGlzLmFuaW1hdGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdENhbnZhcygpIHtcbiAgICBsZXQgY2FudmFzV2lkdGggPSB0aGlzLndpZHRoICogdGhpcy5jaGFyV2lkdGg7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IHRoaXMuaGVpZ2h0ICogdGhpcy5jaGFySGVpZ2h0O1xuXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNhbnZhc0lkKTtcblxuICAgIGxldCBwaXhpT3B0aW9ucyA9IHtcbiAgICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgICBjbGVhckJlZm9yZVJlbmRlcjogZmFsc2UsXG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICAgICAgcmVzb2x1dGlvbjogMSxcbiAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpLFxuICAgICAgdmlldzogdGhpcy5jYW52YXNcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcihjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBwaXhpT3B0aW9ucyk7XG4gICAgdGhpcy5yZW5kZXJlci5iYWNrZ3JvdW5kQ29sb3IgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgdGhpcy50b3BMZWZ0UG9zaXRpb24gPSBuZXcgQ29yZS5Qb3NpdGlvbih0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0LCB0aGlzLmNhbnZhcy5vZmZzZXRUb3ApO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q2hhcmFjdGVyTWFwKCkge1xuICAgIHRoaXMuY2hhcnMgPSBbXTtcbiAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCAxNjsgeCsrKSB7XG4gICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCAxNjsgeSsrKSB7XG4gICAgICAgIGxldCByZWN0ID0gbmV3IFBJWEkuUmVjdGFuZ2xlKHggKiB0aGlzLmNoYXJXaWR0aCwgeSAqIHRoaXMuY2hhckhlaWdodCwgdGhpcy5jaGFyV2lkdGgsIHRoaXMuY2hhckhlaWdodCk7XG4gICAgICAgIHRoaXMuY2hhcnNbeCArIHkgKiAxNl0gPSBuZXcgUElYSS5UZXh0dXJlKHRoaXMuZm9udCwgcmVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0QmFja2dyb3VuZENlbGxzKCkge1xuICAgIHRoaXMuYmFja0NlbGxzID0gW107XG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLmJhY2tDZWxsc1t4XSA9IFtdO1xuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmNoYXJzW0dseXBoLkNIQVJfRlVMTF0pO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnggPSB4ICogdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueSA9IHkgKiB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwud2lkdGggPSB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5oZWlnaHQgPSB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwudGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICAgICAgdGhpcy5iYWNrQ2VsbHNbeF1beV0gPSBjZWxsO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdEZvcmVncm91bmRDZWxscygpIHtcbiAgICB0aGlzLmZvcmVDZWxscyA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLmZvcmVDZWxsc1t4XSA9IFtdO1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuY2hhcnNbR2x5cGguQ0hBUl9TUEFDRV0pO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnggPSB4ICogdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueSA9IHkgKiB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwud2lkdGggPSB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5oZWlnaHQgPSB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwudGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICAgICAgdGhpcy5mb3JlQ2VsbHNbeF1beV0gPSBjZWxsO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkR3JpZE92ZXJsYXkoKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICAgIGNlbGwubGluZVN0eWxlKDEsIDB4NDQ0NDQ0LCAwLjUpO1xuICAgICAgICBjZWxsLmJlZ2luRmlsbCgwLCAwKTtcbiAgICAgICAgY2VsbC5kcmF3UmVjdCh4ICogdGhpcy5jaGFyV2lkdGgsIHkgKiB0aGlzLmNoYXJIZWlnaHQsIHRoaXMuY2hhcldpZHRoLCB0aGlzLmNoYXJIZWlnaHQpO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gIHByaXZhdGUgYW5pbWF0ZSgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpO1xuICB9XG4gICovXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gICAgfVxuICB9XG5cbiAgYmxpdChjb25zb2xlOiBDb25zb2xlLCBvZmZzZXRYOiBudW1iZXIgPSAwLCBvZmZzZXRZOiBudW1iZXIgPSAwLCBmb3JjZURpcnR5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29uc29sZS53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNvbnNvbGUuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGZvcmNlRGlydHkgfHwgY29uc29sZS5pc0RpcnR5W3hdW3ldKSB7XG4gICAgICAgICAgbGV0IGFzY2lpID0gY29uc29sZS50ZXh0W3hdW3ldO1xuICAgICAgICAgIGxldCBweCA9IG9mZnNldFggKyB4O1xuICAgICAgICAgIGxldCBweSA9IG9mZnNldFkgKyB5O1xuICAgICAgICAgIGlmIChhc2NpaSA+IDAgJiYgYXNjaWkgPD0gMjU1KSB7XG4gICAgICAgICAgICB0aGlzLmZvcmVDZWxsc1tweF1bcHldLnRleHR1cmUgPSB0aGlzLmNoYXJzW2FzY2lpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5mb3JlQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuZm9yZVt4XVt5XSk7XG4gICAgICAgICAgdGhpcy5iYWNrQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuYmFja1t4XVt5XSk7XG4gICAgICAgICAgY29uc29sZS5jbGVhbkNlbGwoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbkZyb21QaXhlbHMoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogQ29yZS5Qb3NpdGlvbiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSk7XG4gICAgfSBcbiAgICBsZXQgZHg6IG51bWJlciA9IHggLSB0aGlzLnRvcExlZnRQb3NpdGlvbi54O1xuICAgIGxldCBkeTogbnVtYmVyID0geSAtIHRoaXMudG9wTGVmdFBvc2l0aW9uLnk7XG4gICAgbGV0IHJ4ID0gTWF0aC5mbG9vcihkeCAvIHRoaXMuY2hhcldpZHRoKTtcbiAgICBsZXQgcnkgPSBNYXRoLmZsb29yKGR5IC8gdGhpcy5jaGFySGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IENvcmUuUG9zaXRpb24ocngsIHJ5KTtcbiAgfVxufVxuXG5leHBvcnQgPSBQaXhpQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi9FeGNlcHRpb25zJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuaW1wb3J0IE1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vTWFwR2VuZXJhdG9yJyk7XG5pbXBvcnQgTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi9UaWxlJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmltcG9ydCBNYXBWaWV3ID0gcmVxdWlyZSgnLi9NYXBWaWV3Jyk7XG5pbXBvcnQgTG9nVmlldyA9IHJlcXVpcmUoJy4vTG9nVmlldycpO1xuXG5jbGFzcyBTY2VuZSB7XG4gIHByaXZhdGUgX2VuZ2luZTogRW5naW5lO1xuICBnZXQgZW5naW5lKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmdpbmU7XG4gIH1cblxuICBwcml2YXRlIF9tYXA6IE1hcDtcbiAgZ2V0IG1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgbG9nVmlldzogTG9nVmlldztcbiAgcHJpdmF0ZSBtYXBWaWV3OiBNYXBWaWV3O1xuXG4gIHByaXZhdGUgcGxheWVyOiBFbnRpdGllcy5FbnRpdHk7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgQ29yZS5Qb3NpdGlvbi5zZXRNYXhWYWx1ZXModGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICBsZXQgbWFwR2VuZXJhdG9yID0gbmV3IE1hcEdlbmVyYXRvcih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDUpO1xuICAgIHRoaXMuX21hcCA9IG1hcEdlbmVyYXRvci5nZW5lcmF0ZSgpO1xuXG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5tYXBWaWV3ID0gbmV3IE1hcFZpZXcodGhpcy5lbmdpbmUsIHRoaXMubWFwLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0KTtcblxuICAgIHRoaXMuZ2VuZXJhdGVXaWx5KCk7XG4gICAgdGhpcy5sb2dWaWV3ID0gbmV3IExvZ1ZpZXcodGhpcy5lbmdpbmUsIHRoaXMud2lkdGgsIDUsIHRoaXMucGxheWVyKTtcblxuICAgIHRoaXMuZ2VuZXJhdGVSYXRzKCk7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlV2lseSgpIHtcbiAgICB0aGlzLnBsYXllciA9IEVudGl0aWVzLmNyZWF0ZVdpbHkodGhpcy5lbmdpbmUpO1xuICAgIHRoaXMucG9zaXRpb25FbnRpdHkodGhpcy5wbGF5ZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJhdHMobnVtOiBudW1iZXIgPSAxMCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVSYXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlUmF0KCkge1xuICAgIHRoaXMucG9zaXRpb25FbnRpdHkoRW50aXRpZXMuY3JlYXRlUmF0KHRoaXMuZW5naW5lKSk7XG4gIH1cblxuICBwcml2YXRlIHBvc2l0aW9uRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgbGV0IGNvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIGxldCBwb3NpdGlvbmVkID0gZmFsc2U7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgcG9zaXRpb24gPSBudWxsO1xuICAgIHdoaWxlICh0cmllcyA8IDEwMDAgJiYgIXBvc2l0aW9uZWQpIHtcbiAgICAgIHBvc2l0aW9uID0gQ29yZS5Qb3NpdGlvbi5nZXRSYW5kb20oKTtcbiAgICAgIHBvc2l0aW9uZWQgPSB0aGlzLmlzV2l0aG91dEVudGl0eShwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uZWQpIHtcbiAgICAgIGNvbXBvbmVudC5tb3ZlVG8ocG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnaXNXaXRob3V0RW50aXR5JywgXG4gICAgICB0aGlzLm9uSXNXaXRob3V0RW50aXR5LmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZEZyb20nLCBcbiAgICAgIHRoaXMub25Nb3ZlZEZyb20uYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLCBcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdnZXRUaWxlJywgXG4gICAgICB0aGlzLm9uR2V0VGlsZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uR2V0VGlsZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHBvc2l0aW9uID0gZXZlbnQuZGF0YS5wb3NpdGlvbjtcbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRGcm9tKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uKTtcbiAgICBpZiAoIWV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5ibG9ja2luZykge1xuICAgICAgZGVsZXRlIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbGUuZW50aXR5ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRUbyhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbik7XG4gICAgaWYgKCFldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQuYmxvY2tpbmcpIHtcbiAgICAgIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF0gPSBldmVudC5kYXRhLmVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRpbGUuZW50aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb25zLkVudGl0eU92ZXJsYXBFcnJvcignVHdvIGVudGl0aWVzIGNhbm5vdCBiZSBhdCB0aGUgc2FtZSBzcG90Jyk7XG4gICAgICB9XG4gICAgICB0aWxlLmVudGl0eSA9IGV2ZW50LmRhdGEuZW50aXR5O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Jc1dpdGhvdXRFbnRpdHkoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGJvb2xlYW4ge1xuICAgIGxldCBwb3NpdGlvbiA9IGV2ZW50LmRhdGEucG9zaXRpb247XG4gICAgcmV0dXJuIHRoaXMuaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGlsZS53YWxrYWJsZSAmJiB0aWxlLmVudGl0eSA9PT0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSk6IHZvaWQge1xuICAgIHRoaXMubWFwVmlldy5yZW5kZXIoKGNvbnNvbGU6IENvbnNvbGUpID0+IHtcbiAgICAgIGJsaXRGdW5jdGlvbihjb25zb2xlLCAwLCAwKTtcbiAgICB9KTtcbiAgICB0aGlzLmxvZ1ZpZXcucmVuZGVyKChjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICBibGl0RnVuY3Rpb24oY29uc29sZSwgMCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBTY2VuZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmludGVyZmFjZSBUaWxlRGVzY3JpcHRpb24ge1xuICBnbHlwaDogR2x5cGg7XG4gIHdhbGthYmxlOiBib29sZWFuO1xuICBibG9ja3NTaWdodDogYm9vbGVhbjtcbn1cblxuY2xhc3MgVGlsZSB7XG4gIHB1YmxpYyBnbHlwaDogR2x5cGg7XG4gIHB1YmxpYyB3YWxrYWJsZTogYm9vbGVhbjtcbiAgcHVibGljIGJsb2Nrc1NpZ2h0OiBib29sZWFuO1xuICBwdWJsaWMgZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIHB1YmxpYyBwcm9wczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRU1QVFk6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfU1BBQ0UsIDB4ZmZmZmZmLCAweDAwMDAwMCksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRkxPT1I6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKCdcXCcnLCAweDIyMjIyMiwgMHgwMDAwMDApLFxuICAgIHdhbGthYmxlOiB0cnVlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgV0FMTDogVGlsZURlc2NyaXB0aW9uID0ge1xuICAgIGdseXBoOiBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ITElORSwgMHhmZmZmZmYsIDB4MDAwMDAwKSxcbiAgICB3YWxrYWJsZTogZmFsc2UsXG4gICAgYmxvY2tzU2lnaHQ6IHRydWUsXG4gIH07XG5cbiAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCB3YWxrYWJsZTogYm9vbGVhbiwgYmxvY2tzU2lnaHQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmdseXBoID0gZ2x5cGg7XG4gICAgdGhpcy53YWxrYWJsZSA9IHdhbGthYmxlO1xuICAgIHRoaXMuYmxvY2tzU2lnaHQgPSBibG9ja3NTaWdodDtcbiAgICB0aGlzLmVudGl0eSA9IG51bGw7XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVUaWxlKGRlc2M6IFRpbGVEZXNjcmlwdGlvbikge1xuICAgIHJldHVybiBuZXcgVGlsZShkZXNjLmdseXBoLCBkZXNjLndhbGthYmxlLCBkZXNjLmJsb2Nrc1NpZ2h0KTtcbiAgfVxufVxuXG5leHBvcnQgPSBUaWxlO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgU2NlbmUgPSByZXF1aXJlKCcuL1NjZW5lJyk7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGxldCBlbmdpbmUgPSBuZXcgRW5naW5lKDYwLCA0MCwgJ3JvZ3VlJyk7XG4gIGxldCBzY2VuZSA9IG5ldyBTY2VuZShlbmdpbmUsIDYwLCA0MCk7XG4gIGVuZ2luZS5zdGFydChzY2VuZSk7XG59O1xuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcblxuZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG4gIHByb3RlY3RlZCBjb3N0OiBudW1iZXIgPSAxMDA7XG4gIGFjdCgpOiBudW1iZXIge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdBY3Rpb24uYWN0IG11c3QgYmUgb3ZlcndyaXR0ZW4nKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5cbmV4cG9ydCBjbGFzcyBCZWhhdmlvdXIge1xuICBwcm90ZWN0ZWQgbmV4dEFjdGlvbjogQmVoYXZpb3Vycy5BY3Rpb247XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICB9XG4gIGdldE5leHRBY3Rpb24oKTogQmVoYXZpb3Vycy5BY3Rpb24ge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdCZWhhdmlvdXIuZ2V0TmV4dEFjdGlvbiBtdXN0IGJlIG92ZXJ3cml0dGVuJyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBOdWxsQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBhY3QoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmFuZG9tV2Fsa0JlaGF2aW91ciBleHRlbmRzIEJlaGF2aW91cnMuQmVoYXZpb3VyIHtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVuZ2luZTogRW5naW5lLCBwcm90ZWN0ZWQgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgZ2V0TmV4dEFjdGlvbigpOiBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gICAgbGV0IHBvc2l0aW9ucyA9IENvcmUuVXRpbHMucmFuZG9taXplQXJyYXkoQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbikpO1xuICAgIGxldCBpc1dpdGhvdXRFbnRpdHkgPSBmYWxzZTtcbiAgICBsZXQgcG9zaXRpb246IENvcmUuUG9zaXRpb24gPSBudWxsO1xuICAgIHdoaWxlKCFpc1dpdGhvdXRFbnRpdHkgJiYgcG9zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb25zLnBvcCgpO1xuICAgICAgaXNXaXRob3V0RW50aXR5ID0gdGhpcy5lbmdpbmUuaXMobmV3IEV2ZW50cy5FdmVudCgnaXNXaXRob3V0RW50aXR5Jywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGlzV2l0aG91dEVudGl0eSkge1xuICAgICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLldhbGtBY3Rpb24odGhpcy5waHlzaWNzQ29tcG9uZW50LCBwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5OdWxsQWN0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBXYWxrQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCwgcHJpdmF0ZSBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhY3QoKTogbnVtYmVyIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQubW92ZVRvKHRoaXMucG9zaXRpb24pO1xuICAgIHJldHVybiB0aGlzLmNvc3Q7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5cbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi4vVGlsZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFdyaXRlUnVuZUFjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgcHJpdmF0ZSBlbmdpbmU6IEVuZ2luZTtcbiAgcHJpdmF0ZSBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLnBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIGFjdCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHJ1bmUgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMuZW5naW5lLCAnUnVuZScsICdydW5lJyk7XG4gICAgcnVuZS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCh0aGlzLmVuZ2luZSwge1xuICAgICAgcG9zaXRpb246IHRoaXMucGh5c2ljcy5wb3NpdGlvbixcbiAgICAgIGJsb2NraW5nOiBmYWxzZVxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCcjJywgMHg0NGZmODgsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5TZWxmRGVzdHJ1Y3RDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIHR1cm5zOiAxMFxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lRnJlZXplQ29tcG9uZW50KHRoaXMuZW5naW5lKSk7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9BY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9CZWhhdmlvdXInO1xuZXhwb3J0ICogZnJvbSAnLi9XYWxrQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vTnVsbEFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1dyaXRlUnVuZUFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1JhbmRvbVdhbGtCZWhhdmlvdXInO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gIHByb3RlY3RlZCBsaXN0ZW5lcnM6IEV2ZW50cy5MaXN0ZW5lcltdO1xuXG4gIHByb3RlY3RlZCBfZ3VpZDogc3RyaW5nO1xuICBnZXQgZ3VpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ3VpZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIGdldCBlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VudGl0eTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW5naW5lOiBFbmdpbmU7XG4gIGdldCBlbmdpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiBhbnkgPSB7fSkge1xuICAgIHRoaXMuX2d1aWQgPSBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICAgIHRoaXMuX2VuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcmVnaXN0ZXJFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLl9lbnRpdHkgPSBlbnRpdHk7XG4gICAgdGhpcy5jaGVja1JlcXVpcmVtZW50cygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjaGVja1JlcXVpcmVtZW50cygpOiB2b2lkIHtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzIHx8IHR5cGVvZiB0aGlzLmxpc3RlbmVycy5mb3JFYWNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignYHRoaXMubGlzdGVuZXJzYCBoYXMgYmVlbiByZWRlZmluZWQsIGRlZmF1bHQgYGRlc3Ryb3lgIGZ1bmN0aW9uIHNob3VsZCBub3QgYmUgdXNlZC4gRm9yOiAnICsgdGhpcy5lbnRpdHkubmFtZSk7XG4gICAgfVxuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB0aGlzLmVudGl0eS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgfSk7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgRW5lcmd5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50RW5lcmd5OiBudW1iZXI7XG4gIGdldCBjdXJyZW50RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTogbnVtYmVyO1xuICBnZXQgZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX21heEVuZXJneTogbnVtYmVyO1xuICBnZXQgbWF4RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9tYXhFbmVyZ3k7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JlZ2VucmF0YXRpb25SYXRlOiBudW1iZXIsIG1heDogbnVtYmVyfSA9IHtyZWdlbnJhdGF0aW9uUmF0ZTogMTAwLCBtYXg6IDEwMH0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSB0aGlzLl9tYXhFbmVyZ3kgPSBkYXRhLm1heDtcbiAgICB0aGlzLl9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlID0gZGF0YS5yZWdlbnJhdGF0aW9uUmF0ZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKSxcbiAgICAgIDFcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHJhdGUgPSB0aGlzLl9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlO1xuICAgIGxldCByYXRlTW9kaWZpZXJzID0gdGhpcy5lbnRpdHkuZ2F0aGVyKG5ldyBFdmVudHMuRXZlbnQoJ29uRW5lcmd5UmVnZW5lcmF0aW9uJykpO1xuICAgIHJhdGVNb2RpZmllcnMuZm9yRWFjaCgobW9kaWZpZXIpID0+IHtcbiAgICAgIHJhdGUgPSByYXRlICogbW9kaWZpZXI7XG4gICAgfSk7XG4gICAgdGhpcy5fY3VycmVudEVuZXJneSA9IE1hdGgubWluKHRoaXMubWF4RW5lcmd5LCB0aGlzLl9jdXJyZW50RW5lcmd5ICsgcmF0ZSk7XG4gIH1cblxuICB1c2VFbmVyZ3koZW5lcmd5OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSB0aGlzLl9jdXJyZW50RW5lcmd5IC0gZW5lcmd5O1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBIZWFsdGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgICdkYW1hZ2UnLFxuICAgICAgdGhpcy5vbkRhbWFnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uRGFtYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21lc3NhZ2UnLCB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuZW50aXR5Lm5hbWUgKyAnIHdhcyBraWxsZWQgYnkgJyArIGV2ZW50LmRhdGEuc291cmNlLm5hbWUgKyAnLicsXG4gICAgICAgIHRhcmdldDogdGhpcy5lbnRpdHlcbiAgICAgIH0pKTtcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuXG5pbXBvcnQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi4vSW5wdXRIYW5kbGVyJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG4gIHByaXZhdGUgaGFzRm9jdXM6IGJvb2xlYW47XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5lbmVyZ3lDb21wb25lbnQgPSA8Q29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50KTtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcblxuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9VUCwgSW5wdXRIYW5kbGVyLktFWV9LXSwgXG4gICAgICB0aGlzLm9uTW92ZVVwLmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9VXSxcbiAgICAgIHRoaXMub25Nb3ZlVXBSaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfUklHSFQsIElucHV0SGFuZGxlci5LRVlfTF0sIFxuICAgICAgdGhpcy5vbk1vdmVSaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfTl0sXG4gICAgICB0aGlzLm9uTW92ZURvd25SaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfRE9XTiwgSW5wdXRIYW5kbGVyLktFWV9KXSwgXG4gICAgICB0aGlzLm9uTW92ZURvd24uYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0JdLFxuICAgICAgdGhpcy5vbk1vdmVEb3duTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfTEVGVCwgSW5wdXRIYW5kbGVyLktFWV9IXSwgXG4gICAgICB0aGlzLm9uTW92ZUxlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1ldLFxuICAgICAgdGhpcy5vbk1vdmVVcExlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1BFUklPRF0sIFxuICAgICAgdGhpcy5vbldhaXQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZXzBdLCBcbiAgICAgIHRoaXMub25UcmFwT25lLmJpbmQodGhpcylcbiAgICApO1xuICB9XG5cbiAgb25UaWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5lbmVyZ3lDb21wb25lbnQuY3VycmVudEVuZXJneSA+PSAxMDApIHtcbiAgICAgIHRoaXMuYWN0KCk7XG4gICAgfVxuICB9XG5cbiAgYWN0KCkge1xuICAgIHRoaXMuaGFzRm9jdXMgPSB0cnVlO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncGF1c2VUaW1lJykpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZXJmb3JtQWN0aW9uKGFjdGlvbjogQmVoYXZpb3Vycy5BY3Rpb24pIHtcbiAgICB0aGlzLmhhc0ZvY3VzID0gZmFsc2U7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdyZXN1bWVUaW1lJykpO1xuICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbldhaXQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucGVyZm9ybUFjdGlvbihuZXcgQmVoYXZpb3Vycy5OdWxsQWN0aW9uKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblRyYXBPbmUoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMuZW50aXR5LmZpcmUobmV3IEV2ZW50cy5FdmVudCgnd3JpdGVSdW5lJywge30pKTtcbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICB0aGlzLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDAsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgMCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDAsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93bkxlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgMCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcExlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZU1vdmVtZW50KGRpcmVjdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gQ29yZS5Qb3NpdGlvbi5hZGQodGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLCBkaXJlY3Rpb24pO1xuICAgIGNvbnN0IGlzV2l0aG91dEVudGl0eSA9IHRoaXMuZW5naW5lLmlzKG5ldyBFdmVudHMuRXZlbnQoJ2lzV2l0aG91dEVudGl0eScsIHtwb3NpdGlvbjogcG9zaXRpb259KSk7XG4gICAgaWYgKGlzV2l0aG91dEVudGl0eSkge1xuICAgICAgdGhpcy5wZXJmb3JtQWN0aW9uKG5ldyBCZWhhdmlvdXJzLldhbGtBY3Rpb24odGhpcy5waHlzaWNzQ29tcG9uZW50LCBwb3NpdGlvbikpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFBoeXNpY3NDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2Jsb2NraW5nOiBib29sZWFuO1xuICBnZXQgYmxvY2tpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Jsb2NraW5nO1xuICB9XG4gIHByaXZhdGUgX3Bvc2l0aW9uOiBDb3JlLlBvc2l0aW9uO1xuICBnZXQgcG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgYmxvY2tpbmc6IGJvb2xlYW59ID0ge3Bvc2l0aW9uOiBudWxsLCBibG9ja2luZzogdHJ1ZX0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX3Bvc2l0aW9uID0gZGF0YS5wb3NpdGlvbjtcbiAgICB0aGlzLl9ibG9ja2luZyA9IGRhdGEuYmxvY2tpbmc7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGlmICh0aGlzLnBvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkVG8nLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRGcm9tJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gIH1cblxuICBtb3ZlVG8ocG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5fcG9zaXRpb24pIHtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRGcm9tJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgfVxuICAgIHRoaXMuX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZFRvJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSZW5kZXJhYmxlQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9nbHlwaDogR2x5cGg7XG4gIGdldCBnbHlwaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2x5cGg7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge2dseXBoOiBHbHlwaH0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX2dseXBoID0gZGF0YS5nbHlwaDtcbiAgfVxuXG4gIHByb3RlY3RlZCBjaGVja1JlcXVpcmVtZW50cygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZW50aXR5Lmhhc0NvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nQ29tcG9uZW50RXJyb3IoJ1JlbmRlcmFibGVDb21wb25lbnQgcmVxdWlyZXMgUGh5c2ljc0NvbXBvbmVudCcpO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQnLCB7ZW50aXR5OiB0aGlzLmVudGl0eSwgcmVuZGVyYWJsZUNvbXBvbmVudDogdGhpc30pKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdyZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkJywge2VudGl0eTogdGhpcy5lbnRpdHksIHJlbmRlcmFibGVDb21wb25lbnQ6IHRoaXN9KSk7XG4gIH1cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuLi9iZWhhdmlvdXJzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIFJvYW1pbmdBSUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBlbmVyZ3lDb21wb25lbnQ6IENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50O1xuXG4gIHByaXZhdGUgcmFuZG9tV2Fsa0JlaGF2aW91cjogQmVoYXZpb3Vycy5SYW5kb21XYWxrQmVoYXZpb3VyO1xuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50ID0gPENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudCk7XG4gICAgdGhpcy5yYW5kb21XYWxrQmVoYXZpb3VyID0gbmV3IEJlaGF2aW91cnMuUmFuZG9tV2Fsa0JlaGF2aW91cih0aGlzLmVuZ2luZSwgdGhpcy5lbnRpdHkpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndGljaycsXG4gICAgICB0aGlzLm9uVGljay5iaW5kKHRoaXMpXG4gICAgKSkpO1xuICB9XG5cbiAgb25UaWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5lbmVyZ3lDb21wb25lbnQuY3VycmVudEVuZXJneSA+PSAxMDApIHtcbiAgICAgIGxldCBhY3Rpb24gPSB0aGlzLnJhbmRvbVdhbGtCZWhhdmlvdXIuZ2V0TmV4dEFjdGlvbigpO1xuICAgICAgdGhpcy5lbmVyZ3lDb21wb25lbnQudXNlRW5lcmd5KGFjdGlvbi5hY3QoKSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSdW5lRGFtYWdlQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIHJhZGl1czogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJnZXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtyYWRpdXM6IG51bWJlciwgY2hhcmdlczogbnVtYmVyfSA9IHtyYWRpdXM6IDEsIGNoYXJnZXM6IDF9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLnJhZGl1cyA9IGRhdGEucmFkaXVzO1xuICAgIHRoaXMuY2hhcmdlcyA9IGRhdGEuY2hhcmdlcztcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZWRUbycsXG4gICAgICB0aGlzLm9uTW92ZWRUby5iaW5kKHRoaXMpLFxuICAgICAgNTBcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRUbyhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuY2hhcmdlcyA8PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGV2ZW50UG9zaXRpb24gPSBldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb247IFxuICAgIGlmIChldmVudFBvc2l0aW9uLnggPT0gdGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLnggJiYgXG4gICAgICAgIGV2ZW50UG9zaXRpb24ueSA9PT0gdGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLnkpIHtcbiAgICAgIGV2ZW50LmRhdGEuZW50aXR5LmVtaXQobmV3IEV2ZW50cy5FdmVudCgnZGFtYWdlJywge1xuICAgICAgICBzb3VyY2U6IHRoaXMuZW50aXR5XG4gICAgICB9KSk7XG4gICAgICB0aGlzLmNoYXJnZXMtLTtcbiAgICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZUZyZWV6ZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmFkaXVzOiBudW1iZXIsIGNoYXJnZXM6IG51bWJlcn0gPSB7cmFkaXVzOiAxLCBjaGFyZ2VzOiAxfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5yYWRpdXMgPSBkYXRhLnJhZGl1cztcbiAgICB0aGlzLmNoYXJnZXMgPSBkYXRhLmNoYXJnZXM7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBldmVudFBvc2l0aW9uID0gZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uOyBcbiAgICBpZiAoZXZlbnRQb3NpdGlvbi54ID09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi54ICYmIFxuICAgICAgICBldmVudFBvc2l0aW9uLnkgPT09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi55KSB7XG4gICAgICBldmVudC5kYXRhLmVudGl0eS5hZGRDb21wb25lbnQoXG4gICAgICAgIG5ldyBDb21wb25lbnRzLlNsb3dDb21wb25lbnQodGhpcy5lbmdpbmUsIHtmYWN0b3I6IDAuNX0pLFxuICAgICAgICB7IFxuICAgICAgICAgIGR1cmF0aW9uOiAxMFxuICAgICAgICB9XG4gICAgICApOyBcbiAgICAgIHRoaXMuY2hhcmdlcy0tO1xuICAgICAgaWYgKHRoaXMuY2hhcmdlcyA8PSAwKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuLi9iZWhhdmlvdXJzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVXcml0ZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcGh5c2ljYWxDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge30gPSB7fSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY2FsQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd3cml0ZVJ1bmUnLFxuICAgICAgdGhpcy5vbldyaXRlUnVuZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBvbldyaXRlUnVuZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgdGlsZSA9IHRoaXMuZW5naW5lLmZpcmUobmV3IEV2ZW50cy5FdmVudCgnZ2V0VGlsZScsIHtcbiAgICAgIHBvc2l0aW9uOiB0aGlzLnBoeXNpY2FsQ29tcG9uZW50LnBvc2l0aW9uXG4gICAgfSkpO1xuXG4gICAgbGV0IGhhc1J1bmUgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGlsZS5wcm9wcykge1xuICAgICAgaWYgKHRpbGUucHJvcHNba2V5XS50eXBlID09PSAncnVuZScpIHtcbiAgICAgICAgaGFzUnVuZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc1J1bmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLldyaXRlUnVuZUFjdGlvbih0aGlzLmVuZ2luZSwgdGhpcy5lbnRpdHkpO1xuXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFNlbGZEZXN0cnVjdENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBtYXhUdXJuczogbnVtYmVyO1xuICBwcml2YXRlIHR1cm5zTGVmdDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7dHVybnM6IG51bWJlcn0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMubWF4VHVybnMgPSBkYXRhLnR1cm5zO1xuICAgIHRoaXMudHVybnNMZWZ0ID0gZGF0YS50dXJucztcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0dXJuJyxcbiAgICAgIHRoaXMub25UdXJuLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UdXJuKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnR1cm5zTGVmdC0tO1xuICAgIGlmICh0aGlzLnR1cm5zTGVmdCA8IDApIHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBTbG93Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9mYWN0b3I6IG51bWJlcjtcbiAgZ2V0IGZhY3RvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZmFjdG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtmYWN0b3I6IG51bWJlcn0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX2ZhY3RvciA9IGRhdGEuZmFjdG9yO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdvbkVuZXJneVJlZ2VuZXJhdGlvbicsXG4gICAgICB0aGlzLm9uRW5lcmd5UmVnZW5lcmF0aW9uLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcblxuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnZ2V0U3RhdHVzRWZmZWN0JyxcbiAgICAgIHRoaXMub25HZXRTdGF0dXNFZmZlY3QuYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25FbmVyZ3lSZWdlbmVyYXRpb24oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHJldHVybiB0aGlzLl9mYWN0b3I7XG4gIH1cblxuICBwcml2YXRlIG9uR2V0U3RhdHVzRWZmZWN0KGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ1Nsb3cnLFxuICAgICAgc3ltYm9sOiAnUydcbiAgICB9O1xuICB9XG5cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIFRpbWVIYW5kbGVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50VGljazogbnVtYmVyO1xuICBnZXQgY3VycmVudFRpY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRUaWNrO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudFR1cm46IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRUdXJuKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VHVybjtcbiAgfVxuXG4gIHByaXZhdGUgdGlja3NQZXJUdXJuOiBudW1iZXI7XG4gIHByaXZhdGUgdHVyblRpbWU6IG51bWJlcjtcblxuICBwcml2YXRlIHBhdXNlZDogYm9vbGVhbjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnRpY2tzUGVyVHVybiA9IDE7XG4gICAgdGhpcy50dXJuVGltZSA9IDA7XG4gICAgdGhpcy5fY3VycmVudFR1cm4gPSAwO1xuICAgIHRoaXMuX2N1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3BhdXNlVGltZScsXG4gICAgICB0aGlzLm9uUGF1c2VUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZXN1bWVUaW1lJyxcbiAgICAgIHRoaXMub25SZXN1bWVUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25QYXVzZVRpbWUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgb25SZXN1bWVUaW1lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgZW5naW5lVGljayhnYW1lVGltZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRUaWNrKys7XG4gICAgdGhpcy5lbmdpbmUuY3VycmVudFRpY2sgPSB0aGlzLl9jdXJyZW50VGljaztcbiAgICBpZiAoKHRoaXMuX2N1cnJlbnRUaWNrICUgdGhpcy50aWNrc1BlclR1cm4pID09PSAwKSB7XG4gICAgICB0aGlzLl9jdXJyZW50VHVybisrO1xuICAgICAgdGhpcy5lbmdpbmUuY3VycmVudFR1cm4gPSB0aGlzLl9jdXJyZW50VHVybjtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndHVybicsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcblxuICAgICAgdGhpcy50dXJuVGltZSA9IGdhbWVUaW1lO1xuXG4gICAgfVxuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndGljaycsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcbiAgfVxuXG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1RpbWVIYW5kbGVyQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vU2VsZkRlc3RydWN0Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUm9hbWluZ0FJQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vRW5lcmd5Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSW5wdXRDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SZW5kZXJhYmxlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUGh5c2ljc0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0hlYWx0aENvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVXcml0ZXJDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lRGFtYWdlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUnVuZUZyZWV6ZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1Nsb3dDb21wb25lbnQnO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnQgdHlwZSBDb2xvciA9IFN0cmluZyB8IG51bWJlcjtcblxuZXhwb3J0IGNsYXNzIENvbG9yVXRpbHMge1xuICAvKipcbiAgICBGdW5jdGlvbjogbXVsdGlwbHlcbiAgICBNdWx0aXBseSBhIGNvbG9yIHdpdGggYSBudW1iZXIuIFxuICAgID4gKHIsZyxiKSAqIG4gPT0gKHIqbiwgZypuLCBiKm4pXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG4gICAgY29lZiAtIHRoZSBmYWN0b3JcblxuICAgIFJldHVybnM6XG4gICAgQSBuZXcgY29sb3IgYXMgYSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkZcbiAgICovXG4gIHN0YXRpYyBtdWx0aXBseShjb2xvcjogQ29sb3IsIGNvZWY6IG51bWJlcik6IENvbG9yIHtcbiAgICBsZXQgciwgZywgYjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgciA9ICg8bnVtYmVyPmNvbG9yICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZyA9ICg8bnVtYmVyPmNvbG9yICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiID0gPG51bWJlcj5jb2xvciAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sb3IpO1xuICAgICAgciA9IHJnYlswXTtcbiAgICAgIGcgPSByZ2JbMV07XG4gICAgICBiID0gcmdiWzJdO1xuICAgIH1cbiAgICByID0gTWF0aC5yb3VuZChyICogY29lZik7XG4gICAgZyA9IE1hdGgucm91bmQoZyAqIGNvZWYpO1xuICAgIGIgPSBNYXRoLnJvdW5kKGIgKiBjb2VmKTtcbiAgICByID0gciA8IDAgPyAwIDogciA+IDI1NSA/IDI1NSA6IHI7XG4gICAgZyA9IGcgPCAwID8gMCA6IGcgPiAyNTUgPyAyNTUgOiBnO1xuICAgIGIgPSBiIDwgMCA/IDAgOiBiID4gMjU1ID8gMjU1IDogYjtcbiAgICByZXR1cm4gYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpO1xuICB9XG5cbiAgc3RhdGljIG1heChjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH1cbiAgICBpZiAocjIgPiByMSkge1xuICAgICAgcjEgPSByMjtcbiAgICB9XG4gICAgaWYgKGcyID4gZzEpIHtcbiAgICAgIGcxID0gZzI7XG4gICAgfVxuICAgIGlmIChiMiA+IGIxKSB7XG4gICAgICBiMSA9IGIyO1xuICAgIH1cbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9XG5cbiAgc3RhdGljIG1pbihjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH1cbiAgICBpZiAocjIgPCByMSkge1xuICAgICAgcjEgPSByMjtcbiAgICB9XG4gICAgaWYgKGcyIDwgZzEpIHtcbiAgICAgIGcxID0gZzI7XG4gICAgfVxuICAgIGlmIChiMiA8IGIxKSB7XG4gICAgICBiMSA9IGIyO1xuICAgIH1cbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9ICAgICAgICBcblxuICBzdGF0aWMgY29sb3JNdWx0aXBseShjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH0gICAgICAgICAgIFxuICAgIHIxID0gTWF0aC5mbG9vcihyMSAqIHIyIC8gMjU1KTtcbiAgICBnMSA9IE1hdGguZmxvb3IoZzEgKiBnMiAvIDI1NSk7XG4gICAgYjEgPSBNYXRoLmZsb29yKGIxICogYjIgLyAyNTUpO1xuICAgIHIxID0gcjEgPCAwID8gMCA6IHIxID4gMjU1ID8gMjU1IDogcjE7XG4gICAgZzEgPSBnMSA8IDAgPyAwIDogZzEgPiAyNTUgPyAyNTUgOiBnMTtcbiAgICBiMSA9IGIxIDwgMCA/IDAgOiBiMSA+IDI1NSA/IDI1NSA6IGIxO1xuICAgIHJldHVybiBiMSB8IChnMSA8PCA4KSB8IChyMSA8PCAxNik7XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogY29tcHV0ZUludGVuc2l0eVxuICAgIFJldHVybiB0aGUgZ3JheXNjYWxlIGludGVuc2l0eSBiZXR3ZWVuIDAgYW5kIDFcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlSW50ZW5zaXR5KGNvbG9yOiBDb2xvcik6IG51bWJlciB7XG4gICAgLy8gQ29sb3JpbWV0cmljIChsdW1pbmFuY2UtcHJlc2VydmluZykgY29udmVyc2lvbiB0byBncmF5c2NhbGVcbiAgICBsZXQgciwgZywgYjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgciA9ICg8bnVtYmVyPmNvbG9yICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZyA9ICg8bnVtYmVyPmNvbG9yICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiID0gPG51bWJlcj5jb2xvciAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sb3IpO1xuICAgICAgciA9IHJnYlswXTtcbiAgICAgIGcgPSByZ2JbMV07XG4gICAgICBiID0gcmdiWzJdO1xuICAgIH1cbiAgICByZXR1cm4gKDAuMjEyNiAqIHIgKyAwLjcxNTIqZyArIDAuMDcyMiAqIGIpICogKDEvMjU1KTtcbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiBhZGRcbiAgICBBZGQgdHdvIGNvbG9ycy5cbiAgICA+IChyMSxnMSxiMSkgKyAocjIsZzIsYjIpID0gKHIxK3IyLGcxK2cyLGIxK2IyKVxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2wxIC0gdGhlIGZpcnN0IGNvbG9yXG4gICAgY29sMiAtIHRoZSBzZWNvbmQgY29sb3JcblxuICAgIFJldHVybnM6XG4gICAgQSBuZXcgY29sb3IgYXMgYSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkZcbiAgICovXG4gIHN0YXRpYyBhZGQoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKTogQ29sb3Ige1xuICAgIGxldCByID0gKCg8bnVtYmVyPmNvbDEgJiAweEZGMDAwMCkgPj4gMTYpICsgKCg8bnVtYmVyPmNvbDIgJiAweEZGMDAwMCkgPj4gMTYpO1xuICAgIGxldCBnID0gKCg8bnVtYmVyPmNvbDEgJiAweDAwRkYwMCkgPj4gOCkgKyAoKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4KTtcbiAgICBsZXQgYiA9ICg8bnVtYmVyPmNvbDEgJiAweDAwMDBGRikgKyAoPG51bWJlcj5jb2wyICYgMHgwMDAwRkYpO1xuICAgIGlmIChyID4gMjU1KSB7XG4gICAgICByID0gMjU1O1xuICAgIH1cbiAgICBpZiAoZyA+IDI1NSkge1xuICAgICAgZyA9IDI1NTtcbiAgICB9XG4gICAgaWYgKGIgPiAyNTUpIHtcbiAgICAgIGIgPSAyNTU7XG4gICAgfVxuICAgIHJldHVybiBiIHwgKGcgPDwgOCkgfCAociA8PCAxNik7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBzdGRDb2wgPSB7XG4gICAgXCJhcXVhXCI6IFswLCAyNTUsIDI1NV0sXG4gICAgXCJibGFja1wiOiBbMCwgMCwgMF0sXG4gICAgXCJibHVlXCI6IFswLCAwLCAyNTVdLFxuICAgIFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxuICAgIFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXG4gICAgXCJncmVlblwiOiBbMCwgMTI4LCAwXSxcbiAgICBcImxpbWVcIjogWzAsIDI1NSwgMF0sXG4gICAgXCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXG4gICAgXCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxuICAgIFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcbiAgICBcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxuICAgIFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXG4gICAgXCJyZWRcIjogWzI1NSwgMCwgMF0sXG4gICAgXCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxuICAgIFwidGVhbFwiOiBbMCwgMTI4LCAxMjhdLFxuICAgIFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxuICAgIFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF1cbiAgfTtcbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvUmdiXG4gICAgQ29udmVydCBhIHN0cmluZyBjb2xvciBpbnRvIGEgW3IsZyxiXSBudW1iZXIgYXJyYXkuXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEFuIGFycmF5IG9mIDMgbnVtYmVycyBbcixnLGJdIGJldHdlZW4gMCBhbmQgMjU1LlxuICAgKi9cbiAgc3RhdGljIHRvUmdiKGNvbG9yOiBDb2xvcik6IG51bWJlcltdIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gQ29sb3JVdGlscy50b1JnYkZyb21OdW1iZXIoPG51bWJlcj5jb2xvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb2xvclV0aWxzLnRvUmdiRnJvbVN0cmluZyg8U3RyaW5nPmNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogdG9XZWJcbiAgICBDb252ZXJ0IGEgY29sb3IgaW50byBhIENTUyBjb2xvciBmb3JtYXQgKGFzIGEgc3RyaW5nKVxuICAgKi9cbiAgc3RhdGljIHRvV2ViKGNvbG9yOiBDb2xvcik6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgbGV0IHJldDogc3RyaW5nID0gY29sb3IudG9TdHJpbmcoMTYpO1xuICAgICAgbGV0IG1pc3NpbmdaZXJvZXM6IG51bWJlciA9IDYgLSByZXQubGVuZ3RoO1xuICAgICAgaWYgKG1pc3NpbmdaZXJvZXMgPiAwKSB7XG4gICAgICAgIHJldCA9IFwiMDAwMDAwXCIuc3Vic3RyKDAsIG1pc3NpbmdaZXJvZXMpICsgcmV0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiI1wiICsgcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyB0b1JnYkZyb21OdW1iZXIoY29sb3I6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICBsZXQgciA9IChjb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICBsZXQgZyA9IChjb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgIGxldCBiID0gY29sb3IgJiAweDAwMDBGRjtcbiAgICByZXR1cm4gW3IsIGcsIGJdO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZ2JGcm9tU3RyaW5nKGNvbG9yOiBTdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgY29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBzdGRDb2xWYWx1ZXM6IG51bWJlcltdID0gQ29sb3JVdGlscy5zdGRDb2xbU3RyaW5nKGNvbG9yKV07XG4gICAgaWYgKHN0ZENvbFZhbHVlcykge1xuICAgICAgcmV0dXJuIHN0ZENvbFZhbHVlcztcbiAgICB9XG4gICAgaWYgKGNvbG9yLmNoYXJBdCgwKSA9PT0gXCIjXCIpIHtcbiAgICAgIC8vICNGRkYgb3IgI0ZGRkZGRiBmb3JtYXRcbiAgICAgIGlmIChjb2xvci5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgLy8gZXhwYW5kICNGRkYgdG8gI0ZGRkZGRlxuICAgICAgICBjb2xvciA9IFwiI1wiICsgY29sb3IuY2hhckF0KDEpICsgY29sb3IuY2hhckF0KDEpICsgY29sb3IuY2hhckF0KDIpXG4gICAgICAgICsgY29sb3IuY2hhckF0KDIpICsgY29sb3IuY2hhckF0KDMpICsgY29sb3IuY2hhckF0KDMpO1xuICAgICAgfVxuICAgICAgbGV0IHI6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cigxLCAyKSwgMTYpO1xuICAgICAgbGV0IGc6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cigzLCAyKSwgMTYpO1xuICAgICAgbGV0IGI6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cig1LCAyKSwgMTYpO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9IGVsc2UgaWYgKGNvbG9yLmluZGV4T2YoXCJyZ2IoXCIpID09PSAwKSB7XG4gICAgICAvLyByZ2IocixnLGIpIGZvcm1hdFxuICAgICAgbGV0IHJnYkxpc3QgPSBjb2xvci5zdWJzdHIoNCwgY29sb3IubGVuZ3RoIC0gNSkuc3BsaXQoXCIsXCIpO1xuICAgICAgcmV0dXJuIFtwYXJzZUludChyZ2JMaXN0WzBdLCAxMCksIHBhcnNlSW50KHJnYkxpc3RbMV0sIDEwKSwgcGFyc2VJbnQocmdiTGlzdFsyXSwgMTApXTtcbiAgICB9XG4gICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b051bWJlclxuICAgIENvbnZlcnQgYSBzdHJpbmcgY29sb3IgaW50byBhIG51bWJlci5cblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sb3IgLSB0aGUgY29sb3JcblxuICAgIFJldHVybnM6XG4gICAgQSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkYuXG4gICAqL1xuICBzdGF0aWMgdG9OdW1iZXIoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gPG51bWJlcj5jb2xvcjtcbiAgICB9XG4gICAgbGV0IHNjb2w6IFN0cmluZyA9IDxTdHJpbmc+Y29sb3I7XG4gICAgaWYgKHNjb2wuY2hhckF0KDApID09PSBcIiNcIiAmJiBzY29sLmxlbmd0aCA9PT0gNykge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHNjb2wuc3Vic3RyKDEpLCAxNik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IgPSBDb2xvclV0aWxzLnRvUmdiRnJvbVN0cmluZyhzY29sKTtcbiAgICAgIHJldHVybiByZ2JbMF0gKiA2NTUzNiArIHJnYlsxXSAqIDI1NiArIHJnYlsyXTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBQb3NpdGlvbiB7XG4gIHByaXZhdGUgX3g6IG51bWJlcjtcbiAgcHJpdmF0ZSBfeTogbnVtYmVyO1xuXG4gIHByaXZhdGUgc3RhdGljIG1heFdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgc3RhdGljIG1heEhlaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy5feCA9IHg7XG4gICAgdGhpcy5feSA9IHk7XG4gIH1cblxuICBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl94O1xuICB9XG5cbiAgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0TWF4VmFsdWVzKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gICAgUG9zaXRpb24ubWF4V2lkdGggPSB3O1xuICAgIFBvc2l0aW9uLm1heEhlaWdodCA9IGg7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldFJhbmRvbSh3aWR0aDogbnVtYmVyID0gLTEsIGhlaWdodDogbnVtYmVyID0gLTEpOiBQb3NpdGlvbiB7XG4gICAgaWYgKHdpZHRoID09PSAtMSkge1xuICAgICAgd2lkdGggPSBQb3NpdGlvbi5tYXhXaWR0aDtcbiAgICB9XG4gICAgaWYgKGhlaWdodCA9PT0gLTEpIHtcbiAgICAgIGhlaWdodCA9IFBvc2l0aW9uLm1heEhlaWdodDtcbiAgICB9XG4gICAgdmFyIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aWR0aCk7XG4gICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBoZWlnaHQpO1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24oeCwgeSk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldE5laWdoYm91cnMocG9zOiBQb3NpdGlvbiwgd2lkdGg6IG51bWJlciA9IC0xLCBoZWlnaHQ6IG51bWJlciA9IC0xLCBvbmx5Q2FyZGluYWw6IGJvb2xlYW4gPSBmYWxzZSk6IFBvc2l0aW9uW10ge1xuICAgIGlmICh3aWR0aCA9PT0gLTEpIHtcbiAgICAgIHdpZHRoID0gUG9zaXRpb24ubWF4V2lkdGg7XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBQb3NpdGlvbi5tYXhIZWlnaHQ7XG4gICAgfVxuICAgIGxldCB4ID0gcG9zLng7XG4gICAgbGV0IHkgPSBwb3MueTtcbiAgICBsZXQgcG9zaXRpb25zID0gW107XG4gICAgaWYgKHggPiAwKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkpKTtcbiAgICB9XG4gICAgaWYgKHggPCB3aWR0aCAtIDEpIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4ICsgMSwgeSkpO1xuICAgIH1cbiAgICBpZiAoeSA+IDApIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4LCB5IC0gMSkpO1xuICAgIH1cbiAgICBpZiAoeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4LCB5ICsgMSkpO1xuICAgIH1cbiAgICBpZiAoIW9ubHlDYXJkaW5hbCkge1xuICAgICAgaWYgKHggPiAwICYmIHkgPiAwKSB7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4IC0gMSwgeSAtIDEpKTtcbiAgICAgIH1cbiAgICAgIGlmICh4ID4gMCAmJiB5IDwgaGVpZ2h0IC0gMSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkgKyAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA8IHdpZHRoIC0gMSAmJiB5IDwgaGVpZ2h0IC0gMSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkgKyAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA8IHdpZHRoIC0gMSAmJiB5ID4gMCkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkgLSAxKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwb3NpdGlvbnM7XG5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RGlyZWN0aW9ucyhvbmx5Q2FyZGluYWw6IGJvb2xlYW4gPSBmYWxzZSk6IFBvc2l0aW9uW10ge1xuICAgIGxldCBkaXJlY3Rpb25zOiBQb3NpdGlvbltdID0gW107XG5cbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAwLCAtMSkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDAsICAxKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgIDApKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAxLCAgMCkpO1xuICAgIGlmICghb25seUNhcmRpbmFsKSB7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAtMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgIDEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsICAxKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAxLCAtMSkpO1xuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3Rpb25zO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhZGQoYTogUG9zaXRpb24sIGI6IFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbihhLnggKyBiLngsIGEueSArIGIueSk7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vQ29sb3InO1xuZXhwb3J0ICogZnJvbSAnLi9Qb3NpdGlvbic7XG5cbmV4cG9ydCBuYW1lc3BhY2UgVXRpbHMge1xuICAvLyBDUkMzMiB1dGlsaXR5LiBBZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODYzODkwMC9qYXZhc2NyaXB0LWNyYzMyXG4gIGxldCBjcmNUYWJsZTogbnVtYmVyW107XG4gIGZ1bmN0aW9uIG1ha2VDUkNUYWJsZSgpIHtcbiAgICBsZXQgYzogbnVtYmVyO1xuICAgIGNyY1RhYmxlID0gW107XG4gICAgZm9yIChsZXQgbjogbnVtYmVyID0gMDsgbiA8IDI1NjsgbisrKSB7XG4gICAgICBjID0gbjtcbiAgICAgIGZvciAobGV0IGs6IG51bWJlciA9IDA7IGsgPCA4OyBrKyspIHtcbiAgICAgICAgYyA9ICgoYyAmIDEpID8gKDB4RURCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpKTtcbiAgICAgIH1cbiAgICAgIGNyY1RhYmxlW25dID0gYztcbiAgICB9XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYnVpbGRNYXRyaXg8VD4odzogbnVtYmVyLCBoOiBudW1iZXIsIHZhbHVlOiBUKTogVFtdW10ge1xuICAgIGxldCByZXQ6IFRbXVtdID0gW107XG4gICAgZm9yICggbGV0IHg6IG51bWJlciA9IDA7IHggPCB3OyArK3gpIHtcbiAgICAgIHJldFt4XSA9IFtdO1xuICAgICAgZm9yICggbGV0IHk6IG51bWJlciA9IDA7IHkgPCBoOyArK3kpIHtcbiAgICAgICAgcmV0W3hdW3ldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gY3JjMzIoc3RyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGlmICghY3JjVGFibGUpIHtcbiAgICAgIG1ha2VDUkNUYWJsZSgpO1xuICAgIH1cbiAgICBsZXQgY3JjOiBudW1iZXIgPSAwIF4gKC0xKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBsZW46IG51bWJlciA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY3JjID0gKGNyYyA+Pj4gOCkgXiBjcmNUYWJsZVsoY3JjIF4gc3RyLmNoYXJDb2RlQXQoaSkpICYgMHhGRl07XG4gICAgfVxuICAgIHJldHVybiAoY3JjIF4gKC0xKSkgPj4+IDA7XG4gIH07XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHRvQ2FtZWxDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBpbnB1dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyhcXGJ8XylcXHcvZywgZnVuY3Rpb24obSkge1xuICAgICAgcmV0dXJuIG0udG9VcHBlckNhc2UoKS5yZXBsYWNlKC9fLywgXCJcIik7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVHdWlkKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbiAgZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbShtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21JbmRleDxUPihhcnJheTogVFtdKTogVCB7XG4gICAgcmV0dXJuIGFycmF5W2dldFJhbmRvbSgwLCBhcnJheS5sZW5ndGggLSAxKV07XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcmFuZG9taXplQXJyYXk8VD4oYXJyYXk6IFRbXSk6IFRbXSB7XG4gICAgaWYgKGFycmF5Lmxlbmd0aCA8PSAxKSByZXR1cm4gYXJyYXk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByYW5kb21DaG9pY2VJbmRleCA9IGdldFJhbmRvbShpLCBhcnJheS5sZW5ndGggLSAxKTtcblxuICAgICAgW2FycmF5W2ldLCBhcnJheVtyYW5kb21DaG9pY2VJbmRleF1dID0gW2FycmF5W3JhbmRvbUNob2ljZUluZGV4XSwgYXJyYXlbaV1dO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBhcHBseU1peGlucyhkZXJpdmVkQ3RvcjogYW55LCBiYXNlQ3RvcnM6IGFueVtdKSB7XG4gICAgYmFzZUN0b3JzLmZvckVhY2goYmFzZUN0b3IgPT4ge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYmFzZUN0b3IucHJvdG90eXBlKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBkZXJpdmVkQ3Rvci5wcm90b3R5cGVbbmFtZV0gPSBiYXNlQ3Rvci5wcm90b3R5cGVbbmFtZV07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2lseShlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCB3aWx5ID0gbmV3IEVudGl0aWVzLkVudGl0eShlbmdpbmUsICdXaWx5JywgJ3BsYXllcicpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudChlbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAweGZmZmZmZiwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5JbnB1dENvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lV3JpdGVyQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkhlYWx0aENvbXBvbmVudChlbmdpbmUpKTtcblxuICAgIHJldHVybiB3aWx5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmF0KGVuZ2luZTogRW5naW5lKSB7XG4gICAgbGV0IHJhdCA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAnUmF0JywgJ3Zlcm1pbicpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQoZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCdyJywgMHhmZmZmZmYsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJvYW1pbmdBSUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkhlYWx0aENvbXBvbmVudChlbmdpbmUpKTtcblxuICAgIHJldHVybiByYXQ7XG59XG4iLCJpbXBvcnQgKiBhcyBDb2xsZWN0aW9ucyBmcm9tICd0eXBlc2NyaXB0LWNvbGxlY3Rpb25zJztcblxuaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIE1peGlucyBmcm9tICcuLi9taXhpbnMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHkgaW1wbGVtZW50cyBNaXhpbnMuSUV2ZW50SGFuZGxlciB7XG4gIC8vIEV2ZW50SGFuZGxlciBtaXhpblxuICBsaXN0ZW46IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiBFdmVudHMuTGlzdGVuZXI7XG4gIHJlbW92ZUxpc3RlbmVyOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gdm9pZDtcbiAgZW1pdDogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IHZvaWQ7XG4gIGZpcmU6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIGlzOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcbiAgZ2F0aGVyOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55W107XG5cbiAgcHJpdmF0ZSBfdHlwZTogc3RyaW5nO1xuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgX25hbWU6IHN0cmluZztcbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cbiAgcHJpdmF0ZSBfZ3VpZDogc3RyaW5nO1xuICBnZXQgZ3VpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ3VpZDtcbiAgfVxuICBwcml2YXRlIGVuZ2luZTogRW5naW5lO1xuICBwcml2YXRlIGNvbXBvbmVudHM6IENvbXBvbmVudHMuQ29tcG9uZW50W107XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIG5hbWU6IHN0cmluZyA9ICcnLCB0eXBlOiBzdHJpbmcgPSAnJykge1xuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMuX2d1aWQgPSBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuXG5cbiAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcblxuICAgIHRoaXMuZW5naW5lLnJlZ2lzdGVyRW50aXR5KHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICBjb21wb25lbnQuZGVzdHJveSgpO1xuICAgICAgY29tcG9uZW50ID0gbnVsbDtcbiAgICB9KTtcbiAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcyk7XG4gIH1cblxuICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnRzLkNvbXBvbmVudCwgb3B0aW9uczoge2R1cmF0aW9uOiBudW1iZXJ9ID0gbnVsbCkge1xuICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyRW50aXR5KHRoaXMpO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kdXJhdGlvbikge1xuICAgICAgY29uc3QgZGVsYXllZENvbXBvbmVudFJlbW92ZXIgPSBuZXcgRGVsYXllZENvbXBvbmVudFJlbW92ZXIoKTtcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLnRyaWdnZXJUdXJuID0gdGhpcy5lbmdpbmUuY3VycmVudFR1cm4gKyBvcHRpb25zLmR1cmF0aW9uO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuZW50aXR5ID0gdGhpcztcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmVuZ2luZSA9IHRoaXMuZW5naW5lO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuZ3VpZCA9IGNvbXBvbmVudC5ndWlkO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIubGlzdGVuZXIgPSB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICAgJ3R1cm4nLFxuICAgICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5jaGVjay5iaW5kKGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyKVxuICAgICAgKSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50IGluc3RhbmNlb2YgY29tcG9uZW50VHlwZTtcbiAgICB9KS5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KGNvbXBvbmVudFR5cGUpOiBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gICAgbGV0IGNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudCBpbnN0YW5jZW9mIGNvbXBvbmVudFR5cGU7XG4gICAgfSk7XG4gICAgaWYgKGNvbXBvbmVudC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50WzBdO1xuICB9XG5cbiAgcmVtb3ZlQ29tcG9uZW50KGd1aWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuY29tcG9uZW50cy5maW5kSW5kZXgoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudC5ndWlkID09PSBndWlkO1xuICAgIH0pO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgdGhpcy5jb21wb25lbnRzW2lkeF0uZGVzdHJveSgpO1xuICAgICAgdGhpcy5jb21wb25lbnRzLnNwbGljZShpZHgsIDEpO1xuICAgIH1cbiAgfVxuXG59XG5cbmNsYXNzIERlbGF5ZWRDb21wb25lbnRSZW1vdmVyIHtcbiAgdHJpZ2dlclR1cm46IG51bWJlcjtcbiAgbGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcjtcbiAgZW50aXR5OiBFbnRpdHk7XG4gIGVuZ2luZTogRW5naW5lO1xuICBndWlkOiBzdHJpbmc7XG4gIGNoZWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5jdXJyZW50VHVybiA+PSB0aGlzLnRyaWdnZXJUdXJuKSB7XG4gICAgICB0aGlzLmVudGl0eS5yZW1vdmVDb21wb25lbnQodGhpcy5ndWlkKTtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUxpc3RlbmVyKHRoaXMubGlzdGVuZXIpO1xuICAgIH1cbiAgfVxufVxuXG5Db3JlLlV0aWxzLmFwcGx5TWl4aW5zKEVudGl0eSwgW01peGlucy5FdmVudEhhbmRsZXJdKTtcbiIsImV4cG9ydCAqIGZyb20gJy4vQ3JlYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL0VudGl0eSc7XG4iLCJleHBvcnQgY2xhc3MgRXZlbnQge1xuICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgZGF0YTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIExpc3RlbmVyIHtcbiAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgcHVibGljIHByaW9yaXR5OiBudW1iZXI7XG4gIHB1YmxpYyBjYWxsYmFjazogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgcHVibGljIGd1aWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55LCBwcmlvcml0eTogbnVtYmVyID0gMTAwLCBndWlkOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZ3VpZCA9IGd1aWQgfHwgQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9FdmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0lMaXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL0xpc3RlbmVyJztcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBNYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgbWF4QXR0ZW1wczogbnVtYmVyO1xuICBwcml2YXRlIGF0dGVtcHRzOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBzdGFjazogQ29yZS5Qb3NpdGlvbltdO1xuXG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5tYXAubGVuZ3RoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5tYXBbMF0ubGVuZ3RoO1xuXG4gICAgdGhpcy5tYXhBdHRlbXBzID0gNTAwMDA7XG4gICAgdGhpcy5hdHRlbXB0cyA9IDA7XG5cbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5tYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSAwO1xuICAgIHRoaXMucG9wdWxhdGVTdGFjayhwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlU3RhY2socG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBjb25zdCBuZWlnaGJvdXJzID0gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG4gICAgY29uc3QgbmV3Q2VsbHMgPSBbXTtcbiAgICBmb3IgKGxldCBkaXJlY3Rpb24gaW4gbmVpZ2hib3Vycykge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBuZWlnaGJvdXJzW2RpcmVjdGlvbl07XG4gICAgICBpZiAocG9zaXRpb24gJiYgTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMubWFwLCBwb3NpdGlvbiwgMSkpIHtcbiAgICAgICAgbmV3Q2VsbHMucHVzaChwb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuZXdDZWxscy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnN0YWNrID0gdGhpcy5zdGFjay5jb25jYXQoQ29yZS5VdGlscy5yYW5kb21pemVBcnJheShuZXdDZWxscykpO1xuICAgIH1cbiAgfVxuXG4gIGl0ZXJhdGUoKSB7XG4gICAgdGhpcy5hdHRlbXB0cysrO1xuXG4gICAgaWYgKHRoaXMuYXR0ZW1wdHMgPiB0aGlzLm1heEF0dGVtcHMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXggYXR0ZW1wdHMgZG9uZScpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBwb3M6IENvcmUuUG9zaXRpb247XG4gICAgd2hpbGUgKHRoaXMuc3RhY2sgJiYgdGhpcy5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBwb3MgPSB0aGlzLnN0YWNrLnBvcCgpO1xuXG4gICAgICBpZiAoTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMubWFwLCBwb3MsIDEpKSB7XG4gICAgICAgIHRoaXMubWFwW3Bvcy54XVtwb3MueV0gPSAwO1xuICAgICAgICB0aGlzLnBvcHVsYXRlU3RhY2socG9zKTtcblxuICAgICAgICByZXR1cm4gcG9zOyBcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgTWFwIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgUm9vbUdlbmVyYXRvciB7XG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIG1heEF0dGVtcHRzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobWFwOiBudW1iZXJbXVtdLCBtYXhBdHRlbXB0czogbnVtYmVyID0gNTAwKSB7XG4gICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5tYXAubGVuZ3RoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5tYXBbMF0ubGVuZ3RoO1xuXG4gICAgdGhpcy5tYXhBdHRlbXB0cyA9IG1heEF0dGVtcHRzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1NwYWNlQXZhaWxhYmxlKHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgIGlmICghTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMubWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihpLCBqKSwgMCkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpdGVyYXRlKCkge1xuICAgIGxldCByb29tR2VuZXJhdGVkID0gZmFsc2U7XG4gICAgbGV0IGF0dGVtcHRzID0gMDtcbiAgICB3aGlsZSAoIXJvb21HZW5lcmF0ZWQgJiYgYXR0ZW1wdHMgPCB0aGlzLm1heEF0dGVtcHRzKSB7XG4gICAgICByb29tR2VuZXJhdGVkID0gdGhpcy5nZW5lcmF0ZVJvb20oKTtcbiAgICAgIGF0dGVtcHRzKytcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vbUdlbmVyYXRlZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSb29tKCkge1xuICAgIGNvbnN0IHNpemUgPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgzLCA1KTtcbiAgICBjb25zdCByZWN0YW5ndWxhcml0eSA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDEsIDMpO1xuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgaGVpZ2h0ID0gc2l6ZTtcbiAgICAgIHdpZHRoID0gc2l6ZSArIHJlY3Rhbmd1bGFyaXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCA9IHNpemU7XG4gICAgICBoZWlnaHQgPSBzaXplICsgcmVjdGFuZ3VsYXJpdHk7XG4gICAgfVxuXG4gICAgbGV0IHggPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCAodGhpcy53aWR0aCAtIHdpZHRoIC0gMikpO1xuICAgIHggPSBNYXRoLmZsb29yKHgvMikgKiAyICsgMTtcbiAgICBsZXQgeSA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsICh0aGlzLmhlaWdodCAtIGhlaWdodCAtIDIpKTtcbiAgICB5ID0gTWF0aC5mbG9vcih5LzIpICogMiArIDE7XG5cbiAgICBpZiAodGhpcy5pc1NwYWNlQXZhaWxhYmxlKHgsIHksIHdpZHRoLCBoZWlnaHQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgICAgICAgIHRoaXMubWFwW2ldW2pdID0gMDsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLm1hcDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIFRvcG9sb2d5Q29tYmluYXRvciB7XG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuICBwcml2YXRlIHRvcG9sb2dpZXM6IG51bWJlcltdW107XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgdG9wb2xvZ3lJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogbnVtYmVyW11bXSkge1xuICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMubWFwLmxlbmd0aDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubWFwWzBdLmxlbmd0aDtcblxuICAgIHRoaXMudG9wb2xvZ2llcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudG9wb2xvZ2llc1t4XSA9IFtdO1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLm1hcDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKTogbnVtYmVyW11bXSB7XG4gICAgdGhpcy50b3BvbG9neUlkID0gMDtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMuYWRkVG9wb2xvZ3kobmV3IENvcmUuUG9zaXRpb24oeCwgeSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b3BvbG9naWVzO1xuICB9XG5cbiAgY29tYmluZSgpIHtcbiAgICBsZXQgaSA9IDI7XG4gICAgY29uc3QgbWF4ID0gdGhpcy50b3BvbG9neUlkO1xuICAgIGxldCByZW1haW5pbmdUb3BvbG9naWVzID0gW107XG4gICAgZm9yICh2YXIgaiA9IDI7IGogPD0gdGhpcy50b3BvbG9neUlkOyBqKyspIHtcbiAgICAgIHJlbWFpbmluZ1RvcG9sb2dpZXMucHVzaChqKTtcbiAgICB9XG4gICAgd2hpbGUgKHJlbWFpbmluZ1RvcG9sb2dpZXMubGVuZ3RoID4gMCAmJiBpIDwgbWF4ICogNSkge1xuICAgICAgbGV0IHRvcG9sb2d5SWQgPSByZW1haW5pbmdUb3BvbG9naWVzLnNoaWZ0KCk7XG4gICAgICBpKys7XG4gICAgICBpZiAoIXRoaXMuY29tYmluZVRvcG9sb2d5KDEsIHRvcG9sb2d5SWQpKSB7XG4gICAgICAgIHJlbWFpbmluZ1RvcG9sb2dpZXMucHVzaCh0b3BvbG9neUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbWJpbmVUb3BvbG9neShhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgIGNvbnN0IGVkZ2VzID0gdGhpcy5nZXRFZGdlcyhhLCBiKTtcbiAgICBpZiAoZWRnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IGNvbWJpbmVkID0gZmFsc2U7XG5cbiAgICB3aGlsZSAoIWNvbWJpbmVkICYmIGVkZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBpZHggPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCBlZGdlcy5sZW5ndGggLSAxKTsgXG4gICAgICBsZXQgZWRnZSA9IGVkZ2VzW2lkeF07XG4gICAgICBlZGdlcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIGxldCBzdXJyb3VuZGluZ1RpbGVzID0gTWFwLlV0aWxzLmNvdW50U3Vycm91bmRpbmdUaWxlcyh0aGlzLm1hcCwgZWRnZSk7XG4gICAgICBpZiAoc3Vycm91bmRpbmdUaWxlcyA9PT0gMikge1xuICAgICAgICB0aGlzLm1hcFtlZGdlLnhdW2VkZ2UueV0gPSAwO1xuICAgICAgICB0aGlzLnRvcG9sb2dpZXNbZWRnZS54XVtlZGdlLnldID0gYTtcbiAgICAgICAgY29tYmluZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb21iaW5lZCkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9PT0gYikge1xuICAgICAgICAgICAgdGhpcy50b3BvbG9naWVzW3hdW3ldID0gYTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbWJpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFZGdlcyhhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgIGNvbnN0IGhhc1RvcG9sb2d5TmVpZ2hib3VyID0gKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0b3BvbG9neUlkOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIC0xLCAtMSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gbmVpZ2hib3Vycy5maWx0ZXIoKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvcG9sb2dpZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IHRvcG9sb2d5SWRcbiAgICAgIH0pLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGxldCBlZGdlcyA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGlmIChoYXNUb3BvbG9neU5laWdoYm91cihwb3NpdGlvbiwgYSkgJiYgaGFzVG9wb2xvZ3lOZWlnaGJvdXIocG9zaXRpb24sIGIpKSB7XG4gICAgICAgICAgZWRnZXMucHVzaChwb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVkZ2VzO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb3BvbG9neShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdG9wb2xvZ3lJZDogbnVtYmVyID0gLTEpIHtcbiAgICBjb25zdCB4ID0gcG9zaXRpb24ueDtcbiAgICBjb25zdCB5ID0gcG9zaXRpb24ueTtcbiAgICBpZiAodGhpcy5tYXBbeF1beV0gIT09IDAgfHwgdGhpcy50b3BvbG9naWVzW3hdW3ldICE9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRvcG9sb2d5SWQgPT09IC0xKSB7XG4gICAgICB0aGlzLnRvcG9sb2d5SWQrKztcbiAgICAgIHRvcG9sb2d5SWQgPSB0aGlzLnRvcG9sb2d5SWQ7XG4gICAgfVxuXG4gICAgdGhpcy50b3BvbG9naWVzW3hdW3ldID0gdG9wb2xvZ3lJZDtcblxuICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIC0xLCAtMSwgdHJ1ZSk7XG4gICAgbmVpZ2hib3Vycy5mb3JFYWNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHRoaXMubWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAwICYmIHRoaXMudG9wb2xvZ2llc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgICB0aGlzLmFkZFRvcG9sb2d5KHBvc2l0aW9uLCB0b3BvbG9neUlkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcblxuZW51bSBEaXJlY3Rpb24ge1xuICBOb25lID0gMSxcbiAgTm9ydGgsXG4gIEVhc3QsXG4gIFNvdXRoLFxuICBXZXN0LFxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgZnVuY3Rpb24gY2FydmVhYmxlKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24ueCA8IDAgfHwgcG9zaXRpb24ueCA+IG1hcC5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi55IDwgMCB8fCBwb3NpdGlvbi55ID4gbWFwWzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBmaW5kQ2FydmVhYmxlU3BvdChtYXA6IG51bWJlcltdW10pIHtcbiAgICBjb25zdCB3aWR0aCA9IG1hcC5sZW5ndGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gbWFwWzBdLmxlbmd0aDtcblxuICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG5cbiAgICBsZXQgY2FydmFibGVzUG9zaXRpb25zID0gW107XG5cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24oQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgd2lkdGgpLCBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCBoZWlnaHQpKTtcbiAgICAgICAgaWYgKFV0aWxzLmNhbkNhcnZlKG1hcCwgcG9zaXRpb24sIDAsIHRydWUpKSB7XG4gICAgICAgICAgY2FydmFibGVzUG9zaXRpb25zLnB1c2gocG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNhcnZhYmxlc1Bvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gQ29yZS5VdGlscy5nZXRSYW5kb21JbmRleChjYXJ2YWJsZXNQb3NpdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjb3VudFN1cnJvdW5kaW5nVGlsZXMobWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgY2hlY2tEaWFnb25hbHM6IGJvb2xlYW4gPSBmYWxzZSk6IG51bWJlciB7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gMDtcbiAgICBpZiAocG9zaXRpb24ueSA+IDAgJiYgbWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnkgLSAxXSA9PT0gMCkge1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnkgPCBtYXBbMF0ubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueSArIDFdID09PSAwKSB7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueCA+IDAgJiYgbWFwW3Bvc2l0aW9uLnggLSAxXVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnggPCBtYXAubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueCArIDFdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cblxuICAgIGlmIChjaGVja0RpYWdvbmFscykge1xuICAgICAgaWYgKHBvc2l0aW9uLnkgPiAwICYmIHBvc2l0aW9uLnggPiAwICYmIG1hcFtwb3NpdGlvbi54IC0gMV1bcG9zaXRpb24ueSAtIDFdID09PSAwKSB7XG4gICAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgICB9XG4gICAgICBpZiAocG9zaXRpb24ueSA8IG1hcFswXS5sZW5ndGggLSAxICYmIHBvc2l0aW9uLnggPCBtYXAubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueCArIDFdW3Bvc2l0aW9uLnkgKyAxXSA9PT0gMCkge1xuICAgICAgICBjb25uZWN0aW9ucysrO1xuICAgICAgfVxuICAgICAgaWYgKHBvc2l0aW9uLnggPiAwICYmIHBvc2l0aW9uLnkgPCBtYXBbMF0ubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueCAtIDFdW3Bvc2l0aW9uLnkgKyAxXSA9PT0gMCkge1xuICAgICAgICBjb25uZWN0aW9ucysrO1xuICAgICAgfVxuICAgICAgaWYgKHBvc2l0aW9uLnggPCBtYXAubGVuZ3RoIC0gMSAmJiBwb3NpdGlvbi55ID4gMCAmJiBtYXBbcG9zaXRpb24ueCArIDFdW3Bvc2l0aW9uLnkgLSAxXSA9PT0gMCkge1xuICAgICAgICBjb25uZWN0aW9ucysrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb25uZWN0aW9ucztcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5DYXJ2ZShtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCBhbGxvd2VkQ29ubmVjdGlvbnM6IG51bWJlciA9IDAsIGNoZWNrRGlhZ29uYWxzOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICBpZiAoIWNhcnZlYWJsZShtYXAsIHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBsZXQgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5Ob25lO1xuICAgIGxldCBjb25uZWN0aW9ucyA9IDA7XG5cbiAgICBpZiAocG9zaXRpb24ueSA+IDAgJiYgbWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnkgLSAxXSA9PT0gMCkge1xuICAgICAgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5Ob3J0aDtcbiAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi55IDwgbWFwWzBdLmxlbmd0aCAtIDEgJiYgbWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnkgKyAxXSA9PT0gMCkge1xuICAgICAgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5Tb3V0aDtcbiAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi54ID4gMCAmJiBtYXBbcG9zaXRpb24ueCAtIDFdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLldlc3Q7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueCA8IG1hcC5sZW5ndGggLSAxICYmIG1hcFtwb3NpdGlvbi54ICsgMV1bcG9zaXRpb24ueV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uRWFzdDtcbiAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgfVxuXG4gICAgaWYgKGNoZWNrRGlhZ29uYWxzKSB7XG4gICAgICBpZiAocG9zaXRpb24ueSA+IDAgJiYgcG9zaXRpb24ueCA+IDAgJiYgbWFwW3Bvc2l0aW9uLnggLSAxXVtwb3NpdGlvbi55IC0gMV0gPT09IDApIHtcbiAgICAgICAgY29ubmVjdGlvbnMrKztcbiAgICAgIH1cbiAgICAgIGlmIChwb3NpdGlvbi55IDwgbWFwWzBdLmxlbmd0aCAtIDEgJiYgcG9zaXRpb24ueCA8IG1hcC5sZW5ndGggLSAxICYmIG1hcFtwb3NpdGlvbi54ICsgMV1bcG9zaXRpb24ueSArIDFdID09PSAwKSB7XG4gICAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgICB9XG4gICAgICBpZiAocG9zaXRpb24ueCA+IDAgJiYgcG9zaXRpb24ueSA8IG1hcFswXS5sZW5ndGggLSAxICYmIG1hcFtwb3NpdGlvbi54IC0gMV1bcG9zaXRpb24ueSArIDFdID09PSAwKSB7XG4gICAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgICB9XG4gICAgICBpZiAocG9zaXRpb24ueCA8IG1hcC5sZW5ndGggLSAxICYmIHBvc2l0aW9uLnkgPiAwICYmIG1hcFtwb3NpdGlvbi54ICsgMV1bcG9zaXRpb24ueSAtIDFdID09PSAwKSB7XG4gICAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbm5lY3Rpb25zID4gYWxsb3dlZENvbm5lY3Rpb25zKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbkNhcnZlRnJvbShtYXAsIHBvc2l0aW9uLCBjb25uZWN0ZWRGcm9tKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5DYXJ2ZUZyb20obWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgZGlyZWN0aW9uOiBEaXJlY3Rpb24pIHtcbiAgICBpZiAobWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLlNvdXRoOlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKTtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLk5vcnRoOlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkpKTtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLldlc3Q6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uRWFzdDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Ob25lOlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL1Jvb21HZW5lcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vVXRpbHMnO1xuZXhwb3J0ICogZnJvbSAnLi9Ub3BvbG9neUNvbWJpbmF0b3InO1xuIiwiaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUV2ZW50SGFuZGxlciB7XG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50SGFuZGxlciBpbXBsZW1lbnRzIElFdmVudEhhbmRsZXIge1xuICBwcml2YXRlIGxpc3RlbmVyczoge1tldmVudDogc3RyaW5nXTogRXZlbnRzLkxpc3RlbmVyW119ID0ge307XG5cbiAgbGlzdGVuKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICAgIH1cbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLnB1c2gobGlzdGVuZXIpO1xuICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdID0gdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0uc29ydCgoYTogRXZlbnRzLkxpc3RlbmVyLCBiOiBFdmVudHMuTGlzdGVuZXIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgfVxuXG4gIHJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzIHx8ICF0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaWR4ID0gdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0uZmluZEluZGV4KChsKSA9PiB7XG4gICAgICByZXR1cm4gbC5ndWlkID09PSBsaXN0ZW5lci5ndWlkO1xuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgaWR4ID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0uc3BsaWNlKGlkeCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZW1pdChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLm1hcCgoaSkgPT4gaSk7XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlzKGV2ZW50OiBFdmVudHMuRXZlbnQpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuZWRWYWx1ZSA9IHRydWU7XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgaWYgKCFyZXR1cm5lZFZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybmVkVmFsdWUgPSBsaXN0ZW5lci5jYWxsYmFjayhldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gIH1cblxuICBmaXJlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuZWRWYWx1ZSA9IG51bGw7XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgcmV0dXJuZWRWYWx1ZSA9IGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgfVxuXG4gIGdhdGhlcihldmVudDogRXZlbnRzLkV2ZW50KTogYW55W10ge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWVzID0gW11cblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB2YWx1ZXMucHVzaChsaXN0ZW5lci5jYWxsYmFjayhldmVudCkpO1xuICAgIH0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXZlbnRIYW5kbGVyJztcbiJdfQ==
