(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var code = String.fromCharCode(0x1e);
    var TextFilter = /** @class */ (function () {
        function TextFilter() {
            this.tree = {};
            this.words = {};
        }
        TextFilter.prototype.addWord = function (word) {
            var tree = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                if (!tree[word[i]])
                    tree[word[i]] = {};
                tree = tree[word[i]];
            }
            tree.isEnd = true;
            this.words[word] = true;
        };
        TextFilter.prototype.find = function (str, onMatch) {
            var next_tree = this.tree;
            var isFound = false;
            for (var i = 0; i < str.length; i++) {
                if (str[i] == code) {
                    continue;
                }
                var is_found = false;
                var skip = 0;
                var temp = '';
                for (var j = i; j < str.length; j++) {
                    var char = str[j];
                    if (!next_tree[char]) {
                        is_found = false;
                        skip = j - i;
                        next_tree = this.tree;
                        break;
                    }
                    temp = temp + char;
                    if (next_tree[char].isEnd) {
                        is_found = true;
                        skip = j - i;
                        break;
                    }
                    next_tree = next_tree[char];
                }
                if (skip > 1) {
                    i += skip - 1;
                }
                if (is_found) {
                    isFound = true;
                    var result = onMatch(temp, str);
                    if (result === true) {
                        return {
                            isFound: isFound,
                            str: str
                        };
                    }
                    else if (result !== false) {
                        str = result;
                    }
                    else {
                        var reg = new RegExp(temp, 'g');
                        str = str.replace(reg, function (a) {
                            return a.replace(/./g, code);
                        });
                    }
                }
            }
            return {
                isFound: isFound,
                str: str
            };
        };
        TextFilter.prototype.test = function (str) {
            return this.find(str, function (word) {
                return true;
            }).isFound;
        };
        TextFilter.prototype.match = function (str) {
            var matchs = [];
            this.find(str, function (w) {
                matchs.push(w);
                return false;
            });
            return matchs;
        };
        TextFilter.prototype.replace = function (str, char) {
            return this.find(str, function (w, str) {
                var reg = new RegExp(w, 'g');
                return str.replace(reg, function (a) {
                    return a.replace(/./g, char);
                });
            }).str;
        };
        return TextFilter;
    }());
    exports.TextFilter = TextFilter;
});
