declare const code: string;
declare class TextFilter {
    private tree;
    private words;
    constructor();
    addWord(word: any): {};
    removeWord(word: string): {};
    private find;
    test(str: any): boolean;
    match(str: any): any[];
    replace(str: any, char: any): any;
}
