import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  ros: {
    sops: {
      /**
       * Age private key used for decrypting SOPS-encrypted RiSc files.
       *
       * @visibility secret
       */
      ageKey: string;

      /** Public key used when encrypting for the backend. */
      backendPublicKey: string;

      /** Public key used when encrypting for the security team. */
      securityTeamPublicKey: string;

      /** Public key used when encrypting for the security platform. */
      securityPlatformPublicKey: string;
    };

    slack?: {
      /**
       * Webhook URL used for Slack notifications.
       *
       * @visibility secret
       */
      webhookUrl?: string;
    };

    initRiSc?: {
      /**
       * GitHub owner for the repository used when initializing new RiSc files.
       *
       * @default kartverket
       */
      repoOwner?: string;

      /**
       * GitHub repository used when initializing new RiSc files.
       *
       * @default risk-scorecards-init
       */
      repoName?: string;
    };

    gcp?: {
      /** Extra GCP project IDs allowed when evaluating KMS crypto keys. */
      additionalAllowedProjectIds?: string[];
    };
  };

  riskScorecard?: {
    riscIndex?: {
      /**
       * Schedule for refreshing the persisted RiSc index.
       *
       * @default { frequency: { cron: '0 0 * * *' }, timeout: { minutes: 30 } }
       */
      schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
    };
  };
}
