export type EnumValues<Type> = Type[keyof Type];

export enum CreationMethodEnum {
  EXTRACT_FROM_PDF = 'Extract From PDF',
  TEMPLATE_GALLERY = 'Template Gallery',
  NEW_TEMPLATE = 'New Template',
}
