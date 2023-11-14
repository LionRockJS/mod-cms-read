import url from "node:url";
const dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
export default {dirname}

import ControllerContent from './classes/controller/Content';
import ControllerMixinContent from './classes/controller-mixin/Content';
import HelperLabel from './classes/helper/Label';
import HelperPageText from './classes/helper/PageText';

export {
  ControllerContent,
  ControllerMixinContent,
  HelperLabel,
  HelperPageText,
};