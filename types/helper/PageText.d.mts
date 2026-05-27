export default class HelperPageText {
    static defaultOriginal(): {
        items: {};
        attributes: {};
        pointers: {};
        values: {};
    };
    static defaultOriginalItem(): {
        attributes: {};
        pointers: {};
        values: {};
    };
    static resolvePointer(database: any, original: any, language: any, masterLanguage: any): Promise<void>;
    static getOriginal(page: any, attributes?: {}): any;
    static tokenToObject(tokens: any): void;
    static flattenTokens(original: any, languageCode: any, masterLanguage?: any, sort?: boolean): any;
    static originalToPrint(original: any, languageCode: any, masterLanguageCode: any, sort?: boolean): {
        tokens: any;
        blocks: any[];
        tags: {};
    };
    static pageToPrint(page: any, languageCode: any, masterLanguageCode?: string): {
        tokens: any;
        blocks: any[];
        tags: {};
    };
}
