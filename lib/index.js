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
        /**
         * 是否命中任何关键字,命中第一个时候会停止查找
         * @param str 要匹配的字符串
         */
        TextFilter.prototype.test = function (str) {
            return this.find(str, function (word) {
                return true;
            }).isFound;
        };
        /**
         * 查询所有命中的关键字,(如果关键词存在包含关系,只会命中短的关键字)
         * @param str
         */
        TextFilter.prototype.match = function (str) {
            var matchs = [];
            this.find(str, function (w) {
                matchs.push(w);
                return false;
            });
            return matchs;
        };
        /**
         * 替换命中的关键字为指定符号, (如果关键词存在包含关系,只会命中短的关键字)
         * @param str
         * @param char
         */
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
