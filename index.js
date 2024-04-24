import url from "node:url";
const dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
export default {dirname}

import ControllerContent from './classes/controller/Content.mjs';
import ControllerMixinContent from './classes/controller-mixin/Content.mjs';
import HelperLabel from './classes/helper/Label.mjs';
import HelperPageText from './classes/helper/PageText.mjs';

export {
  ControllerContent,
  ControllerMixinContent,
  HelperLabel,
  HelperPageText,
};