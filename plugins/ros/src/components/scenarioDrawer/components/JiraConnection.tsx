import { Box, Button, Text, Flex } from '@backstage/ui';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { pluginRiScTranslationRef } from '../../../utils/translations.ts';
import { useState } from 'react';
import DialogComponent from '../../dialog/DialogComponent.tsx';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useAuthenticatedFetch } from '../../../utils/hooks';
import { UseFormReturn } from 'react-hook-form';

function addPeriodToBaseObjectPath(s: string) {
  if (!s) return '';
  return `${s}.`;
}

type JiraConnectionProps = {
  formMethods: UseFormReturn<any>;
  baseObjectPathToActionOfForm?: string;
};

export function JiraConnection({
  formMethods,
  baseObjectPathToActionOfForm = '',
}: JiraConnectionProps) {
  const { t } = useTranslationRef(pluginRiScTranslationRef);

  const { createIssue, deleteIssue } = useAuthenticatedFetch();
  const [openJiraDialog, setOpenJiraDialog] = useState(false);
  const [issueType, setIssueType] = useState('Task');
  const [createdIssue, setCreatedIssue] = useState<{
    key: string;
    url: string;
  } | null>(null);

  const [issueTitle, setIssueTitle] = useState(() =>
    formMethods.getValues(
      `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}title`,
    ),
  );
  const [issueDescription, setIssueDescription] = useState(() =>
    formMethods.getValues(
      `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}description`,
    ),
  );

  const handleCreateIssue = async () => {
    try {
      const result = await createIssue({
        title: issueTitle,
        description: issueDescription,
        issueType,
      });
      setCreatedIssue(result);

      setIssueTitle('');
      setIssueDescription('');
      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
        result.url,
        { shouldValidate: true, shouldDirty: true },
      );
      setOpenJiraDialog(false);
    } catch (error) {
      throw new Error(`Error creating issue: ${error}`);
    }
  };
  const urlField = formMethods.watch(
    `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
  );

  const handleDeleteIssue = async () => {
    try {
      await deleteIssue(createdIssue?.key || '');
      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
        '',
        { shouldValidate: true, shouldDirty: true },
      );
      setCreatedIssue(null);
    } catch (error) {
      throw new Error(`Error deleting issue: ${error}`);
    }
  };

  return (
    <Box>
      <Button onClick={() => setOpenJiraDialog(true)}>
        Click to link Jira
      </Button>
      {openJiraDialog && (
        <DialogComponent
          isOpen={openJiraDialog}
          onClick={() => setOpenJiraDialog(false)}
          header="Create Jira Issue"
        >
          <Flex direction="column" gap="16px">
            <input
              type="text"
              placeholder="Title"
              value={issueTitle}
              onChange={e => setIssueTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={issueDescription}
              onChange={e => setIssueDescription(e.target.value)}
            />
            <select
              value={issueType}
              onChange={e => setIssueType(e.target.value)}
            >
              <option>Task</option>
              <option>Asset</option>
              <option>Request</option>
            </select>
          </Flex>
          <Button onClick={handleCreateIssue}>Create Issue</Button>
        </DialogComponent>
      )}
      {urlField &&
        !formMethods.formState.isDirty &&
        !formMethods.formState.isSubmitting && (
          <Flex mt="2" align="center" gap="1">
            <Text>Created Issue: </Text>
            {createdIssue?.key ? (
              <>
                <strong>{createdIssue.key}</strong> -{' '}
                <a
                  href={urlField}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'blue',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  View In Jira
                </a>
              </>
            ) : (
              <a
                href={urlField}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'blue',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                View In Jira
              </a>
            )}
            <IconButton
              aria-label="Unlink Jira Issue"
              size="small"
              onClick={handleDeleteIssue}
              sx={{ ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Flex>
        )}
    </Box>
  );
}
