export const RiScStatusEnum = {
  CREATED: 0,
  DRAFT: 1,
  WAITING: 2,
  PUBLISHED: 3,
} as const;

export type RiScStatusEnumType =
  (typeof RiScStatusEnum)[keyof typeof RiScStatusEnum];

export type StatusIconMapType = Record<
  RiScStatusEnumType,
  { icon: React.ElementType; text: string }
>;
