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

import { History } from 'history';
import { BehaviorSubject, Subject } from 'rxjs';

import type { MountPoint } from '../types';
import { capabilitiesServiceMock } from './capabilities/capabilities_service.mock';
import {
  ApplicationSetup,
  InternalApplicationStart,
  ApplicationStart,
  InternalApplicationSetup,
  PublicAppInfo,
} from './types';
import { ApplicationServiceContract } from './test_types';

const createSetupContractMock = (): jest.Mocked<ApplicationSetup> => ({
  register: jest.fn(),
  registerAppUpdater: jest.fn(),
  registerMountContext: jest.fn(),
});

const createInternalSetupContractMock = (): jest.Mocked<InternalApplicationSetup> => ({
  register: jest.fn(),
  registerAppUpdater: jest.fn(),
  registerMountContext: jest.fn(),
});

const createStartContractMock = (): jest.Mocked<ApplicationStart> => {
  const currentAppId$ = new Subject<string | undefined>();

  return {
    applications$: new BehaviorSubject<Map<string, PublicAppInfo>>(new Map()),
    currentAppId$: currentAppId$.asObservable(),
    capabilities: capabilitiesServiceMock.createStartContract().capabilities,
    navigateToApp: jest.fn(),
    navigateToUrl: jest.fn(),
    getUrlForApp: jest.fn(),
    registerMountContext: jest.fn(),
    setAppLeftControls: jest.fn(),
    setAppCenterControls: jest.fn(),
    setAppRightControls: jest.fn(),
    setAppBadgeControls: jest.fn(),
    setAppDescriptionControls: jest.fn(),
    setAppBottomControls: jest.fn(),
  };
};

const createHistoryMock = (): jest.Mocked<History> => {
  return {
    block: jest.fn(),
    createHref: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    listen: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
    action: 'PUSH',
    length: 1,
    location: {
      pathname: '/',
      search: '',
      hash: '',
      key: '',
      state: undefined,
    },
  };
};

const createInternalStartContractMock = (): jest.Mocked<InternalApplicationStart> => {
  const currentAppId$ = new Subject<string | undefined>();

  return {
    applications$: new BehaviorSubject<Map<string, PublicAppInfo>>(new Map()),
    capabilities: capabilitiesServiceMock.createStartContract().capabilities,
    currentAppId$: currentAppId$.asObservable(),
    currentActionMenu$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentLeftControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentCenterControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentRightControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentBadgeControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentDescriptionControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    currentBottomControls$: new BehaviorSubject<MountPoint | undefined>(undefined),
    setAppLeftControls: jest.fn(),
    setAppCenterControls: jest.fn(),
    setAppRightControls: jest.fn(),
    setAppBadgeControls: jest.fn(),
    setAppDescriptionControls: jest.fn(),
    setAppBottomControls: jest.fn(),
    getComponent: jest.fn(),
    getUrlForApp: jest.fn(),
    navigateToApp: jest.fn().mockImplementation((appId) => currentAppId$.next(appId)),
    navigateToUrl: jest.fn(),
    registerMountContext: jest.fn(),
    history: createHistoryMock(),
  };
};

const createMock = (): jest.Mocked<ApplicationServiceContract> => ({
  setup: jest.fn().mockReturnValue(createInternalSetupContractMock()),
  start: jest.fn().mockReturnValue(createInternalStartContractMock()),
  stop: jest.fn(),
});

export const applicationServiceMock = {
  create: createMock,
  createSetupContract: createSetupContractMock,
  createStartContract: createStartContractMock,
  createInternalSetupContract: createInternalSetupContractMock,
  createInternalStartContract: createInternalStartContractMock,
};
