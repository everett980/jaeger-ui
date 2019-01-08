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

import type { KeyValuePair, Span } from '../types/trace';

export default function filterSpans(textFilter: string, spans: ?(Span[])) {
  if (!spans) return null;

  // if a span field includes at least one filter in includeFilters, the span is a match
  const includeFilters = [];

  // values with keys that include text in any one of the excludeKeys will be ignored
  const excludeKeys = [];

  // split textFilter by whitespace, remove empty strings, and extract includeFilters and excludeKeys
  textFilter
    .split(' ')
    .map(s => s.trim())
    .filter(s => s)
    .forEach(w => {
      if (w[0] === '-') {
        excludeKeys.push(w.substr(1).toLowerCase());
      } else {
        includeFilters.push(w.toLowerCase());
      }
    });

  const isTextInFilters = (filters: Array<string>, text: string) =>
    filters.some(filter => text.toLowerCase().includes(filter));

  const isTextInKeyValues = (kvs: Array<KeyValuePair>) =>
    kvs
      ? kvs.some(kv => {
          // ignore checking key and value for a match if key is in excludeKeys
          if (isTextInFilters(excludeKeys, kv.key)) return false;
          // match if key or value matches an item in includeFilters
          return (
            isTextInFilters(includeFilters, kv.key) || isTextInFilters(includeFilters, kv.value.toString())
          );
        })
      : false;

  const isSpanAMatch = (span: Span) =>
    isTextInFilters(includeFilters, span.operationName) ||
    isTextInFilters(includeFilters, span.process.serviceName) ||
    isTextInKeyValues(span.tags) ||
    span.logs.some(log => isTextInKeyValues(log.fields)) ||
    isTextInKeyValues(span.process.tags);

  // declare as const because need to disambiguate the type
  const rv: Set<string> = new Set(spans.filter(isSpanAMatch).map((span: Span) => span.spanID));
  return rv;
}
