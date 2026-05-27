import { ControllerMixin } from '@lionrockjs/mvc';
export default class ControllerMixinContent extends ControllerMixin {
    static PRINTS: string;
    static FILTER_TAG_SETS: string;
    static TAGS: string;
    static ALL_TAGS: string;
    static FILTERS: string;
    static FILTER_IDS: string;
    static LABELS: string;
    static TOKENS: string;
    static PRINT: string;
    static BLOCKS: string;
    static init(state: any): void;
    static readTranslate(database: any, language: any): Promise<any>;
    static getFilterTagSets(filter_by_tags: any): any;
    static list(state: any): Promise<void>;
    static action_read(state: any): Promise<any>;
    static action_index_json(state: any): Promise<void>;
    static action_index(state: any): Promise<void>;
    static sibling(state: any, direction?: number): Promise<any>;
    static action_previous(state: any): Promise<void>;
    static action_next(state: any): Promise<void>;
}
