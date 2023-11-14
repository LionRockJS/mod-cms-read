import {Controller} from "@lionrockjs/mvc";
import {ControllerMixinMultipartForm} from "@lionrockjs/mod-form";
import {ControllerMixinMime, ControllerMixinView, ControllerMixinDatabase, Central, ORM} from "@lionrockjs/central";
import ControllerMixinContent from "../controller-mixin/Content";

import HelperPageText from "../helper/PageText";
import HelperLabel from "../helper/Label";

import Page from "../model/Page";
import PageTag from "../model/PageTag";

export default class ControllerContent extends Controller{
  static mixins = [...Controller.mixins,
    ControllerMixinMime,
    ControllerMixinView,
    ControllerMixinDatabase,
    ControllerMixinMultipartForm,
    ControllerMixinContent,
  ]

  constructor(request){
    super(request);

    this.state.get(ControllerMixinDatabase.DATABASE_MAP)
      .set('tag', `${Central.APP_PATH}/../database/tag.sqlite`)
      .set('content', `${Central.APP_PATH}/../database/content.sqlite`)

    this.language = this.language || Central.config.cms?.defaultLanguage || 'en';
  }

  static async readTranslate(database, language, layoutData){
    const translate = await ORM.readBy(Page, 'slug', ['translations'], {database, asArray:false, limit: 1});
    const label = translate ? HelperPageText.sourceToPrint(HelperPageText.getSource(translate), language, Central.config.cms.defaultLanguage) : {};
    Object.assign(layoutData, {label});
    return label;
  }

  static async filter_prints(language, database, type, filterTagSets) {
    const pages = await ORM.readBy(Page, 'page_type', [type], {database, asArray:true, orderBy: new Map([['weight', 'DESC']])});
    await ORM.eagerLoad(pages, {with: ["PageTag"]}, {database});

    return pages.map(page => {
      if(filterTagSets.length > 0){
        const tagCounts = filterTagSets.map(filterTagSet => {
          if(filterTagSet.size === 0 )return [1];

          return page.page_tags.map(it => filterTagSet.has(it.tag_id) ? 1 : 0).reduce((a,b)=>a+b, 0);
        });

        if(tagCounts.includes(0)) return null;
      }

      const print = HelperPageText.sourceToPrint(HelperPageText.getSource(page, {_id: page.id, _slug: page.slug, _weight: page.weight, _type: page.page_type}), language, Central.config.cms.defaultLanguage)
      if(print.tokens.start)print.tokens.start = HelperLabel.formatDate(print.tokens.start, language);
      if(print.tokens.end)print.tokens.end = HelperLabel.formatDate(print.tokens.end, language);
      return print;
    }).filter(it => (it!== null));
  }

  getFilterTagSets(filter_by_tags){
    if(!filter_by_tags)return [];

    return filter_by_tags.split(':').map(it => new Set(it.split(',').filter(y=>y!=="").map(y => parseInt(y))));
  }

  async action_index_json(){
    const prints = this.state.get(ControllerMixinContent.PRINTS);
    this.body = prints.map(it => ({
      id: it.tokens._id,
      slug: it.tokens._slug,
      keyvisual: it.tokens.keyvisual,
      name: it.tokens.name,
      teaser: it.tokens.teaser,
      start: it.tokens.start,
      end: it.tokens.end,
      tags: it.tags
    }));
  }

  async action_index(){
    const type = this.request.params.type;
    Object.assign(
      this.state.get(ControllerMixinView.LAYOUT).data,
      {
        page: type,
        section: type,
        stylesheets: ['content-list.css', `content/${type}/index.css`],
        defer_scripts: [`content/${type}/index.js`],
      }
    )

    const {filter_by_tags, sort} = this.state.get(ControllerMixinMultipartForm.GET_DATA);
    this.setTemplate(`templates/${type}/index`, {
      ...this.state.get(ControllerMixinView.TEMPLATE).data,
      ipcountry  : this.request.headers['cf-ipcountry'] || 'HK',
      items      : this.state.get(ControllerMixinContent.PRINTS),
      tags       : this.state.get(ControllerMixinContent.TAGS),
      all_tags   : this.state.get(ControllerMixinContent.ALL_TAGS),
      filters    : this.state.get(ControllerMixinContent.FILTERS),
      filter_ids : this.state.get(ControllerMixinContent.FILTER_IDS),
      label      : this.state.get(ControllerMixinContent.LABELS),
      tokens     : this.state.get(ControllerMixinContent.TOKENS),
      filter_query: filter_by_tags,
      sort_query: sort,
    });
  }

  async action_general(){
    const {slug} = this.request.params;
    const type = 'general';

    Object.assign(
      this.state.get(ControllerMixinView.LAYOUT).data,
      {
        page: `${type}/${slug}`,
        section: type,
        labels: this.state.get(ControllerMixinContent.LABELS),
      }
    )

    this.setTemplate(`templates/${slug}`, {
      ipcountry: this.request.headers['cf-ipcountry'] || 'HK',
      blocks: this.state.get(ControllerMixinContent.BLOCKS),
      tags: this.state.get(ControllerMixinContent.TAGS),
      type,
      slug,
      labels: this.state.get(ControllerMixinContent.LABELS),
      ...this.state.get(ControllerMixinContent.TOKENS),
    });
  }

  async action_read(){
    const {filter_by_tags, sort} = this.state.get(ControllerMixinMultipartForm.GET_DATA);
    const {slug, type} = this.request.params;
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('content');

    const page = await ORM.readBy(Page, 'slug', [slug], {database, limit:1 , asArray:false});
    const print = HelperPageText.pageToPrint(page, this.language, Central.config.cms.defaultLanguage);

    Object.assign(
      this.state.get(ControllerMixinView.LAYOUT).data,
      {
        page: `${type}/${slug}`,
        section: type,
        stylesheets: ['content-read.css', `content/${type}/read.css`],
        defer_scripts:[`content/${type}/read.js`]
      }
    )

    const label = await ControllerContent.readTranslate(database, this.language, this.state.get(ControllerMixinView.LAYOUT).data);

    //block sort by tokens._weight
    const sortedBlocks = print.blocks.sort((a, b) => {
      return a.tokens._weight - b.tokens._weight;
    })

    this.setTemplate(`templates/${type}/read`, {
      ipcountry: this.request.headers['cf-ipcountry'] || 'HK',
      tokens: print.tokens,
      blocks: sortedBlocks,
      tags: print.tags,
      type,
      slug,
      filter_query: filter_by_tags,
      sort_query: sort,
      label
    });
  }

}