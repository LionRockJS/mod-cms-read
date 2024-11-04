import {Controller} from "@lionrockjs/mvc";
import {ControllerMixinMultipartForm} from "@lionrockjs/mixin-form";
import {ControllerMixinMime, ControllerMixinView, ControllerMixinDatabase, Central, ORM} from "@lionrockjs/central";
import ControllerMixinContent from "../controller-mixin/Content.mjs";

import HelperPageText from "../helper/PageText.mjs";
import HelperLabel from "../helper/Label.mjs";

import DefaultPage from '../model/Page.mjs';
const Page = await ORM.import('Page', DefaultPage);

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

    this.state.set(Controller.STATE_LANGUAGE, this.state.get(Controller.STATE_LANGUAGE) || Central.config.cms?.defaultLanguage || 'en');
  }

  getFilterTagSets(filter_by_tags){
    if(!filter_by_tags)return [];

    return filter_by_tags.split(':').map(it => new Set(it.split(',').filter(y=>y!=="").map(y => parseInt(y))));
  }

  async action_index_json(){
    const prints = this.state.get(ControllerMixinContent.PRINTS);
    this.state.set(Controller.STATE_BODY, prints.map(it => ({
      id: it.tokens._id,
      slug: it.tokens._slug,
      keyvisual: it.tokens.keyvisual,
      name: it.tokens.name,
      teaser: it.tokens.teaser,
      start: it.tokens.start,
      end: it.tokens.end,
      tags: it.tags
    })));
  }

  async action_index(){
    const request = this.state.get(Controller.STATE_REQUEST);
    const {type} = this.state.get(Controller.STATE_PARAMS);
    const headers = request.headers;

    Object.assign(this.state.get(ControllerMixinView.LAYOUT).data, {type});

    const {filter_by_tags, sort} = this.state.get(ControllerMixinMultipartForm.GET_DATA);
    ControllerMixinView.setTemplate(this.state, `templates/${type}/index`, {
      ...this.state.get(ControllerMixinView.TEMPLATE).data,
      ipcountry  : headers['cf-ipcountry'] || 'HK',
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
    const {slug} = this.state.get(Controller.STATE_PARAMS);
    const type = 'general';
    const headers = this.state.get(Controller.STATE_HEADERS);

    Object.assign(
      this.state.get(ControllerMixinView.LAYOUT).data,
      {
        page: `${type}/${slug}`,
        section: type,
        labels: this.state.get(ControllerMixinContent.LABELS),
      }
    )

    ControllerMixinView.setTemplate(this.state, `templates/${slug}`, {
      ipcountry: headers['cf-ipcountry'] || 'HK',
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
    const {slug, type} = this.state.get(Controller.STATE_PARAMS);
    const headers = this.state.get(Controller.STATE_HEADERS);
    const database = this.state.get(ControllerMixinDatabase.DATABASES).get('content');
    const language = this.state.get(Controller.STATE_LANGUAGE);

    const page = await ORM.readBy(Page, 'slug', [slug], {database, limit:1 , asArray:false});
    const print = HelperPageText.pageToPrint(page, language, Central.config.cms.defaultLanguage);

    Object.assign(
      this.state.get(ControllerMixinView.LAYOUT).data,
      {
        type,
        slug
      }
    )

    const label = await ControllerMixinContent.readTranslate(database, language);

    //block sort by tokens._weight
    const sortedBlocks = print.blocks.sort((a, b) => {
      return a.tokens._weight - b.tokens._weight;
    })

    ControllerMixinView.setTemplate(this.state, `templates/${type}/read`, {
      ipcountry: headers['cf-ipcountry'] || 'HK',
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

  async action_next(){}
  async action_previous(){}
}