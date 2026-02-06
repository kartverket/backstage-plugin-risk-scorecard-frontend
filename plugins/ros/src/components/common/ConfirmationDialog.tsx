import { useState, ReactNode } from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../utils/translations';
import { Flex, Button } from '@backstage/ui';
import DialogComponent from '../dialog/DialogComponent';

type ConfirmationDialogWithCheckboxProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  checkboxLabel: string;
  children?: ReactNode;
  className?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

export function ConfirmationDialogWithCheckbox({
  isOpen,
  onCancel,
  onConfirm,
  title,
  checkboxLabel,
  children,
  className,
  confirmButtonText,
  cancelButtonText,
}: ConfirmationDialogWithCheckboxProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleCancel = () => {
    setIsChecked(false);
    onCancel();
  };

  const handleConfirm = () => {
    setIsChecked(false);
    onConfirm();
  };

  return (
    <DialogComponent
      isOpen={isOpen}
      onClick={handleCancel}
      header={title}
      className={className}
    >
      {children}
      <Alert severity="info" icon={false}>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
          }
          label={checkboxLabel}
        />
      </Alert>
      <Flex justify="between" pt="24px">
        <>
          <Button variant="secondary" size="medium" onClick={handleCancel}>
            {cancelButtonText || t('dictionary.cancel')}
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleConfirm}
            isDisabled={!isChecked}
          >
            {confirmButtonText || t('dictionary.confirm')}
          </Button>
        </>
      </Flex>
    </DialogComponent>
  );
}

interface ConfirmationDialogWithoutCheckboxProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  className?: string;
  children?: ReactNode;
}

export function ConfirmationDialogWithoutCheckbox({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmButtonText,
  cancelButtonText,
  className,
  children,
}: ConfirmationDialogWithoutCheckboxProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  return (
    <DialogComponent
      isOpen={isOpen}
      onClick={() => onClose?.()}
      header={title}
      className={className}
    >
      {children}
      <Flex justify="between">
        <Button
          variant="secondary"
          size="medium"
          onClick={event => {
            event.stopPropagation();
            onClose?.();
          }}
        >
          {cancelButtonText || t('dictionary.cancel')}
        </Button>
        <Button
          onClick={event => {
            event.stopPropagation();
            onConfirm?.();
          }}
          variant="primary"
          size="medium"
        >
          {confirmButtonText || t('dictionary.confirm')}
        </Button>
      </Flex>
    </DialogComponent>
  );
}
