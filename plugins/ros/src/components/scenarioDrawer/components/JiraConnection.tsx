import { Box, Button, Text, Flex } from '@backstage/ui';
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
  const { createIssue, deleteIssue } = useAuthenticatedFetch();
  const [openJiraDialog, setOpenJiraDialog] = useState(false);
  const [issueType, setIssueType] = useState('Task');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const jiraKeyField = formMethods.watch(
    `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}jiraKey`,
  );

  const handleCreateIssue = async () => {
    try {
      const result = await createIssue({
        title: issueTitle,
        description: issueDescription,
        issueType,
      });

      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
        result.url,
        { shouldValidate: true, shouldDirty: true },
      );
      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}jiraKey`,
        result.key,
        { shouldValidate: true, shouldDirty: true },
      );

      setIssueTitle('');
      setIssueDescription('');
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
      const issueKey = formMethods.getValues(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}jiraKey`,
      );
      const url = formMethods.getValues(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
      );

      // Pass either the key or URL - the hook will handle extraction
      const issueKeyOrUrl = issueKey || url;

      if (!issueKeyOrUrl) {
        throw new Error('No Jira issue key or URL found to delete.');
      }

      await deleteIssue(issueKeyOrUrl);
      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}url`,
        '',
        { shouldValidate: true, shouldDirty: true },
      );
      formMethods.setValue(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}jiraKey`,
        '',
        { shouldValidate: true, shouldDirty: true },
      );
    } catch (error) {
      throw new Error(`Error deleting issue: ${error}`);
    }
  };

  const handleOpenDialog = () => {
    setIssueTitle(
      formMethods.getValues(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}title`,
      ) || '',
    );
    setIssueDescription(
      formMethods.getValues(
        `${addPeriodToBaseObjectPath(baseObjectPathToActionOfForm)}description`,
      ) || '',
    );
    setOpenJiraDialog(true);
  };

  return (
    <Box>
      <Button onClick={handleOpenDialog}>Click to link Jira</Button>
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
            {jiraKeyField && (
              <>
                <strong>{jiraKeyField}</strong> -{' '}
              </>
            )}
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
