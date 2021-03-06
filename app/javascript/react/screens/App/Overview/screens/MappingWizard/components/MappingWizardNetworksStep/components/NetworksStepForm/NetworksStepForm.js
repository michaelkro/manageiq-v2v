import React from 'react';
import PropTypes from 'prop-types';
import { bindMethods } from 'patternfly-react';
import cx from 'classnames';

import DualPaneMapper from '../../../DualPaneMapper/DualPaneMapper';
import DualPaneMapperList from '../../../DualPaneMapper/DualPaneMapperList';
import DualPaneMapperCount from '../../../DualPaneMapper/DualPaneMapperCount';
import DualPaneMapperListItem from '../../../DualPaneMapper/DualPaneMapperListItem';
import MappingWizardTreeView from '../../../MappingWizardTreeView/MappingWizardTreeView';

import {
  sourceNetworksFilter,
  clustersMappingWithTreeViewAttrs,
  targetNetworkWithTreeViewAttrs,
  networkGroupingForRep,
  mappingsForTreeView
} from './helpers';

class NetworksStepForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedSourceNetworks: [],
      selectedTargetNetwork: null,
      selectedNode: null
    };

    bindMethods(this, [
      'selectSourceNetwork',
      'selectTargetNetwork',
      'addNetworkMapping',
      'selectNode',
      'removeNode',
      'removeAll'
    ]);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.selectedCluster &&
      nextProps.selectedCluster.id !== this.props.selectedCluster.id
    ) {
      this.setState(() => ({
        selectedSourceNetworks: [],
        selectedTargetNetwork: null
      }));
    }
  }

  selectSourceNetwork(sourceNetwork) {
    this.setState(prevState => {
      const isAlreadySelected = prevState.selectedSourceNetworks.some(
        selectedSourceNetwork =>
          selectedSourceNetwork.uid_ems === sourceNetwork.uid_ems
      );
      if (isAlreadySelected) {
        return {
          selectedSourceNetworks: prevState.selectedSourceNetworks.filter(
            selectedSourceNetwork =>
              selectedSourceNetwork.uid_ems !== sourceNetwork.uid_ems
          )
        };
      }
      return {
        selectedSourceNetworks: [
          ...prevState.selectedSourceNetworks,
          sourceNetwork
        ]
      };
    });
  }

  selectTargetNetwork(targetNetwork) {
    this.setState(() => ({ selectedTargetNetwork: targetNetwork }));
  }

  addNetworkMapping() {
    const {
      input: { value: networksStepMappings, onChange },
      selectedCluster,
      selectedClusterMapping,
      groupedSourceNetworks
    } = this.props;

    const { selectedTargetNetwork, selectedSourceNetworks } = this.state;

    const noMappingForTargetCluster = !networksStepMappings.some(
      targetClusterWithNetworkMappings =>
        targetClusterWithNetworkMappings.id === selectedClusterMapping.id
    );

    const addingToExistingMapping = networksStepMappings.some(
      targetClusterWithNetworkMappings =>
        targetClusterWithNetworkMappings.nodes.some(
          networkMapping => networkMapping.id === selectedTargetNetwork.id
        )
    );

    if (networksStepMappings.length === 0 || noMappingForTargetCluster) {
      // ADD A NETWORKS STEP MAPPING
      //   targetCluster
      //   -- selectedTargetNetwork
      //   ----  [...network groupings for selected source networks]
      const networksStepMappingToAdd = {
        ...clustersMappingWithTreeViewAttrs(selectedClusterMapping),
        nodes: [
          {
            ...targetNetworkWithTreeViewAttrs(selectedTargetNetwork),
            nodes: selectedSourceNetworks.reduce(
              (sourceNetworks, sourceNetworkGroupRep) => [
                ...sourceNetworks,
                ...networkGroupingForRep(
                  sourceNetworkGroupRep,
                  groupedSourceNetworks,
                  selectedCluster
                )
              ],
              []
            )
          }
        ]
      };
      onChange([...networksStepMappings, networksStepMappingToAdd]);
    } else {
      const updatedNetworksStepMappings = networksStepMappings.map(
        targetClusterWithNetworkMappings => {
          if (
            targetClusterWithNetworkMappings.id !== selectedClusterMapping.id
          ) {
            return targetClusterWithNetworkMappings;
          } else if (addingToExistingMapping) {
            // ADD TO EXISTING NETWORKS MAPPING
            //   matchingTargetCluster
            //   -- selectedTargetNetwork
            //   ---- [...alreadyMappedSourceNetworks, ...network groupings for selected source networks]
            return {
              ...targetClusterWithNetworkMappings,
              nodes: targetClusterWithNetworkMappings.nodes.map(
                networkMapping => {
                  if (networkMapping.id === selectedTargetNetwork.id) {
                    return {
                      ...networkMapping,
                      nodes: [
                        ...networkMapping.nodes,
                        ...selectedSourceNetworks.reduce(
                          (sourceNetworks, networkGroupRep) => [
                            ...sourceNetworks,
                            ...networkGroupingForRep(
                              networkGroupRep,
                              groupedSourceNetworks,
                              selectedCluster
                            )
                          ],
                          []
                        )
                      ]
                    };
                  }
                  return networkMapping;
                }
              )
            };
          }
          // ADD TO EXISTING NETWORKS STEP MAPPING
          //   matchingTargetCluster
          //   -- existingNetworkMapping(s)
          //   -- selectedTargetNetwork
          //   ---- [...network groupings for selected source networks]
          return {
            ...targetClusterWithNetworkMappings,
            nodes: [
              ...targetClusterWithNetworkMappings.nodes,
              {
                ...targetNetworkWithTreeViewAttrs(selectedTargetNetwork),
                nodes: selectedSourceNetworks.reduce(
                  (sourceNetworks, networkGroupRep) => [
                    ...sourceNetworks,
                    ...networkGroupingForRep(
                      networkGroupRep,
                      groupedSourceNetworks,
                      selectedCluster
                    )
                  ],
                  []
                )
              }
            ]
          };
        }
      );
      onChange(updatedNetworksStepMappings);
    }

    this.setState(prevState => ({
      selectedTargetNetwork: null,
      selectedSourceNetworks: []
    }));
  }

  selectNode(selectedNode) {
    const { value: networksStepMappings, onChange } = this.props.input;
    const isTargetNetwork = selectedNode.nodes;

    if (isTargetNetwork) {
      const updatedMappings = networksStepMappings.map(
        targetClusterWithNetworksMappings => {
          const {
            nodes: networksMappings,
            ...targetCluster
          } = targetClusterWithNetworksMappings;
          return {
            ...targetCluster,
            nodes: networksMappings.map(networksMapping => {
              const {
                nodes: sourceNetworks,
                ...targetNetwork
              } = networksMapping;
              return targetNetwork.id === selectedNode.id
                ? {
                    ...targetNetwork,
                    selected: !targetNetwork.selected,
                    nodes: sourceNetworks.map(sourceNetwork => ({
                      ...sourceNetwork,
                      selected: false
                    }))
                  }
                : {
                    ...targetNetwork,
                    selected: false,
                    nodes: sourceNetworks.map(sourceNetwork => ({
                      ...sourceNetwork,
                      selected: false
                    }))
                  };
            })
          };
        }
      );
      onChange(updatedMappings);
    } else {
      const updatedMappings = networksStepMappings.map(
        targetClusterWithNetworksMappings => {
          const {
            nodes: networksMappings,
            ...targetCluster
          } = targetClusterWithNetworksMappings;
          return {
            ...targetCluster,
            nodes: networksMappings.map(networksMapping => {
              const {
                nodes: sourceNetworks,
                ...targetNetwork
              } = networksMapping;
              return {
                ...targetNetwork,
                selected: false,
                nodes: sourceNetworks.map(sourceNetwork => {
                  if (sourceNetwork.uid_ems === selectedNode.uid_ems) {
                    return {
                      ...sourceNetwork,
                      selected: !sourceNetwork.selected
                    };
                  } else if (sourceNetwork.selected) {
                    return {
                      ...sourceNetwork,
                      selected: false
                    };
                  }
                  return sourceNetwork;
                })
              };
            })
          };
        }
      );
      onChange(updatedMappings);
    }
    this.setState(() => ({ selectedNode }));
  }

  removeNode() {
    const { value: networksStepMappings, onChange } = this.props.input;
    const { selectedNode } = this.state;
    const isTargetNetwork = selectedNode.nodes;

    if (isTargetNetwork) {
      const updatedMappings = networksStepMappings
        .map(targetClusterWithNetworksMappings => {
          const {
            nodes: networksMappings,
            ...targetCluster
          } = targetClusterWithNetworksMappings;
          const updatedNetworksMappings = networksMappings.filter(
            targetNetworkWithSourceNetworks =>
              targetNetworkWithSourceNetworks.id !== selectedNode.id
          );
          return updatedNetworksMappings.length === 0
            ? undefined
            : {
                ...targetCluster,
                nodes: updatedNetworksMappings
              };
        })
        .filter(item => item !== undefined);
      onChange(updatedMappings);
    } else {
      const updatedMappings = networksStepMappings
        .map(targetClusterWithNetworksMappings => {
          const {
            nodes: networksMappings,
            ...targetCluster
          } = targetClusterWithNetworksMappings;
          const updatedNetworksMappings = networksMappings
            .map(networksMapping => {
              const {
                nodes: sourceNetworks,
                ...targetNetwork
              } = networksMapping;
              const updatedSourceNetworks = sourceNetworks.filter(
                sourceNetwork => sourceNetwork.uid_ems !== selectedNode.uid_ems
              );
              return updatedSourceNetworks.length === 0
                ? undefined
                : {
                    ...targetNetwork,
                    nodes: updatedSourceNetworks
                  };
            })
            .filter(item => item !== undefined);
          return updatedNetworksMappings.length === 0
            ? undefined
            : {
                ...targetCluster,
                nodes: updatedNetworksMappings
              };
        })
        .filter(item => item !== undefined);
      onChange(updatedMappings);
    }
    this.setState(() => ({ selectedNode: null }));
  }

  removeAll() {
    const { input } = this.props;
    input.onChange([]);
  }

  render() {
    const {
      groupedSourceNetworks,
      targetNetworks,
      isFetchingSourceNetworks,
      isFetchingTargetNetworks,
      input,
      selectedCluster
    } = this.props;
    const {
      selectedSourceNetworks,
      selectedTargetNetwork,
      selectedNode
    } = this.state;

    const classes = cx('dual-pane-mapper-form', {
      'is-hidden': !selectedCluster
    });

    return (
      <div className={classes}>
        <DualPaneMapper
          handleButtonClick={this.addNetworkMapping}
          validMapping={
            !(
              selectedTargetNetwork &&
              (selectedSourceNetworks && selectedSourceNetworks.length > 0)
            )
          }
        >
          <DualPaneMapperList
            listTitle="Source Networks"
            loading={isFetchingSourceNetworks}
          >
            {groupedSourceNetworks &&
              sourceNetworksFilter(groupedSourceNetworks, input.value).map(
                sourceNetwork => (
                  <DualPaneMapperListItem
                    item={sourceNetwork}
                    text={sourceNetwork.name}
                    key={sourceNetwork.id}
                    selected={
                      selectedSourceNetworks &&
                      selectedSourceNetworks.some(
                        selectedSourceNetwork =>
                          selectedSourceNetwork.uid_ems ===
                          sourceNetwork.uid_ems
                      )
                    }
                    handleClick={this.selectSourceNetwork}
                    handleKeyPress={this.selectSourceNetwork}
                  />
                )
              )}
            <DualPaneMapperCount
              selectedItems={selectedSourceNetworks.length}
              totalItems={
                sourceNetworksFilter(groupedSourceNetworks, input.value).length
              }
            />
          </DualPaneMapperList>
          <DualPaneMapperList
            listTitle="Target Networks"
            loading={isFetchingTargetNetworks}
          >
            {targetNetworks &&
              targetNetworks.map(targetNetwork => (
                <DualPaneMapperListItem
                  item={targetNetwork}
                  text={targetNetwork.name}
                  key={targetNetwork.id}
                  selected={
                    selectedTargetNetwork &&
                    selectedTargetNetwork.id === targetNetwork.id
                  }
                  handleClick={this.selectTargetNetwork}
                  handleKeyPress={this.selectTargetNetwork}
                />
              ))}
          </DualPaneMapperList>
        </DualPaneMapper>
        <MappingWizardTreeView
          mappings={mappingsForTreeView(input.value)}
          selectNode={this.selectNode}
          removeNode={this.removeNode}
          removeAll={this.removeAll}
          selectedNode={selectedNode}
        />
      </div>
    );
  }
}

NetworksStepForm.propTypes = {
  input: PropTypes.object,
  groupedSourceNetworks: PropTypes.object,
  targetNetworks: PropTypes.array,
  isFetchingSourceNetworks: PropTypes.bool,
  isFetchingTargetNetworks: PropTypes.bool,
  selectedCluster: PropTypes.object,
  selectedClusterMapping: PropTypes.object
};

export default NetworksStepForm;
