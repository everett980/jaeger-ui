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

import _map from 'lodash/map';
import memoizeOne from 'memoize-one';

import { compareVisibilityKeys, changeVisibility } from './visibility-key';

import { PathElem, TDdgEdge, /* TDdgVertex, */ DdgVertex, TDdgModel, TDdgPathElemsByDistance, TDdgPath, TDdgServiceMap } from './types';

// TODO rename file
export default class DdgEdgesAndVertices {
  lastVisibilityKey: string;
  pathElemsByDistance: TDdgPathElemsByDistance;
  pathElemToVertex: Map<PathElem, DdgVertex>;
  paths: TDdgPath[];
  services: TDdgServiceMap;
  // edges: TDdgEdge[];
  edges: Set<TDdgEdge>;
  vertices: Map<string, DdgVertex>;
  visibilityIdxToPathElem: Map<number, PathElem>;

  // flow all wrong
  // constructor({ ddgModel, visibilityKey }: { ddgModel: TDdgModel, visibilityKey: string }) {
  constructor({ ddgModel }: { ddgModel: TDdgModel }) {
    this.pathElemsByDistance = ddgModel.pathElemsByDistance;
    this.paths = ddgModel.paths;
    this.services = ddgModel.services;
    this.visibilityIdxToPathElem = ddgModel.visibilityIdxToPathElem;
    this.pathElemToVertex = new Map();
    this.edges = new Set();
    this.vertices = new Map();
    /*
    this.lastVisibilityKey = visibilityKey;

    const visibleIndices = compareVisibilityKeys({ oldVisibilityKey: '', newVisibilityKey: visibilityKey }).added;

    this.showPathElems(visibleIndices);
    */
    this.lastVisibilityKey = '';
  }

  private addPathElems = (newIndices: number[]) => {
    newIndices.forEach(newIdx => {
      const pathElem = this.visibilityIdxToPathElem.get(newIdx);
      if (!pathElem) {
        throw new Error(`Given visibilityIdx: "${newIdx}" that does not exist`);
      }
      const key = this.getVertexKey(pathElem);

      let vertex = this.vertices.get(key);
      if (!vertex) {
        vertex = new DdgVertex({ key });
        this.vertices.set(key, vertex);
      }

      this.pathElemToVertex.set(pathElem, vertex);
      vertex.pathElems.add(pathElem);

      const connectedPathElem = pathElem.focalSideNeighbor;
      if (connectedPathElem) {
        const connectedVertex = this.pathElemToVertex.get(connectedPathElem);
        if (!connectedVertex) {
          // TODO: Improve error message
          throw new Error(`Non-focal pathElem lacks precursorVertex. PathElem: ${JSON.stringify(pathElem, null, 2)}`);
        }

        if (!vertex[pathElem.focalSideEdgesKey].has(connectedVertex)) {
          const newEdge: TDdgEdge = pathElem.focalSideEdgesKey === 'ingressEdges'
            ? {
              from: connectedVertex,
              to: vertex,
            }
            : {
              from: vertex,
              to: connectedVertex,
            };
          vertex[pathElem.focalSideEdgesKey].set(connectedVertex, newEdge);
          connectedVertex[pathElem.farSideEdgesKey].set(vertex, newEdge);
          this.edges.add(newEdge);
        }
      }
    });
  }

  private removePathElems = (removeIndices: number[]) => {
    console.log(removeIndices);
    removeIndices.forEach(removeIdx => {
      const pathElem = this.visibilityIdxToPathElem.get(removeIdx);
      if (!pathElem) {
        throw new Error(`Given visibilityIdx: "${removeIdx}" that does not exist`);
      }
      const key = this.getVertexKey(pathElem);
      const vertex = this.vertices.get(key);
      if (!vertex) {
        throw new Error(`Attempting to remove PathElem without vertex: ${JSON.stringify(pathElem, null, 2)}`);
      }

      this.visibilityIdxToPathElem.get(removeIdx);
      vertex.pathElems.delete(pathElem);
      if (vertex.pathElems.size === 0) {
        this.vertices.delete(key);
        vertex.egressEdges.forEach((egressEdge, connectedVertex) => {
          connectedVertex.ingressEdges.delete(vertex);
          this.edges.delete(egressEdge);
        });

        vertex.ingressEdges.forEach((ingressEdge, connectedVertex) => {
          connectedVertex.egressEdges.delete(vertex);
          this.edges.delete(ingressEdge);
        });
      }
    });
  }

  // This function assumes the density is set to PPE with distinct operations
  // class property so that it can be aware of density in late-alpha
  //
  // might make sense to live on PathElem so that pathElems can be compared when checking how many
  // inbound/outbound edges are visible for a vertex
  private getVertexKey = (pathElem: PathElem): string => {
    const { distance, memberOf } = pathElem;
    const { focalIdx, members } = memberOf;
    const startIdx = Math.min(focalIdx, focalIdx + distance);

    return members.slice(startIdx, startIdx + Math.abs(distance) + 1)
      .map(({ operation }) => `${operation.service.name}::${operation.name}`).join('|');
  }

  // public getEdgesAndVertices = memoizeOne(
  // (visibilityKey: string) => {
  public getEdgesAndVertices = (visibilityKey: string) => {
      console.log(visibilityKey, this.lastVisibilityKey);
      const { added: addedIndices, removed: removedIndices } = compareVisibilityKeys({ newVisibilityKey: visibilityKey, oldVisibilityKey: this.lastVisibilityKey });
      this.lastVisibilityKey = visibilityKey;
      this.addPathElems(addedIndices);
      this.removePathElems(removedIndices);
      return {
        edges: Array.from(this.edges),
        vertices: Array.from(this.vertices.values()),
      };
  } /*,
    ([visibilityKey]: string[]) => compareVisibilityKeys({ newVisibilityKey: visibilityKey, oldVisibilityKey: this.lastVisibilityKey }).added.length === 0
  );
     */
}