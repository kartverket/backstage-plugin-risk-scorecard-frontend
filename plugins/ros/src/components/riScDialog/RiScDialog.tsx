import { useState, useEffect } from 'react';
import { RiScWithMetadata } from '../../utils/types';
import { emptyRiSc, isDeeplyEqual } from '../../utils/utilityfunctions';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { useRiScs } from '../../contexts/RiScContext';
import { useForm } from 'react-hook-form';
import { Step, StepLabel, Stepper } from '@mui/material';
import ConfigEncryptionDialog from './ConfigEncryptionDialog';
import ConfigRiscInfo from './ConfigRiscInfo';
import ConfigInitialRisc from './ConfigInitialRisc';
import {
  Flex,
  Button,
  Text,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@backstage/ui';
import styles from './RiScDialog.module.css';
import { useDefaultRiScTypeDescriptors } from '../../contexts/DefaultRiScTypesContext.tsx';

export enum RiScDialogStates {
  Closed = 0,
  Create = 1,
  EditRiscInfo = 2,
  SelectInitialRisc = 3,
  EditEncryption = 4,
  Delete = 5,
}

interface RiScDialogProps {
  onClose: () => void;
  dialogState: RiScDialogStates;
  onDelete: () => void;
}

function RiScStepper({ activeStep }: { activeStep: number }) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const steps = [
    t('rosDialog.initialRiscTitle'),
    t('rosDialog.stepRiscDetails'),
    t('rosDialog.stepEncryption'),
  ];
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {steps.map(label => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export function RiScDialog({
  onClose,
  dialogState,
  onDelete,
}: RiScDialogProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const {
    selectedRiSc,
    riScs,
    selectRiSc,
    createNewRiSc,
    deleteRiSc,
    updateRiSc,
    gcpCryptoKeys,
  } = useRiScs();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RiScWithMetadata>({
    defaultValues:
      dialogState === RiScDialogStates.EditRiscInfo ||
      dialogState === RiScDialogStates.EditEncryption
        ? selectedRiSc!
        : {
            content: emptyRiSc(),
            sopsConfig: {
              shamir_threshold: 2,
            },
          },
    mode: 'onBlur',
  });

  const [activeStep, setActiveStep] = useState(0);

  const [switchOn, setSwitchOn] = useState(false);

  const { riScSelectedByDefault } = useDefaultRiScTypeDescriptors();
  const [selectedRiScId, setSelectedRiScId] = useState<string | undefined>(
    riScSelectedByDefault?.id,
  );
  useEffect(() => {
    setSelectedRiScId(riScSelectedByDefault?.id);
  }, [riScSelectedByDefault]);

  const handleNext = handleSubmit(
    () => {
      if (activeStep === 0) {
        setActiveStep(1);
      }
      if (activeStep === 1) {
        setActiveStep(2);
      }
    },
    // Continue to step 1 even if there are errors, as long as there are no errors in step 0 (the content)
    validationErrors => {
      if (activeStep === 0 && validationErrors.content === undefined) {
        setActiveStep(1);
      }
    },
  );

  function handleBack() {
    if (activeStep === 1) {
      setActiveStep(0);
    }
    if (activeStep === 2) {
      setActiveStep(1);
    }
  }

  const handleFinish = handleSubmit((data: RiScWithMetadata) => {
    if (dialogState === RiScDialogStates.Create) {
      createNewRiSc(data, switchOn, selectedRiScId);
    } else if (dialogState === RiScDialogStates.Delete) {
      deleteRiSc(() =>
        selectRiSc(riScs && riScs.length > 0 ? riScs[0].id : ''),
      );
    } else {
      // Do manual comparison of contents, as the sopsConfig field contains many values from the backend that are not
      // used or set by the frontend.
      // Check if the additional Age keys are equal, using the single important field, `recipient`
      const areAgeKeysEqual = isDeeplyEqual(
        data.sopsConfig.age?.map(age => age.recipient).sort(),
        selectedRiSc?.sopsConfig.age?.map(age => age.recipient).sort(),
      );

      // Check if the GCP keys are equal, using the two important fields, `resource_id` and `created_at`.
      // Comparison uses dictionaries, where resource ids are keys and created at dates are values
      const areGCPKeysEqual = isDeeplyEqual(
        Object.fromEntries(
          data.sopsConfig.gcp_kms?.map(key => [
            key.resource_id,
            key.created_at,
          ]) ?? [],
        ),
        Object.fromEntries(
          selectedRiSc?.sopsConfig.gcp_kms?.map(key => [
            key.resource_id,
            key.created_at,
          ]) ?? [],
        ),
      );

      // Only update the risc if it has changed
      if (
        !isDeeplyEqual(data, selectedRiSc, ['sopsConfig']) ||
        !areGCPKeysEqual ||
        !areAgeKeysEqual
      ) {
        updateRiSc(data);
      }
    }
    onClose();
  });

  if (dialogState === RiScDialogStates.Create) {
    return (
      <DialogTrigger>
        <Dialog
          isOpen={true}
          onOpenChange={onClose}
          className={styles.createRiscDialog}
        >
          <DialogHeader className={styles.initRiscDialogTitle}>
            <Text variant="title-small" weight="bold">
              {t('rosDialog.titleNew')}
            </Text>
          </DialogHeader>
          <DialogBody className={styles.riscDialogBody}>
            <RiScStepper activeStep={activeStep} />
            <Text
              as="h2"
              variant="title-x-small"
              weight="bold"
              className={styles.subtitle}
            >
              {activeStep === 0 && t('rosDialog.initialRiscTitle')}
              {activeStep === 1 && t('rosDialog.titleAndScope')}
              {activeStep === 2 && t('rosDialog.stepEncryption')}
            </Text>
            {activeStep === 0 && (
              <ConfigInitialRisc
                switchOn={switchOn}
                setSwitchOn={setSwitchOn}
                setValue={setValue}
                selectedRiScId={selectedRiScId}
                setSelectedRiScId={setSelectedRiScId}
              />
            )}
            {activeStep === 1 && (
              <ConfigRiscInfo
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            )}
            {activeStep === 2 && (
              <ConfigEncryptionDialog
                gcpCryptoKeys={gcpCryptoKeys}
                setValue={setValue}
                state={dialogState}
                register={register}
                errors={errors}
              />
            )}
            <Flex pt="16px" justify="between">
              <Button size="medium" variant="secondary" onClick={onClose}>
                {t('dictionary.cancel')}
              </Button>
              <Flex>
                <Button
                  size="medium"
                  variant="secondary"
                  isDisabled={activeStep === 0}
                  onClick={handleBack}
                >
                  {t('dictionary.previous')}
                </Button>
                {activeStep < 2 ? (
                  <Button size="medium" variant="primary" onClick={handleNext}>
                    {t('dictionary.next')}
                  </Button>
                ) : (
                  <Button
                    size="medium"
                    variant="primary"
                    onClick={handleFinish}
                  >
                    {t('dictionary.save')}
                  </Button>
                )}
              </Flex>
            </Flex>
          </DialogBody>
        </Dialog>
      </DialogTrigger>
    );
  }

  if (dialogState === RiScDialogStates.Delete) {
    return (
      <DialogTrigger>
        <Dialog
          isOpen={true}
          onOpenChange={onClose}
          className={styles.createRiscDialog}
        >
          <DialogHeader className={styles.riscDialogTitle}>
            <Text variant="title-x-small" weight="bold">
              {t('deleteDialog.title')}
            </Text>
          </DialogHeader>
          <DialogBody className={styles.riscDialogBody}>
            <Flex direction="column">
              {t('deleteDialog.confirmationMessage')}
              <Flex justify="between" pt="16px">
                <Button size="medium" variant="secondary" onClick={onClose}>
                  {t('dictionary.cancel')}
                </Button>
                <Button size="medium" variant="primary" onClick={handleFinish}>
                  {t('dictionary.delete')}
                </Button>
              </Flex>
            </Flex>
          </DialogBody>
        </Dialog>
      </DialogTrigger>
    );
  }

  if (dialogState === RiScDialogStates.EditRiscInfo) {
    return (
      <DialogTrigger>
        <Dialog
          isOpen={true}
          onOpenChange={onClose}
          className={styles.createRiscDialog}
        >
          <DialogHeader className={styles.riscDialogTitle}>
            <Text variant="title-x-small" weight="bold">
              {t('rosDialog.titleEdit')}
            </Text>
          </DialogHeader>
          <DialogBody className={styles.riscDialogBody}>
            <ConfigRiscInfo
              register={register}
              errors={errors}
              setValue={setValue}
              watch={watch}
            />
          </DialogBody>
          <DialogFooter className={styles.riscDialogFooter}>
            <Button
              size="medium"
              variant="tertiary"
              onClick={onDelete}
              className={styles.deleteButton}
            >
              <i className={`ri-delete-bin-line ${styles.deleteButtonIcon}`} />
              {t('contentHeader.deleteButton')}
            </Button>
            <Flex>
              <Button size="medium" variant="secondary" onClick={onClose}>
                {t('dictionary.cancel')}
              </Button>
              <Button size="medium" variant="primary" onClick={handleFinish}>
                {t('dictionary.save')}
              </Button>
            </Flex>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    );
  }

  if (dialogState === RiScDialogStates.EditEncryption) {
    return (
      <DialogTrigger>
        <Dialog
          isOpen={true}
          onOpenChange={onClose}
          className={styles.createRiscDialog}
        >
          <DialogHeader className={styles.riscDialogTitle}>
            <Text variant="title-small" weight="bold">
              {t('rosDialog.editEncryption')}
            </Text>
          </DialogHeader>
          <DialogBody className={styles.riscDialogBody}>
            <ConfigEncryptionDialog
              gcpCryptoKeys={gcpCryptoKeys}
              sopsData={selectedRiSc?.sopsConfig}
              setValue={setValue}
              state={dialogState}
              register={register}
              errors={errors}
            />
            <Flex justify="between" className={styles.riscDialogFooter}>
              <Button size="medium" variant="secondary" onClick={onClose}>
                {t('dictionary.cancel')}
              </Button>
              <Button size="medium" variant="primary" onClick={handleFinish}>
                {t('dictionary.save')}
              </Button>
            </Flex>
          </DialogBody>
        </Dialog>
      </DialogTrigger>
    );
  }

  return null;
}
