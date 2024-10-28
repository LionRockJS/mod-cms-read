import { Central } from '@lionrockjs/central';
import { RouteList } from '@lionrockjs/router';

RouteList.add(`${Central.config.language.route}/pages/:type`, 'controller/Content');
RouteList.add(`${Central.config.language.route}/pages/:type/:slug`, 'controller/Content', 'read');
RouteList.add(`${Central.config.language.route}/pages/next/:type/:slug`, 'controller/Content', 'next');
RouteList.add(`${Central.config.language.route}/pages/prev/:type/:slug`, 'controller/Content', 'previous');