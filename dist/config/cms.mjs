import { Central } from '@lionrockjs/central';
export default {
    databaseMap: new Map([
        ['content', `${Central.APP_PATH}/../database/content.sqlite`],
        ['tag', `${Central.APP_PATH}/../database/tag.sqlite`],
    ]),
    databasePath: `${Central.APP_PATH}/../database`,
    defaultLanguage: 'en',
    languages: ['en', 'zh-hant'],
};
