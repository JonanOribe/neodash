import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { GraphChartVisualizationProps } from '../GraphChartVisualization';
import { Card, CardHeader, IconButton } from '@material-ui/core';
import { NestedMenuItem, IconMenuItem } from 'mui-nested-menu';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import { RenderNode } from '../../../report/ReportRecordProcessing';
import { getNodeLabel } from '../util/NodeUtils';
import { GraphChartCreateModal } from './GraphChartCreateEntityModal';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import EditIcon from '@material-ui/icons/Edit';
import { Direction } from '../util/RelUtils';
import { handleGetNodeRelTypes } from '../util/GraphUtils';

export const GraphChartContextMenu = (props: GraphChartVisualizationProps) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState(undefined);
  const [neighbourRelCounts, setNeighbourRelCounts] = React.useState([]);
  const handleClose = () => {
    props.interactivity.setContextMenuOpen(false);
  };
  const dialogProps = { ...props, selectedNode: selectedNode, dialogOpen: dialogOpen, setDialogOpen: setDialogOpen };
  const dialog = <GraphChartCreateModal {...dialogProps} />;

  const menu = (
    <div
      style={{
        position: 'absolute',
        zIndex: 999,
        top: Math.min(props.interactivity.clickPosition.y, props.style.height - 200),
        left: Math.min(props.interactivity.clickPosition.x, props.style.width - 200),
      }}
    >
      <Card id='basic-menu'>
        <CardHeader
          style={{ marginTop: '-6px', marginBottom: '-8px', color: 'black' }}
          action={
            <IconButton
              aria-label='close'
              style={{
                padding: '4px',
                marginLeft: '20px',
                marginTop: '7px',
              }}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          }
          titleTypographyProps={{ variant: 'h6' }}
          title={props.interactivity.selectedEntity && props.interactivity.selectedEntity.labels}
        />
        <IconMenuItem
          rightIcon={<SearchIcon />}
          label='Inspect'
          onClick={() => {
            props.interactivity.setContextMenuOpen(false);
            props.interactivity.setPropertyInspectorOpen(true);
          }}
        ></IconMenuItem>
        <IconMenuItem
          rightIcon={<EditIcon />}
          label='Edit'
          onClick={() => {
            props.interactivity.setContextMenuOpen(false);
            props.interactivity.setPropertyInspectorOpen(true);
          }}
        ></IconMenuItem>

        <NestedMenuItem
          label='Expand...'
          nonce={undefined}
          parentMenuOpen={true}
          onMouseOver={() => {
            handleGetNodeRelTypes(props.interactivity.selectedEntity?.id, props.engine, setNeighbourRelCounts);
          }}
        >
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              {neighbourRelCounts &&
                neighbourRelCounts.map((item) => (
                  <tr>
                    <MenuItem
                      onClick={() => {
                        props.interactivity.setContextMenuOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <td style={{ width: '200px', overflow: 'hidden' }}>{item._fields[0]}</td>
                      <td style={{ width: '100px', overflow: 'hidden' }}>{item._fields[1]}</td>
                      <td style={{ width: 'auto', marginLeft: '15px' }}>{item._fields[2].low}</td>
                    </MenuItem>
                  </tr>
                ))}
            </table>
          </div>
        </NestedMenuItem>

        <NestedMenuItem label='Create relationship...' nonce={undefined} parentMenuOpen={true}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              {props.data &&
                props.data.nodes.map((node) => (
                  <tr>
                    <MenuItem
                      onClick={() => {
                        setSelectedNode(node);
                        props.interactivity.setContextMenuOpen(false);
                        setDialogOpen(true);
                      }}
                    >
                      <td style={{ width: '150px', overflow: 'hidden' }}>{RenderNode(node)}</td>
                      <td style={{ width: 'auto', marginLeft: '15px' }}>
                        {props.engine.selection[node.mainLabel] ? getNodeLabel(props.engine.selection, node) : ''}
                      </td>
                    </MenuItem>
                  </tr>
                ))}
            </table>
          </div>
        </NestedMenuItem>
      </Card>
    </div>
  );

  return (
    <>
      {dialog}
      {props.interactivity.contextMenuOpen ? menu : <></>}
    </>
  );
};
