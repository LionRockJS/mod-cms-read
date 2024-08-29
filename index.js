import url from "node:url";
const dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
export default {dirname}

import ControllerContent from './classes/controller/Content.mjs';
import ControllerMixinContent from './classes/controller-mixin/Content.mjs';
import HelperLabel from './classes/helper/Label.mjs';
import HelperPageText from './classes/helper/PageText.mjs';
import ModelPage from './classes/model/Page.mjs';
import ModelPageKeyword from './classes/model/PageKeyword.mjs';
import ModelPageTag from './classes/model/PageTag.mjs';
import ModelTag from './classes/model/Tag.mjs';
import ModelTagType from './classes/model/TagType.mjs';

export {
  ControllerContent,
  ControllerMixinContent,
  HelperLabel,
  HelperPageText,
  ModelPage,
  ModelPageKeyword,
  ModelPageTag,
  ModelTag,
  ModelTagType
};