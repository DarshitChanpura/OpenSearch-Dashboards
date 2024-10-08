/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { themeTags as THEME_TAGS } from '@osd/ui-shared-deps';
import type { ThemeTag, ThemeTags } from '@osd/ui-shared-deps';
import { ascending } from './array_helpers';

const tags = (...themeTags: string[]) =>
  Object.freeze(themeTags.sort(ascending((tag) => tag)) as ThemeTag[]);

const validTag = (tag: any): tag is ThemeTag => ALL_THEMES.includes(tag);
const isArrayOfStrings = (input: unknown): input is string[] =>
  Array.isArray(input) && input.every((v) => typeof v === 'string');

export type { ThemeTag, ThemeTags };
export const DEFAULT_THEMES = tags(...THEME_TAGS);
export const ALL_THEMES = tags(...THEME_TAGS);

export function parseThemeTags(input?: any): ThemeTags {
  if (!input) {
    return DEFAULT_THEMES;
  }

  if (input === '*') {
    return ALL_THEMES;
  }

  if (typeof input === 'string') {
    input = input.split(',').map((tag) => tag.trim());
  }

  if (!isArrayOfStrings(input)) {
    throw new Error(`Invalid theme tags, must be an array of strings`);
  }

  if (!input.length) {
    throw new Error(
      `Invalid theme tags, you must specify at least one of [${ALL_THEMES.join(', ')}]`
    );
  }

  const invalidTags = input.filter((t) => !validTag(t));
  if (invalidTags.length) {
    throw new Error(
      `Invalid theme tags [${invalidTags.join(', ')}], options: [${ALL_THEMES.join(', ')}]`
    );
  }

  return tags(...input);
}
