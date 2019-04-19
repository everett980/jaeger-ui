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
import { Button, Checkbox, Modal, Popover, Switch } from 'antd';
import cx from 'classnames';

import IoIosInformationCircle from 'react-icons/lib/io/informatcircled';

import ConciseDdg from '../../../img/concise-ddg.svg';
import UvdDdg from '../../../img/uvd-ddg.svg';
import PpeDdg from '../../../img/ppe-ddg.svg';
import EviDdg from '../../../img/evi-ddg.svg';

import './GraphCompressionPanel.css';

type detailLevel = 'off' | 'UvD' | 'PPE' | 'EvI';

const detailLevelSvgMap: Record<detailLevel, string> = {
  off: ConciseDdg,
  UvD: UvdDdg,
  PPE: PpeDdg,
  EvI: EviDdg,
};

export default class GraphCompressionPanel extends React.PureComponent<
  {},
  { detailLevel: detailLevel; detailModalOpen: boolean; operation: boolean; hops: number }
> {
  state = {
    detailLevel: 'UvD' as detailLevel,
    detailModalOpen: true, // delete and use next line
    // detailModalOpen: false,
    operation: true,
    hops: 1,
  };

  closeModal = () => {
    this.setState({ detailModalOpen: false });
  };

  getTargetLevel = (thisLevel: detailLevel): detailLevel => {
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
  /*
        <Button
          htmlType="button"
          onClick={this.toggleSvSO}
          style={{
            justifySelf: 'flex-start',
            border: 'solid black 1px',
            borderRadius: '3px',
            padding: '5px',
          }}
        >
          <span>Service</span>
          <Switch checked={operation} onChange={this.toggleSvSO} size="small" />
          <span>Service and Operation</span>
        </Button>
           */
        
  render() {
    const { detailLevel, operation } = this.state;
    return (
      <div className='panel-container' >
        <div>I exist solely to pad out the next div</div>
        <div>Layout</div>
        <div className={cx('expander-container', { 'can-hide': !this.state.detailModalOpen })}>
          Density
          <div className='expand-o-matic GraphDetail'>
            <span>
              Graph Detail <Button className="ant-btn-icon-only" htmlType="button" onClick={this.openModal} ><IoIosInformationCircle /></Button>:
                <Modal align="center" closable title="Graph Detail Options" onCancel={this.closeModal} visible={this.state.detailModalOpen}>
                  <div>
                    <h3 className="descriptor">Most Concise</h3>
                    <div className="img-row">
                      <img className="ddg-example" src={detailLevelSvgMap['off']}/>
                      <p>Densest view of a Deep Dependency Graph, every service or service and operation will appear once.</p>
                    </div>
                    <h3 className="descriptor">+Upstream v Downstream</h3>
                    <div className="img-row">
                      <img className="ddg-example" src={detailLevelSvgMap['UvD']}/>
                      <p>More detailed view that distinguishes between upstream and downstream of the focal node. Previously it was ambiguous if the green node was only downstream of focal node, now it is clear.</p>
                    </div>
                    <h3 className="descriptor">+Prevent Path Entanglement</h3>
                    <div className="img-row">
                      <img className="ddg-example" src={detailLevelSvgMap['PPE']}/>
                        <div>
                          <p>By preventing the convergence of the downstream blue node into a single node, it is clear that the downstream blue node is only dependent on the yellow node when it is after the red node.</p>
                          <p>Additionally, this ensures both sides of the focal nodes are trees and that there are no cycles in the Deep Dependency Graph.
                          </p>
                        </div>
                    </div>
                    <h3 className="descriptor">+External v Internal</h3>
                    <div className="img-row">
                      <img className="ddg-example" src={detailLevelSvgMap['EvI']}/>
                      <div>
                        <p>Differentiating between External vertices (sources or leaves) and Internal vertices can help identify entry and exit points.</p>
                        <p>This can be used to ensure incoming requests are conditioned by a gateway service or that all interactions with a downstream service are persisted in a database.</p>
                      </div>
                    </div>
                  </div>
              </Modal>
            </span>
            <label>
              <Checkbox
                className="detail-check-bok"
                onChange={() =>
                  this.setState({ detailLevel: this.getTargetLevel('UvD') })
                }
                checked={detailLevel === 'UvD' || detailLevel === 'PPE' || detailLevel === 'EvI'}
              />
              Upstream v Downstream
            </label>
            <label>
              <Checkbox
                className="detail-check-bok"
                onChange={() =>
                  this.setState({ detailLevel: this.getTargetLevel('PPE') })
                }
                checked={detailLevel === 'PPE' || detailLevel === 'EvI'}
              />
              Prevent Path Entanglement
            </label>
            <Popover
              content={(
                <div><img className="ddg-example" src={detailLevelSvgMap[this.state.detailLevel]} /><img className="ddg-example top" src={detailLevelSvgMap[this.getTargetLevel('EvI')]} /></div>
                )}
            >
              <label>
                <Checkbox
                  className="detail-check-bok"
                  onChange={() =>
                    this.setState({ detailLevel: this.getTargetLevel('EvI') })
                  }
                  checked={detailLevel === 'EvI'}
                />
                External v Internal
              </label>
            </Popover>
          </div>
        </div>
        <div>Hop Stuff</div>
      </div>
    );
  }
}
