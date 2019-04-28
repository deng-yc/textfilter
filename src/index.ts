


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
            var tree_node: any = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                var c = word[i];
                if (!tree_node[c]) {
                    tree_node[c] = {
                        $: 0
                    }
                }
                tree_node[c].$ += 1;
                tree_node = tree_node[c];
            }
            tree_node.isEnd = true
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
            var tree_node: any = this.tree || {};
            for (var i = 0; i < word.length; i++) {
                var c = word[i];
                if (!tree_node[c]) {
                    break;
                }
                tree_node[c].$ -= 1;
                if (tree_node[c].$ == 0) {
                    delete tree_node[c];
                }
                tree_node = tree_node[c];
            }
            return this;
        }

        /**
         * 执行查找
         * @param str 字符串
         * @param onMatch 匹配上时的回调
         */
        private find(str, options?: {
            isTest?: boolean;
            replaceChar?: string
        }) {
            if (!options) {
                options = {};
            }
            if (!options.replaceChar) {
                options.replaceChar = String.fromCharCode(0x1e)
            }

            var tree_node = this.tree;
            var matchs = [];
            for (var i = 0; i < str.length; i++) {
                if (str[i] == options.replaceChar) {
                    continue;
                }
                var skip = 0;
                var found_words = [];
                var found_str = "";
                for (var j = i; j < str.length; j++) {
                    var char = str[j];
                    var current_node = tree_node[char];
                    if (!current_node) {
                        skip = j - i;
                        tree_node = this.tree;
                        break;
                    }
                    found_str = found_str + char;
                    if (current_node.isEnd) {
                        found_words.unshift(found_str);
                        if (current_node.$ == 1 || options.isTest) {
                            skip = j - i;
                            tree_node = this.tree;
                            break;
                        }
                    }
                    tree_node = current_node;
                }
                if (skip > 1) {
                    i += skip - 1;
                }
                if (found_words.length > 0) {
                    matchs.push(...found_words);
                    var reg = new RegExp(found_words.join('|'), 'g');
                    str = str.replace(reg, (a) => {
                        return a.replace(/./g, options.replaceChar);
                    });
                }
            }
            return {
                isFound: matchs.length > 0,
                matchs,
                str
            };
        }

        /**
         * 是否命中任何关键字,命中第一个时候会停止查找
         * @param str 要匹配的字符串
         */
        test(str) {
            return this.find(str, { isTest: true }).isFound;
        }

        /**
         * 查询所有命中的关键字
         * @param str
         */
        match(str) {
            return this.find(str).matchs;
        }
        /**
         * 替换命中的关键字为指定符号
         * @param str
         * @param char
         */
        replace(str, char = "*") {
            var m = this.find(str, {
                replaceChar: char
            });
            return m.str
        }
    }
    exports.TextFilter = TextFilter;
})