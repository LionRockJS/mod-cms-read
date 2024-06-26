import { Model } from '@lionrockjs/central';

export default class TagType extends Model{
  name = null;

  static joinTablePrefix = 'tag_type';
  static tableName = 'tag_types';

  static fields = new Map([
    ["name", "String!"]
  ]);
  static hasMany = [
    ["tag_type_id", "Tag"]
  ];
}