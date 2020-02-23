// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react';
import memoizeOne from 'memoize-one';

import HtmlLayer from './HtmlLayer';
import MeasurableNode from './MeasurableNode';
import MeasurableNodes from './MeasurableNodes';
import SvgLayer from './SvgLayer';
import {
  TExposedGraphState,
  TLayerType,
  TSetOnContainer,
  TMeasurableNodeRenderer,
  ELayoutPhase,
  ELayerType,
} from './types';
import { TEdge, TSizeVertex, TVertex } from '../types';

type TProps<T = {}, U = {}> = Omit<TMeasurableNodeRenderer<T>, 'measurable'> &
  TSetOnContainer<T, U> & {
    getClassName: (name: string) => string;
    graphState: TExposedGraphState<T, U>;
    senderKey: string;
    layerType: TLayerType;
    setSizeVertices: (senderKey: string, sizeVertices: TSizeVertex<T>[]) => void;
    standalone?: boolean;
  };

type TState<T> = {
  nodeRefs: React.RefObject<MeasurableNode<T>>[];
  vertices: TVertex<T>[];
};

function createRefs<T>(length: number) {
  const rv: React.RefObject<T>[] = [];
  for (let i = 0; i < length; i++) {
    rv.push(React.createRef<T>());
  }
  return rv;
}

export default class MeasurableNodesLayer<T = {}, U = {}> extends React.PureComponent<
  TProps<T, U>,
  TState<T>
> {
  static getDerivedStateFromProps<T>(nextProps: TProps<T>, prevState: TState<T>) {
    const { vertices } = nextProps.graphState;
    const { vertices: stVertices } = prevState;
    if (vertices === stVertices) {
      return null;
    }
    return {
      vertices,
      nodeRefs: createRefs<MeasurableNode<T>>(vertices.length),
    };
  }

  private vertexToMeasured: WeakMap<TVertex<T>, TSizeVertex<T>> = new WeakMap();

  private measureNodes: (vertices: TVertex<T>[], edges: TEdge<U>[]) => void = memoizeOne((vertices: TVertex<T>[], edges: TEdge<U>[]) => {
    const { nodeRefs } = this.state;
    if (!nodeRefs) {
      return;
    }
    const { layerType, graphState: { layoutEdges, layoutVertices }, measureNode, senderKey, setSizeVertices } = this.props;
    if (layoutVertices && vertices.every(({ key }) => layoutVertices.has(key)) && layoutEdges && edges.every(edge => layoutEdges.has(edge))) return;
    let current: MeasurableNode<T> | null = null;
    const utils = measureNode && {
      layerType,
      getWrapper: () => {
        if (current) {
          return current.getRef();
        }
        throw new Error('Invalid scenario');
      },
      getWrapperSize: () => {
        if (current) {
          return current.measure();
        }
        throw new Error('Invalid scenario');
      },
    };

    const sizeVertices: TSizeVertex<T>[] = [];
    for (let i = 0; i < nodeRefs.length; i++) {
      current = nodeRefs[i].current;
      const vertex = vertices[i];
      if (current) {
        let measured = this.vertexToMeasured.get(vertex);
        if (!measured) {
          measured = {
            vertex,
            ...(measureNode && utils ? measureNode(vertex, utils) : current.measure()),
          };
          this.vertexToMeasured.set(vertex, measured);
        }
        sizeVertices.push(measured);
      }
    }
    setSizeVertices(senderKey, sizeVertices);
  });


  constructor(props: TProps<T, U>) {
    super(props);
    const { graphState } = props;
    const { vertices } = graphState;
    this.state = {
      vertices,
      nodeRefs: createRefs<MeasurableNode<T>>(vertices.length),
    };
  }

  componentDidMount() {
    this.measureNodes(this.props.graphState.vertices, this.props.graphState.edges);
  }

  componentDidUpdate() {
    this.measureNodes(this.props.graphState.vertices, this.props.graphState.edges);
  }

  render() {
    const { nodeRefs } = this.state;
    if (nodeRefs) {
      const {
        getClassName,
        graphState: { layoutVertices, renderUtils, vertices },
        layerType,
        renderNode,
        setOnNode,
      } = this.props;
      const LayerComponent = layerType === ELayerType.Html ? HtmlLayer : SvgLayer;
      return (
        <LayerComponent classNamePart="MeasurableNodesLayer" {...this.props}>
          <MeasurableNodes<T>
            nodeRefs={nodeRefs}
            getClassName={getClassName}
            layerType={layerType}
            renderNode={renderNode}
            renderUtils={renderUtils}
            vertices={vertices}
            layoutVertices={layoutVertices}
            setOnNode={setOnNode}
          />
        </LayerComponent>
      );
    }
    return null;
  }
}
