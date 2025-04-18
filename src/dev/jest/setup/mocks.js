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

/* eslint-env jest */

/**
 * READ THIS BEFORE ADDING NEW MOCKS TO THIS FILE!
 *
 * This file should be loaded via `setupFilesAfterEnv` in all jest configs of the project.
 * It instantiates some of the very basic mocks that should be available in all jest tests.
 * Most of the mocks should just be instantiated in the test suites that require them.
 * We only activate a very rare amount of mocks here, that are used somewhere down the dependency
 * tree in nearly every test and their implementation is never working without mocking in any tests.
 * Before adding a mock here it should be considered, whether it's not better to instantiate that mock
 * in the test suites that needs them individually and if it's really needed to have that mock enabled
 * for all jest tests by default.
 *
 * The mocks that are enabled that way live inside the `__mocks__` folders beside their implementation files.
 */

jest.mock('moment-timezone', () => {
  // We always want to mock the timezone moment-timezone guesses, since otherwise
  // test results might be depending on which time zone you are running them.
  // Using that mock we always make sure moment.tz.guess is always returning the same
  // timezone in all tests.
  const moment = jest.requireActual('moment-timezone');
  moment.tz.guess = () => 'America/New_York';
  moment.tz.setDefault('America/New_York');
  return moment;
});

jest.mock('@elastic/eui/lib/services/react', () => {
  // `enqueueStateChange` is an EUI method to batch queued functions that trigger React `setState` calls.
  // This is for performance, but when used in certain Jest scernarios it can be nondeterministic.
  // Jest tests are never concerned about the state prior to batch completion, so we bypass batching entirely.
  return {
    enqueueStateChange: (fn) => fn(),
  };
});

// Mock window.matchMedia for Monaco editor
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
