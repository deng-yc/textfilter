


((factory) => {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    } else {
        factory(null, window);
    }
})((require, exports) => {
    const code = String.fromCharCode(0x1e);
    class TextFilter {
        private tree = {}
        private words = {};
        constructor() {

        }
        /**
         * 导出关键字树
         */
        export() {
            return this.tree;
        }

        /**
         * 导入关键字树
         * @param tree
         */
        import(tree) {
            this.tree = tree;
        }

        /**
         * 清空所有关键字
         */
        clear() {
            this.tree = {};
            this.words = {};
            return this;
        }

        /**
         * 添加关键字
         * @param words 关键字数组
         */
        addWords(words: string[]) {
            for (var word of words) {
                this.addWord(word);
            }
            return this;
        }

        /**
         * 删除关键字
         * @param words 关键字数组
         */
        removeWords(words: string[]) {
            for (var word of words) {
                this.removeWord(word);
            }
            return this;
        }

        /**
         * 添加关键字
         * @param word 关键字
         */
        addWord(word: string) {
            if (this.words[word]) {
                return this;
            }
            var tree: any = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                var c = word[i];
                if (!tree[c]) {
                    tree[c] = {
                        count: 0
                    }
                }
                tree[c].count += 1;
                tree = tree[c];
            }
            tree.isEnd = true
            this.words[word] = true;
            return this;
        }

        /**
         * 删除关键字
         * @param word 关键字数组
         */
        removeWord(word: string) {
            if (!this.words[word]) {
                return this;
            }
            delete this.words[word];
            var tree: any = this.tree || {};
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
        }

        /**
         * 执行查找
         * @param str 字符串
         * @param onMatch 匹配上时的回调
         */
        private find(str, onMatch: (word, str) => boolean) {
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
                    temp = temp + char

                    if (next_tree[char].isEnd) {
                        is_found = true
                        skip = j - i
                        break
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
                            isFound,
                            str
                        };
                    }
                    else if (result !== false) {
                        str = result;
                    } else {
                        var reg = new RegExp(temp, 'g');
                        str = str.replace(reg, (a) => {
                            return a.replace(/./g, code);
                        });
                    }
                }
            }
            return {
                isFound,
                str
            };
        }

        /**
         * 是否命中任何关键字,命中第一个时候会停止查找
         * @param str 要匹配的字符串
         */
        test(str) {
            return this.find(str, (word) => {
                return true;
            }).isFound;
        }

        /**
         * 查询所有命中的关键字,(如果关键词存在包含关系,只会命中短的关键字)
         * @param str
         */
        match(str) {
            var matchs = [];
            this.find(str, (w) => {
                matchs.push(w);
                return false;
            });
            return matchs;
        }
        /**
         * 替换命中的关键字为指定符号, (如果关键词存在包含关系,只会命中短的关键字)
         * @param str
         * @param char
         */
        replace(str, char) {
            return this.find(str, (w, str) => {
                var reg = new RegExp(w, 'g');
                return str.replace(reg, (a) => {
                    return a.replace(/./g, char);
                });
            }).str;
        }
    }
    exports.TextFilter = TextFilter;
})