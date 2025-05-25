export type EnumValues<Type> = Type[keyof Type];

export enum CreationMethodEnum {
  EXTRACT_FROM_PDF = 'EXTRACT_FROM_PDF',
  TEMPLATE_GALLERY = 'TEMPLATE_GALLERY',
  NEW_TEMPLATE = 'NEW_TEMPLATE',
}

export enum SaveStatusEnum {
  IDLE,
  SAVING,
  SUCCESS,
  ERROR,
}

export enum UpdateTypeEnum {
  UPDATE,
  UPDATE_PUBLISH,
}

export enum EditorTypeEnum {
  VISUAL = 'visual',
  HANDLEBARS = 'handlebar',
}
