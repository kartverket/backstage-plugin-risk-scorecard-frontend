export interface Config {
  riskScorecard?: {
    appliesTo?: {
      /**
       * Whether the applies-to picker should include all catalog entities, not
       * only entities in the current system.
       */
      includeAllEntities?: boolean;
    };
  };
}
