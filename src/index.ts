

const code = String.fromCharCode(0x1e);

class TextFilter {
    private tree = {}
    private words = {};
    constructor() {

    }

    addWord(word) {
        if(this.words[word]){
            return false;
        }
        var tree: any = this.tree || {};
        for (var i = 0; i < word.length; i++) {
            var c=word[i];
            if (!tree[c]) {
                tree[c] = {
                    count:0
                }
            }
            tree[c].count+=1;
            tree = tree[c];
        }
        tree.isEnd = true
        this.words[word] = true;
        return this.tree;
    }
    removeWord(word:string){
        if(!this.words[word]){
            return false;
        }
        delete this.words[word];
        var tree:any=this.tree||{};
        for(var i=0;i<word.length;i++){
            var c=word[i];
            if(!tree[c]){
                break;
            }
            tree[c].count -= 1;
            if(tree[c].count==0){
                delete tree[c];
            }
            tree = tree[c];
        }
        return this.tree;
    }

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

    test(str) {
        return this.find(str, (word) => {
            return true;
        }).isFound;
    }

    match(str) {
        var matchs = [];
        this.find(str, (w) => {
            matchs.push(w);
            return false;
        });
        return matchs;
    }

    replace(str, char) {
        return this.find(str, (w, str) => {
            var reg = new RegExp(w, 'g');
            return str.replace(reg, (a) => {
                return a.replace(/./g, char);
            });
        }).str;
    }
}