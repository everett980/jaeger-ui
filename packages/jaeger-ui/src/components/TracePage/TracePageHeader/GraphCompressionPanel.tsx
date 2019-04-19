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
import { Button, Checkbox, Modal, Switch } from 'antd';
import cx from 'classnames';

import IoIosInformationCircle from 'react-icons/lib/io/informatcircled';

import ConciseDdg from '../../../img/concise-ddg.svg';
import UvdDdg from '../../../img/uvd-ddg.svg';
import PpeDdg from '../../../img/ppe-ddg.svg';
import EviDdg from '../../../img/evi-ddg.svg';

import './GraphCompressionPanel.css';

type detailLevel = 'off' | 'UvD' | 'UƒP' | 'EvI';

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
        <div style={{ justifySelf: 'center', margin: '0 20px' }}>
          <span>Hops:</span>
          <Button
            disabled={this.state.hops <= 1}
            icon="minus"
            htmlType="button"
            onClick={() => this.setState({ hops: this.state.hops - 1 })}
          />
          {this.state.hops}
          <Button
            icon="plus"
            htmlType="button"
            onClick={() => this.setState({ hops: this.state.hops + 1 })}
          />
        </div>
        <div style={{ justifySelf: 'flex-end' }}>
        </div>
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
      {/*
                <table>
                  <tbody>
                    <tr>
                      <td>
                        Make this my header Make this my header
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <img className="ddg-example" src={ConciseDdg}/>
                      </td>
                      <td>tables are lit</td>
                    </tr>
                    <tr>
                      <td>
                        <img className="ddg-example" src={UvdDdg}/>
                      </td>
                      <td>tables are lit</td>
                    </tr>
                    <tr>
                      <td>
                        <img className="ddg-example" src={PpeDdg}/>
                      </td>
                      <td>tables are life</td>
                    </tr>
                    <tr>
                      <td>
                        <img className="ddg-example" src={EviDdg}/>
                      </td>
                      <td>tables are lit</td>
                    </tr>
                  </tbody>
                </table>
        */ }
                  <div>
                    <h3 className="descriptor">
                        Most Concise
                    </h3>
                    <div className="img-row">
                      <img className="ddg-example" src={ConciseDdg}/>
                      <p>Densest view of a Deep Dependency Graph, every service or service and operation will appear once.</p>
                    </div>
                    <h3 className="descriptor">
                        +Upstream v Downstream
                    </h3>
                    <div className="img-row">
                      <img className="ddg-example" src={UvdDdg}/>
                      <p>More detailed view that distinguishes between upstream and downstream of the focal node. Previously it was ambiguous if the green node was only downstream of focal node, now it is clear.</p>
                    </div>
                    <h3 className="descriptor">
                        +Prevent Path Entanglement
                    </h3>
                    <div className="img-row">
                      <img className="ddg-example" src={PpeDdg}/>
      <div>
      <p>By preventing the convergence of the downstream blue node into a single node, it is clear that the downstream blue node is only dependent on the yellow node when it is after the red node.</p>
      <p>Additionally, this ensures both sides of the focal nodes are trees and that there are no cycles in the Deep Dependency Graph.
      </p>
      </div>
                    </div>
                    <h3 className="descriptor">
                        +External v Internal
                    </h3>
                    <div className="img-row">
                        <img className="ddg-example" src={EviDdg}/>
      <div>
      <p>Differentiating between External vertices (sources or leaves) and Internal vertices can help identify entry and exit points.</p><p>This can be used to ensure incoming requests are conditioned by a gateway service or that all interactions with a downstream service are persisted in a database.</p>
      </div>
                    </div>
                  </div>
              </Modal>
            </span>
            <label>
              <Checkbox
                className="detail-check-bok"
                onChange={({ target: { checked } }) =>
                this.setState({
                detailLevel: (checked || this.state.detailLevel !== 'UvD' ? 'UvD' : 'off') as detailLevel,
                })
                }
                checked={detailLevel === 'UvD' || detailLevel === 'UƒP' || detailLevel === 'EvI'}
              />
                  Upstream v Downstream
              </label>
              <label>
                <Checkbox
                  className="detail-check-bok"
                  onChange={({ target: { checked } }) =>
                  this.setState({
                  detailLevel: (checked || this.state.detailLevel !== 'UƒP' ? 'UƒP' : 'UvD') as detailLevel,
                  })
                  }
                  checked={detailLevel === 'UƒP' || detailLevel === 'EvI'}
                />
                    Prevent Path Entanglement
                </label>
                <label>
                  <Checkbox
                    className="detail-check-bok"
                    onChange={({ target: { checked } }) =>
                    this.setState({ detailLevel: (checked ? 'EvI' : 'UƒP') as detailLevel })
                    }
                    checked={detailLevel === 'EvI'}
                  />
                      External v Internal
                  </label>
          </div>
        </div>
        <div>Hop Stuff</div>
      </div>
    );
  }
}
