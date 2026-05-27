import { Central } from '@lionrockjs/central';

export default {
  databaseMap: new Map([
    ['content', `${(Central as any).APP_PATH}/../database/content.sqlite`],
    ['tag', `${(Central as any).APP_PATH}/../database/tag.sqlite`],
  ]),
  databasePath: `${(Central as any).APP_PATH}/../database`,
  defaultLanguage: 'en',
  languages: ['en', 'zh-hant'],
};
