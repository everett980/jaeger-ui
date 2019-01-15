// @flow

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

import queryString from 'query-string';

import type { Location, RouterHistory } from 'react-router-dom';

import prefixUrl from './prefix-url';
import { trackFilter } from '../components/TracePage/index.track';

export default function updateUIFind({
  history,
  location,
  uiFind,
}: {
  history: RouterHistory,
  location: Location,
  uiFind?: ?string,
}) {
  const { uiFind: omittedOldValue, ...queryParams } = queryString.parse(location.search);
  trackFilter(uiFind);
  if (uiFind) {
    queryParams.uiFind = uiFind;
  }
  history.replace(prefixUrl(`?${queryString.stringify(queryParams)}`));
}
