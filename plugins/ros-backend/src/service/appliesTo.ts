const backstageAppliesToPrefix = 'backstage:';

export function getBackstageEntityRefFromAppliesTo(
  appliesTo: string,
): string | undefined {
  if (!appliesTo.startsWith(backstageAppliesToPrefix)) {
    return undefined;
  }

  const entityRef = appliesTo.slice(backstageAppliesToPrefix.length);

  return entityRef.length > 0 ? entityRef : undefined;
}
