import { UpdatedStatusEnumType } from '../../utils/utilityfunctions.ts';
import { ActionStatusOptions } from '../../utils/constants.ts';
import { DeleteActionConfirmation } from '../scenarioDrawer/components/DeleteConfirmation.tsx';
import { Action } from '../../utils/types.ts';
import { useState } from 'react';
import { ActionEdit } from './ActionEdit.tsx';
import { ActionView } from './ActionView.tsx';

type ActionRowProps = {
  action: Action;
  onRefreshActionStatus: (action: Action) => void;
  onNewActionStatus: (actionId: string, newStatus: ActionStatusOptions) => void;
  onDeleteAction: (actionId: string) => void;
  onSaveAction: (
    newAction: Action,
    setIsEditing?: (isEditing: boolean) => void,
  ) => void;
  allowDeletion?: boolean;
  allowEdit?: boolean;
  optimisticStatus?: ActionStatusOptions;
  optimisticUpdatedStatus?: UpdatedStatusEnumType;
  index?: number;
};

export function ActionRow(props: ActionRowProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [deleteActionConfirmationIsOpen, setDeleteActionConfirmationIsOpen] =
    useState(false);

  return (
    <div key={props.action.ID}>
      {isEditing ? (
        <ActionEdit
          onSaveAction={(a: Action) => {
            props.onSaveAction(a, setIsEditing);
          }}
          onDeleteAction={() => setDeleteActionConfirmationIsOpen(true)}
          onCancelEdit={() => setIsEditing(false)}
          action={props.action}
        />
      ) : (
        <ActionView
          action={props.action}
          onRefreshActionStatus={props.onRefreshActionStatus}
          onNewActionStatus={props.onNewActionStatus}
          toggleEditMode={() => setIsEditing(!isEditing)}
          openDeleteDialog={() => setDeleteActionConfirmationIsOpen(true)}
          allowDeletion={props.allowDeletion}
          allowEdit={props.allowEdit}
          optimisticStatus={props.optimisticStatus}
          optimisticUpdatedStatus={props.optimisticUpdatedStatus}
          index={props.index}
        />
      )}
      <DeleteActionConfirmation
        isOpen={deleteActionConfirmationIsOpen}
        setIsOpen={setDeleteActionConfirmationIsOpen}
        onConfirm={() => props.onDeleteAction(props.action.ID)}
      />
    </div>
  );
}
