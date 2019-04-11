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
import { Button, Checkbox, Switch } from 'antd';

import IoIosInformationCircle from 'react-icons/lib/io/informatcircled';

type detailLevel = 'off' | 'UvD' | 'UƒP' | 'EvI';

export default class GraphCompressionPanel extends React.PureComponent<
  {},
  { detailLevel: detailLevel; operation: boolean; hops: number }
> {
  state = {
    detailLevel: 'UvD' as detailLevel,
    operation: true,
    hops: 1,
  };

  toggleSvSO = () => {
    this.setState({ operation: !this.state.operation });
  };

  render() {
    const { detailLevel, operation } = this.state;
    return (
      <div
        style={{ display: 'flex', padding: '0 2em', alignItems: 'center', justifyContent: 'space-between' }}
      >
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
          <span>
            Graph Detail <IoIosInformationCircle />:
          </span>
          <label>
            <Checkbox
              onChange={({ target: { checked } }) =>
                this.setState({
                  detailLevel: (checked || this.state.detailLevel !== 'UvD' ? 'UvD' : 'off') as detailLevel,
                })
              }
              checked={detailLevel === 'UvD' || detailLevel === 'UƒP' || detailLevel === 'EvI'}
            />{' '}
            Upstream v Downstream
          </label>
          <label>
            <Checkbox
              onChange={({ target: { checked } }) =>
                this.setState({
                  detailLevel: (checked || this.state.detailLevel !== 'UƒP' ? 'UƒP' : 'UvD') as detailLevel,
                })
              }
              checked={detailLevel === 'UƒP' || detailLevel === 'EvI'}
            />{' '}
            Prevent Path Entanglement
          </label>
          <label>
            <Checkbox
              onChange={({ target: { checked } }) =>
                this.setState({ detailLevel: (checked ? 'EvI' : 'UƒP') as detailLevel })
              }
              checked={detailLevel === 'EvI'}
            />{' '}
            External v Internal
          </label>
        </div>
      </div>
    );
  }
}
