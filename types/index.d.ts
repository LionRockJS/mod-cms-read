declare const _default: {
    configs: {
        cms: {
            databaseMap: Map<string, string>;
            databasePath: string;
            defaultLanguage: string;
            languages: string[];
        };
    };
};
export default _default;
import routes from './routes.mjs';
import ControllerContent from './controller/Content.mjs';
import ControllerMixinContent from './controller-mixin/Content.mjs';
import HelperLabel from './helper/Label.mjs';
import HelperPageText from './helper/PageText.mjs';
import ModelPage from './model/Page.mjs';
import ModelPageKeyword from './model/PageKeyword.mjs';
import ModelPageTag from './model/PageTag.mjs';
import ModelTag from './model/Tag.mjs';
import ModelTagType from './model/TagType.mjs';
export { ControllerContent, ControllerMixinContent, HelperLabel, HelperPageText, ModelPage, ModelPageKeyword, ModelPageTag, ModelTag, ModelTagType, routes };
