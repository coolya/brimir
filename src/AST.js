"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.makeNode = exports.Concept = void 0;
var Concept = /** @class */ (function () {
    function Concept() {
    }
    return Concept;
}());
exports.Concept = Concept;
function makeNode(conceptId, owned, refs) {
    return __assign(__assign(__assign({}, owned), refs), { conceptId: conceptId, ref: function () {
            return new RefImpl(this);
        } });
}
exports.makeNode = makeNode;
var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        var _this = this;
        this.value = new Promise(function (resolve) { return resolve(_this._value); });
        this._value = value;
    }
    RefImpl.prototype.set = function (value) {
        this._value = value;
    };
    return RefImpl;
}());
//# sourceMappingURL=AST.js.map