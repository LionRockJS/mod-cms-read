import { ControllerMixinDatabase, Central, ORM } from "@lionrockjs/central";
import { Controller, ControllerMixin } from '@lionrockjs/mvc';
import HelperPageText from "../helper/PageText.mjs";
import HelperLabel from "../helper/Label.mjs";
import { ControllerMixinMultipartForm } from "@lionrockjs/mixin-form";

import DefaultPage from '../model/Page.mjs';
import DefaultPageTag from '../model/PageTag.mjs';
import DefaultTagType from '../model/TagType.mjs';

const Page = await ORM.import('Page', DefaultPage);
const PageTag = await ORM.import('PageTag', DefaultPageTag);
const TagType = await ORM.import('TagType', DefaultTagType);

export default class ControllerMixinContent extends ControllerMixin {
  static PRINTS = 'contentPrints';
  static FILTER_TAG_SETS = 'contentFilterTagSets';
  static TAGS = 'contentTags';
  static ALL_TAGS = 'contentAllTags';
  static FILTERS = 'contentFilters';
  static FILTER_IDS = 'contentFilterIds';
  static LABELS = 'contentLabels';
  static TOKENS = 'contentTokens';
  static PRINT = 'contentPrint';
  static BLOCKS = 'contentBlocks';

  static init(state) {

  }

  static async readTranslate(database, language){
    const translate = await ORM.readBy(Page, 'slug', ['translations'], {database, asArray:false, limit: 1});
    if(!translate)return {};

    const data = HelperPageText.sourceToPrint(HelperPageText.getSource(translate), language, Central.config.cms.defaultLanguage);
    const label = data.tokens || {};
    Object.keys(label).forEach(key => {
      if(/^__/.test(key)){
        //map __key to key
        label[key.replace(/^__/, '')] = label[key];
        delete label[key];
      }
    })
    return label;
  }

  static getFilterTagSets(filter_by_tags){
    if(!filter_by_tags)return [];
    return filter_by_tags.split(':').map(it => new Set(it.split(',').filter(y=>y!=="").map(y => parseInt(y))));
  }

  static async list(state){
    const language = state.get(Controller.STATE_LANGUAGE);
    const {type} = state.get(Controller.STATE_PARAMS);

    const {filter_by_tags} = state.get(ControllerMixinMultipartForm.GET_DATA);
    const filterTagSets = this.getFilterTagSets(filter_by_tags);

    const database = state.get(ControllerMixinDatabase.DATABASES).get('content');

    const pages = await ORM.readBy(Page, 'page_type', [type], {database, asArray:true, orderBy: new Map([['weight', 'DESC']])});
    await ORM.eagerLoad(pages, {with: ["PageTag"]}, {database});

    const prints = pages.map(page => {
      if(page.start && new Date(page.start) < new Date())return null;
      if(page.end && new Date(page.end) > new Date())return null;

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


    state.set(this.PRINTS, prints);
    state.set(this.FILTER_TAG_SETS, filterTagSets);
  }

  static async action_read(state){
    const language = state.get(Controller.STATE_LANGUAGE);
    const {type, slug} = state.get(Controller.STATE_PARAMS);
    const database = state.get(ControllerMixinDatabase.DATABASES).get('content');

    const page = await ORM.readWith(Page, [['', 'slug', 'EQUAL', slug], ['AND', 'page_type', 'EQUAL', type]], {database, asArray:false, limit: 1});
    if(page.start && new Date(page.start) < new Date())return null;
    if(page.end && new Date(page.end) > new Date())return null;

    const print = HelperPageText.pageToPrint(page, language, Central.config.cms.defaultLanguage);

    state.set(this.TOKENS, print.tokens);
    state.set(this.PRINT, print);
    state.set(this.BLOCKS, print.blocks);
  }

  static async action_index_json(state){
    await this.list(state);

    const headers = state.get(Controller.STATE_HEADERS);
    Object.assign(headers, {'Content-Type': 'application/json; charset=utf-8'})
  }

  static async action_index(state) {
    await this.list(state);

    const language = state.get(Controller.STATE_LANGUAGE);
    const {type} = state.get(Controller.STATE_PARAMS);
    /** manage tags **/
    const database = state.get(ControllerMixinDatabase.DATABASES).get('content');
    const dbTags   = state.get(ControllerMixinDatabase.DATABASES).get('tag');

    const tagTypes = await ORM.readAll(TagType, {database: dbTags, asArray:true})
    await ORM.eagerLoad(tagTypes, {with: ['Tag']}, {database: dbTags});

    const pageTags = await ORM.readAll(PageTag, {database, asArray:true});
    const pageTagSet = new Set(pageTags.map(it => it.tag_id));

    const tags = {};
    const all_tags ={};
    const filters = [];
    const filter_ids = [];
    const filterTagSets = state.get(this.FILTER_TAG_SETS);

    const tagSet = filterTagSets.reduce((combined, list) => {
      return new Set([...combined, ...list]);
    }, new Set());

    tagTypes.forEach(it => {
      all_tags[it.name] = it.tags.map( tag => {
        if(!pageTagSet.has(tag.id)) return null;
        return HelperPageText.sourceToPrint(HelperPageText.getSource(tag, {_id: tag.id, _name: tag.name}), language, Central.config.cms.defaultLanguage)
      }).filter(y => y !== null);

      //tags is subset of all tags, which not include filtered tags
      tags[it.name] = all_tags[it.name].map( print =>{
        const tagId = print.tokens._id;
        if(tagSet.has(tagId)){
          filters.push(print);
          filter_ids.push(tagId);
          return null;
        }
        return print;
      }).filter(y => y!== null);
    });

    state.set(this.TAGS, tags);
    state.set(this.ALL_TAGS, all_tags);
    state.set(this.FILTERS, filters);
    state.set(this.FILTER_IDS, filter_ids);

    const labels = await this.readTranslate(database, language);
    state.set(this.LABELS, labels.tokens);

    //get general type_index
    const content = await ORM.readBy(Page, 'slug', [type+'-index'], {database, asArray:false, limit: 1});
    if(content){
      const print = HelperPageText.sourceToPrint(HelperPageText.getSource(content), language, Central.config.cms.defaultLanguage);
      state.set(this.TOKENS, print.tokens);
    }
  }

  static async sibling(state, direction=1){
    const client = state.get('client');
    const language = state.get(Controller.STATE_LANGUAGE);
    const {slug, type} = state.get(Controller.STATE_PARAMS);
    const {filter_by_tags} = state.get(ControllerMixinMultipartForm.GET_DATA);

    await this.list(state);

    const slugs = items.map(it => it.tokens._slug);
    for(let i=0;i< slugs.length; i++){
      if(slugs[i] === slug){
        const targetSlug = (slugs[i + direction] === undefined) ? slugs.pop() : slugs[i+direction];
        return client.redirect(`/${language}/${type}/${targetSlug}${filter_by_tags ? '?filter_by_tags='+filter_by_tags : ''}`);
      }
    }
    return client.redirect(`/${language}/${type}/${filter_by_tags ? '?filter_by_tags='+filter_by_tags : ''}`);
  }

  static async action_previous(state){
    await this.sibling(state, 1);
  }

  static async action_next(state){
    //first item is the latest item
    await this.sibling(state, -1);
  }
}