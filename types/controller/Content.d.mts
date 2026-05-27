import { Controller } from "@lionrockjs/mvc";
export default class ControllerContent extends Controller {
    static mixins: typeof import("@lionrockjs/mvc").ControllerMixin[];
    constructor(request: any);
    getFilterTagSets(filter_by_tags: any): any;
    action_index_json(): Promise<void>;
    action_index(): Promise<void>;
    action_general(): Promise<void>;
    action_read(): Promise<void>;
    action_next(): Promise<void>;
    action_previous(): Promise<void>;
}
