import {Central} from '@lionrockjs/central';
import ConfigCMS from './config/cms.mjs';

export default {
  configs: {
    cms: ConfigCMS,
  }
}

Central.viewFiles.set('sections/cms/items', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/sections/cms/items.liquid', { with: { type: 'text' } })
});

Central.viewFiles.set('sections/cms/content', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/sections/cms/content.liquid', { with: { type: 'text' } })
});

Central.viewFiles.set('sections/cms/pagination', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/sections/cms/pagination.liquid', { with: { type: 'text' } })
});

Central.viewFiles.set('sections/cms/tags', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/sections/cms/tags.liquid', { with: { type: 'text' } })
});

Central.viewFiles.set('templates/page/index', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/templates/page/index.json', { with: { type: 'json' } })
});

Central.viewFiles.set('templates/page/read', {
  package: '@lionrockjs/mod-cms-read',
  payload: await import('../views/templates/page/read.json', { with: { type: 'json' } })
});

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

export {
  ControllerContent,
  ControllerMixinContent,
  HelperLabel,
  HelperPageText,
  ModelPage,
  ModelPageKeyword,
  ModelPageTag,
  ModelTag,
  ModelTagType,
  routes
};
