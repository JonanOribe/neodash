import { buildGraphVisualizationObjectFromRecords } from '../../../../chart/graph/util/RecordUtils';

// Helper function to extract Neo4j types (nodes and relationships) from a records object.
export const generateVisualizationDataGraph = (records, nodeLabels, linkTypes, colorScheme, fields, settings) => {
  let nodes: Record<string, any>[] = [];
  let links: Record<string, any>[] = [];
  const extractedGraphFromRecords = buildGraphVisualizationObjectFromRecords(
    records,
    nodes,
    links,
    nodeLabels,
    linkTypes,
    colorScheme,
    fields,
    settings.nodeColorProp,
    settings.defaultNodeColor,
    settings.nodeSizeProp,
    settings.defaultNodeSize,
    settings.relWidthProp,
    settings.defaultRelWidth,
    settings.relColorProp,
    settings.defaultRelColor,
    settings.styleRules
  );
  return extractedGraphFromRecords;
};

// Helper function to extract a dependency map from the parsed relationships.
export function createDependenciesMap(links) {
  const dependencies = {};
  links.forEach((l) => {
    if (!dependencies[l.target]) {
      dependencies[l.target] = [];
    }
    dependencies[l.target].push(l.source);
  });
  return dependencies;
}

// Helper function to extract a list of task objects from the parsed nodes.
export function createTasksList(nodes, dependencies, startDateProperty, endDateProperty, nameProperty) {
  return nodes
    .map((n) => {
      const neoStartDate = n.properties[startDateProperty];
      const neoEndDate = n.properties[endDateProperty];
      const name = n.properties[nameProperty];

      // If any of the dates cannot be parsed, we do not visualize this node.
      if (
        !neoStartDate ||
        !neoStartDate.year ||
        !neoStartDate.month ||
        !neoStartDate.day ||
        !neoEndDate ||
        !neoEndDate.year ||
        !neoEndDate.month ||
        !neoEndDate.day
      ) {
        return undefined;
      }
      return {
        start: new Date(neoStartDate.year, neoStartDate.month, neoStartDate.day),
        end: new Date(neoEndDate.year, neoEndDate.month, neoEndDate.day),
        name: name ? name : '(undefined)',
        dependencies: dependencies[n.id],
        id: `${n.id}`,
        properties: n.properties,
        labels: n.labels,
        type: 'task',
        progress: 100,
        // custom_class: 'bar-milestone',
        isDisabled: true,
        styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
      };
    })
    .filter((i) => i !== undefined);
}
