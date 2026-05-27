import { Model } from '@lionrockjs/central';
export default class PageKeyword extends Model {
    page_id: any;
    language_code: any;
    name: any;
    keywords: any;
    static joinTablePrefix: string;
    static tableName: string;
    static fields: Map<string, string>;
    static belongsTo: Map<string, string>;
}
