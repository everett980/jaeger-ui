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

import { TEdge } from '@jaegertracing/plexus/lib/types';
import { DdgVertex } from './types';

export default class DdgEdge implements TEdge<{}> {
  from: string;
  to: string;

  constructor(arg: { from: DdgVertex; to: DdgVertex }) {
    this.from = arg.from.key;
    this.to = arg.to.key;
  }
}