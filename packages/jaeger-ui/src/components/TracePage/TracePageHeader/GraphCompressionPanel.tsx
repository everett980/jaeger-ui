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
import { Button, Checkbox, Modal, Popover, Switch, Tooltip } from 'antd';
import cx from 'classnames';

import IoIosInformationCircle from 'react-icons/lib/io/informatcircled';

import ConciseDdg from '../../../img/concise-ddg.svg';
import UvdDdg from '../../../img/uvd-ddg.svg';
import PpeDdg from '../../../img/ppe-ddg.svg';
import EviDdg from '../../../img/evi-ddg.svg';

import './GraphCompressionPanel.css';

type TDetailLevel = 'off' | 'UvD' | 'PPE' | 'EvI';

const detailLevelMap: Record<TDetailLevel, { svg: string, title: string, description: React.ReactElement }> = {
  off: {
    svg: ConciseDdg,
    title: 'Most Concise',
    description: <p>Densest view of a Deep Dependency Graph, every service or service and operation will appear once.</p>,
  },
  UvD: {
    svg: UvdDdg,
    title: 'Upstream v Downstream',
    description: <p>More detailed view that distinguishes between upstream and downstream of the focal node. Previously it was ambiguous if the green node was only downstream of focal node, now it is clear.</p>
  },
  PPE: {
    svg: PpeDdg,
    title: 'Prevent Path Entanglement',
    description: <div>
      <p>By preventing the convergence of the downstream blue node into a single node, it is clear that the downstream blue node is only dependent on the yellow node when it is after the red node.</p>
      <p>Additionally, this ensures both sides of the focal nodes are trees and that there are no cycles in the Deep Dependency Graph.
    </p>
  </div>
  },
  EvI: {
    svg: EviDdg,
    title: 'External v Internal',
    description: <div>
      <p>Differentiating between External vertices (sources or leaves) and Internal vertices can help identify entry and exit points.</p>
      <p>This can be used to ensure incoming requests are conditioned by a gateway service or that all interactions with a downstream service are persisted in a database.</p>
    </div>
  },
};

const allKeys = Object.keys(detailLevelMap) as TDetailLevel[];

function getPredecessors(level: TDetailLevel): TDetailLevel[] {
  return allKeys.slice(0, allKeys.indexOf(level));
}

  /*
type TModalRowProps = { showPlus: boolea, key: TDetailLevel };

function modalRow({ showPlus, key }: TModalRowProps): React.ReactElement {
  return (
  );
}
*/

const modalRow = (key: TDetailLevel, index: number) => (
  <div key={key}>
    <h3 className="descriptor">{index ? '+' : ''}{detailLevelMap[key].title}</h3>
    <div className="img-row">
      <img className="ddg-example" src={detailLevelMap[key].svg}/>
      {detailLevelMap[key].description}
    </div>
  </div>
)


const popoverContent = (stateLevel: TDetailLevel, targetLevel: TDetailLevel) => {
  const beforePred = getPredecessors(stateLevel);
  const afterPred = getPredecessors(targetLevel);
  const addRules = afterPred.length > beforePred.length;
  const rulesDiff = allKeys.slice((addRules ? beforePred : afterPred).length + 1, (addRules ? afterPred : beforePred).length + 1);

  return (
    <div>
      <table>
        <caption>Effect of Changing</caption>
        <tbody>
          <tr>
            <th>
              Before
            </th>
            <th>
              After
            </th>
          </tr>
          <tr>
            <td>
              {detailLevelMap[stateLevel].title}
            </td>
            <td>
              {detailLevelMap[targetLevel].title}
            </td>
          </tr>
          <tr>
            <td>
              <img className="ddg-example" src={detailLevelMap[stateLevel].svg} />
            </td>
            <td>
              <img className="ddg-example top" src={detailLevelMap[targetLevel].svg} />
            </td>
          </tr>
        </tbody>
      </table>
      <h4>{addRules ? 'Enables' : 'Disables'}{rulesDiff.length === 1 ? (' ' + detailLevelMap[rulesDiff[0]].title) : ':'}</h4>
      {rulesDiff.length !== 1 && (
        <ul>
          {rulesDiff.map((key: TDetailLevel) => (<li key={key}>{detailLevelMap[key].title}</li>))}
        </ul>
      )}
    </div>
  );
}

export default class GraphCompressionPanel extends React.PureComponent<
  {},
  { detailLevel: TDetailLevel; detailModalOpen: boolean; operation: boolean; }
> {
  state = {
    detailLevel: 'UvD' as TDetailLevel,
    detailModalOpen: true, // delete and use next line
    // detailModalOpen: false,
    operation: true,
  };

  closeModal = () => {
    this.setState({ detailModalOpen: false });
  };

  getTargetLevel = (thisLevel: TDetailLevel): TDetailLevel => {
    const { detailLevel: stateLevel } = this.state;
    if (stateLevel !== thisLevel) return thisLevel;

    switch(thisLevel) {
      case('EvI'): {
        return 'PPE';
      }
      case('PPE'): {
        return 'UvD';
      }
      default: {
        return 'off';
      }
    }
  }

  toggleSvSO = () => {
    this.setState({ operation: !this.state.operation });
  };

  openModal = () => {
    this.setState({ detailModalOpen: true });
  };
        
  render() {
    const { detailLevel, operation } = this.state;
    return (
      <div className='panel-container' >
        <div>I exist solely to pad out the next div</div>
        <div>Layout</div>
        <div className={cx('expander-container', { 'can-hide': !this.state.detailModalOpen })}>
          <div className='expand-o-matic GraphDetail'>
            <div>
            <label>
              <Checkbox
                className="detail-check-bok"
                onChange={this.toggleSvSO}
                checked={operation}
              />
              Separate Operations Within a Service <Tooltip placement="right" title="If enabled, different operations for the same service will get their own nodes" ><IoIosInformationCircle /></Tooltip>
              </label>
            </div>
            <span>
              Graph Detail <Button className={"ant-btn-icon-only" /* no hacky classNames! */ } htmlType="button" onClick={this.openModal} ><IoIosInformationCircle /></Button>:
              <Modal align="center" bodyStyle={{ width: '40vw' }} closable title="Graph Detail Options" onCancel={this.closeModal} visible={this.state.detailModalOpen}>
                {(Object.keys(detailLevelMap) as TDetailLevel[]).map(modalRow)}
              </Modal>
            </span>
            {(Object.keys(detailLevelMap) as TDetailLevel[]).map((key: TDetailLevel, index) => Boolean(index) && (
            <Popover
              content={popoverContent(detailLevel, this.getTargetLevel(key))}
              mouseEnterDelay={0.5}
              key={key}
              placement={"rightBottom" /* change to "rightTop" if panel-container is at top */}
            >
            <label>
              <Checkbox
                className="detail-check-bok"
                onChange={() =>
                  this.setState({ detailLevel: this.getTargetLevel(key) })
                }
                checked={!getPredecessors(key).includes(detailLevel)}
              />
              {detailLevelMap[key].title}
            </label>
            </Popover>
            ))}
          </div>
        </div>
        <div>Hop Stuff</div>
      </div>
    );
  }
}
