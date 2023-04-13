import React, { useEffect } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import NeoWorkflowEditorModal from './WorkflowEditorModal';
import { Button, MenuItem } from '@material-ui/core';
import { PlayArrow, Stop } from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import StopIcon from '@material-ui/icons/Stop';
import { DataGrid, gridClasses } from '@mui/x-data-grid';
import NeoWorkflowRunnerModal, { STEP_STATUS } from './NeoWorkflowRunnerModal';
import { getWorkflowsList } from './stateManagement/WorkflowSelectors';
import { deleteWorkflow } from './stateManagement/WorkflowActions';
import NeoField from '../../component/field/Field';
const styles = {};

export const NeoWorkflowListModal = ({
  open,
  setOpen,
  isRunning,
  index,
  setIndex,
  workflowDatabase,
  setWorkflowDatabase,
  databaseList,
  workflowStatus,
  setWorkflowStatus,
  runnerModalIsOpen,
  setRunnerModalIsOpen,
  currentRunIndex,
  currentWorkflowStatus,
  currentRun,
  results,
  workflowsList,
  deleteWorkflow,
}) => {
  /**
   * to comment
   * @returns
   */
  function getStatusMessage() {
    const messages = {};
    messages[STEP_STATUS.CANCELLED] = 'Cancelled';
    messages[STEP_STATUS.ERROR] = 'Error';
    messages[STEP_STATUS.COMPLETE] = 'Completed';
    return isRunning ? 'Running' : messages[currentWorkflowStatus] ? messages[currentWorkflowStatus] : '';
  }
  const [editorOpen, setEditorOpen] = React.useState(false);
  // The index of the selected workflow
  const [rows, setRows] = React.useState([]);

  // Text to show on the screen the currently selected database
  const [databaseText, setDatabaseText] = React.useState(workflowDatabase);

  // TODO: continue binding data to the UI
  useEffect(() => {
    let tmp = workflowsList.map((workflow, index) => {
      return { id: index, name: workflow.name, stepCount: workflow.steps.length };
    });
    setRows(tmp);
  }, [JSON.stringify(workflowsList)]);

  const columns = [
    { field: 'id', hide: true, headerName: 'ID', width: 150 },
    {
      field: 'name',
      headerName: 'Name',
      renderCell: (row) => {
        // TODO: find a cool way to show the status here
        return <div>{row.formattedValue}</div>;
      },
      width: 210,
    },
    {
      field: 'status',
      headerName: 'Status',
      renderCell: (row) => {
        // TODO: find a cool way to show the status here
        return <div>{row.id === currentRunIndex ? getStatusMessage() : ''}</div>;
      },
      width: 80,
    },
    { field: 'stepCount', headerName: 'Steps', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (row) => {
        return (
          <div>
            <IconButton
              onClick={() => {
                setRunnerModalIsOpen(true);
                setIndex(row.id);
              }}
              disabled={isRunning && row.id != currentRunIndex}
              style={{ padding: '6px' }}
            >
              <Badge overlap='rectangular' badgeContent={''}>
                <PlayArrow />
              </Badge>
            </IconButton>
            <IconButton
              onClick={() => {
                currentRun.abort('Stopped by UI');
              }}
              disabled={!(isRunning && row.id === currentRunIndex)}
              style={{ padding: '6px' }}
            >
              <Badge overlap='rectangular' badgeContent={''}>
                <StopIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={() => {
                setEditorOpen(true);
                setIndex(row.id);
              }}
              style={{ padding: '6px' }}
              disabled={isRunning && row.id == currentRunIndex}
            >
              <Badge overlap='rectangular' badgeContent={''}>
                <EditIcon />
              </Badge>
            </IconButton>
            <IconButton
              onClick={() => {
                deleteWorkflow(row.id);
              }}
              style={{ padding: '6px' }}
              disabled={isRunning && row.id == currentRunIndex}
            >
              <Badge overlap='rectangular' badgeContent={''}>
                <DeleteIcon />
              </Badge>
            </IconButton>
          </div>
        );
      },
      width: 160,
    },
  ];

  return (
    <>
      <Dialog
        maxWidth={'lg'}
        open={open == true}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          Workflows
          <IconButton
            onClick={() => {
              setOpen(false);
            }}
            style={{ padding: '3px', float: 'right' }}
          >
            <Badge overlap='rectangular' badgeContent={''}>
              <CloseIcon />
            </Badge>
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: '600px' }}>
          <div style={{ height: '380px' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              sx={{ [`& .${gridClasses.cell}`]: { py: 1 } }}
              rowsPerPageOptions={[5]}
              disableSelectionOnClick
              components={{ ColumnSortedDescendingIcon: () => <></>, ColumnSortedAscendingIcon: () => <></> }}
            />
          </div>
          <NeoField
            select
            placeholder='neo4j'
            label='Database'
            value={databaseText}
            style={{ width: '47%', maxWidth: '200px' }}
            choices={databaseList.map((database) => (
              <MenuItem key={database} value={database}>
                {database}
              </MenuItem>
            ))}
            onChange={(value) => {
              setDatabaseText(value);
              setWorkflowDatabase(value);
            }}
          />
          <Button
            onClick={() => {
              setIndex(workflowsList.length);
              setEditorOpen(true);
            }}
            style={{ float: 'right', backgroundColor: 'white', marginBottom: 10 }}
            variant='contained'
            size='medium'
            endIcon={<PlayArrow />}
          >
            Add Workflow
          </Button>
        </DialogContent>
      </Dialog>
      <NeoWorkflowEditorModal open={editorOpen} setOpen={setEditorOpen} index={index} />
      <NeoWorkflowRunnerModal
        open={runnerModalIsOpen}
        setOpen={setRunnerModalIsOpen}
        index={index}
        isRunning={isRunning}
        workflowStatus={workflowStatus}
        setWorkflowStatus={setWorkflowStatus}
        results={results}
        currentRunIndex={currentRunIndex}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  workflowsList: getWorkflowsList(state),
});

const mapDispatchToProps = (dispatch) => ({
  deleteWorkflow: (index) => {
    dispatch(deleteWorkflow(index));
  },
});
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NeoWorkflowListModal));
