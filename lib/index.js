(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined)
            module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
        factory(null, window);
    }
})(function (require, exports) {
    var code = String.fromCharCode(0x1e);
    var TextFilter = /** @class */ (function () {
        function TextFilter() {
            this.tree = {};
            this.words = {};
        }
        /**
         * 导出关键字树
         */
        TextFilter.prototype.export = function () {
            return this.tree;
        };
        /**
         * 导入关键字树
         * @param tree
         */
        TextFilter.prototype.import = function (tree) {
            this.tree = tree;
        };
        /**
         * 清空所有关键字
         */
        TextFilter.prototype.clear = function () {
            this.tree = {};
            this.words = {};
            return this;
        };
        /**
         * 添加关键字
         * @param words 关键字数组
         */
        TextFilter.prototype.addWords = function (words) {
            for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
                var word = words_1[_i];
                this.addWord(word);
            }
            return this;
        };
        /**
         * 删除关键字
         * @param words 关键字数组
         */
        TextFilter.prototype.removeWords = function (words) {
            for (var _i = 0, words_2 = words; _i < words_2.length; _i++) {
                var word = words_2[_i];
                this.removeWord(word);
            }
            return this;
        };
        /**
         * 添加关键字
         * @param word 关键字
         */
        TextFilter.prototype.addWord = function (word) {
            if (this.words[word]) {
                return this;
            }
            var tree = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                var c = word[i];
                if (!tree[c]) {
                    tree[c] = {
                        count: 0
                    };
                }
                tree[c].count += 1;
                tree = tree[c];
            }
            tree.isEnd = true;
            this.words[word] = true;
            return this;
        };
        /**
         * 删除关键字
         * @param word 关键字数组
         */
        TextFilter.prototype.removeWord = function (word) {
            if (!this.words[word]) {
                return this;
            }
            delete this.words[word];
            var tree = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                var c = word[i];
                if (!tree[c]) {
                    break;
                }
                tree[c].count -= 1;
                if (tree[c].count == 0) {
                    delete tree[c];
                }
                tree = tree[c];
            }
            return this;
        };
        /**
         * 执行查找
         * @param str 字符串
         * @param onMatch 匹配上时的回调
         */
        TextFilter.prototype.find = function (str, options) {
            if (!options) {
                options = {
                    onReplace: function (found_words, str_1) {
                        var reg = new RegExp(found_words.join('|'), 'g');
                        str_1 = str_1.replace(reg, function (a) {
                            return a.replace(/./g, code);
                        });
                        return str_1;
                    }
                };
            }
            var next_node = this.tree;
            var matchs = [];
            for (var i = 0; i < str.length; i++) {
                if (str[i] == code) {
                    continue;
                }
                var skip = 0;
                var found_words = [];
                var found_str = "";
                for (var j = i; j < str.length; j++) {
                    var char = str[j];
                    var tree_node = next_node[char];
                    if (!tree_node) {
                        skip = j - i;
                        next_node = this.tree;
                        break;
                    }
                    found_str = found_str + char;
                    if (tree_node.isEnd) {
                        found_words.unshift(found_str);
                        if (tree_node.count == 1 || options.isTest) {
                            skip = j - i;
                            next_node = this.tree;
                            break;
                        }
                    }
                    next_node = tree_node;
                }
                if (skip > 1) {
                    i += skip - 1;
                }
                if (found_words.length > 0) {
                    matchs.push.apply(matchs, found_words);
                    str = options.onReplace(found_words, str);
                }
            }
            return {
                isFound: matchs.length > 0,
                matchs: matchs,
                str: str
            };
        };
        /**
         * 是否命中任何关键字,命中第一个时候会停止查找
         * @param str 要匹配的字符串
         */
        TextFilter.prototype.test = function (str) {
            return this.find(str, { isTest: true }).isFound;
        };
        /**
         * 查询所有命中的关键字
         * @param str
         */
        TextFilter.prototype.match = function (str) {
            return this.find(str).matchs;
        };
        /**
         * 替换命中的关键字为指定符号
         * @param str
         * @param char
         */
        TextFilter.prototype.replace = function (str, char) {
            if (char === void 0) { char = "*"; }
            var m = this.find(str, {
                onReplace: function (ws, str) {
                    var reg = new RegExp(ws.join('|'), 'g');
                    return str.replace(reg, function (a) {
                        return a.replace(/./g, char);
                    });
                }
            });
            return m.str;
        };
        return TextFilter;
    }());
    exports.TextFilter = TextFilter;
});
