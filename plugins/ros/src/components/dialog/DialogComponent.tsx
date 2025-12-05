import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Text,
} from '@backstage/ui';
import styles from './DialogComponent.module.css';

type DialogComponentProps = {
  isOpen: boolean;
  onClick: () => void;
  header?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

function DialogComponent({
  isOpen,
  onClick,
  header,
  children,
  footer,
  className,
}: DialogComponentProps) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onClick} className={className}>
      <DialogHeader className={styles.DialogHeader}>
        <Text variant="title-small" weight="bold">
          {header}
        </Text>
      </DialogHeader>
      <DialogBody>{children}</DialogBody>
      {footer && (
        <DialogFooter className={styles.DialogFooter}>{footer}</DialogFooter>
      )}
    </Dialog>
  );
}

export default DialogComponent;
