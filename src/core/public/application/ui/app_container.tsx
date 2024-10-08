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

import React, {
  Fragment,
  FunctionComponent,
  useLayoutEffect,
  useRef,
  useState,
  MutableRefObject,
} from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';

import type { MountPoint } from '../../types';
import { AppLeaveHandler, AppStatus, AppUnmount, Mounter } from '../types';
import { AppNotFound } from './app_not_found_screen';
import { ScopedHistory } from '../scoped_history';
import './app_container.scss';

interface Props {
  /** Path application is mounted on without the global basePath */
  appPath: string;
  appId: string;
  mounter?: Mounter;
  appStatus: AppStatus;
  setAppLeaveHandler: (appId: string, handler: AppLeaveHandler) => void;
  setAppActionMenu: (appId: string, mount: MountPoint | undefined) => void;
  setAppLeftControls: (appId: string, mount: MountPoint | undefined) => void;
  setAppCenterControls: (appId: string, mount: MountPoint | undefined) => void;
  setAppRightControls: (appId: string, mount: MountPoint | undefined) => void;
  setAppBadgeControls: (appId: string, mount: MountPoint | undefined) => void;
  setAppDescriptionControls: (appId: string, mount: MountPoint | undefined) => void;
  setAppBottomControls: (appId: string, mount: MountPoint | undefined) => void;
  createScopedHistory: (appUrl: string) => ScopedHistory;
  setIsMounting: (isMounting: boolean) => void;
}

export const AppContainer: FunctionComponent<Props> = ({
  mounter,
  appId,
  appPath,
  setAppLeaveHandler,
  setAppActionMenu,
  setAppLeftControls,
  setAppCenterControls,
  setAppRightControls,
  setAppBadgeControls,
  setAppDescriptionControls,
  setAppBottomControls,
  createScopedHistory,
  appStatus,
  setIsMounting,
}: Props) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [appNotFound, setAppNotFound] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const unmountRef: MutableRefObject<AppUnmount | null> = useRef<AppUnmount>(null);

  useLayoutEffect(() => {
    const unmount = () => {
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = null;
      }
    };

    if (!mounter || appStatus !== AppStatus.accessible) {
      return setAppNotFound(true);
    }
    setAppNotFound(false);

    setIsMounting(true);
    if (mounter.unmountBeforeMounting) {
      unmount();
    }

    const mount = async () => {
      setShowSpinner(true);
      try {
        unmountRef.current =
          (await mounter.mount({
            appBasePath: mounter.appBasePath,
            history: createScopedHistory(appPath),
            element: elementRef.current!,
            onAppLeave: (handler) => setAppLeaveHandler(appId, handler),
            setHeaderActionMenu: (menuMount) => setAppActionMenu(appId, menuMount),
            setHeaderLeftControls: (menuMount) => setAppLeftControls(appId, menuMount),
            setHeaderCenterControls: (menuMount) => setAppCenterControls(appId, menuMount),
            setHeaderRightControls: (menuMount) => setAppRightControls(appId, menuMount),
            setHeaderBadgeControls: (menuMount) => setAppBadgeControls(appId, menuMount),
            setHeaderDescriptionControls: (menuMount) =>
              setAppDescriptionControls(appId, menuMount),
            setHeaderBottomControls: (menuMount) => setAppBottomControls(appId, menuMount),
          })) || null;
      } catch (e) {
        // TODO: add error UI
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        if (elementRef.current) {
          setShowSpinner(false);
          setIsMounting(false);
        }
      }
    };

    mount();

    return unmount;
  }, [
    appId,
    appStatus,
    mounter,
    createScopedHistory,
    setAppLeaveHandler,
    setAppActionMenu,
    setAppLeftControls,
    setAppRightControls,
    setAppCenterControls,
    setAppBadgeControls,
    setAppDescriptionControls,
    setAppBottomControls,
    appPath,
    setIsMounting,
  ]);

  return (
    <Fragment>
      {appNotFound && <AppNotFound />}
      {showSpinner && (
        <div className="appContainer__loading">
          <EuiLoadingSpinner aria-label="Loading application" size="xl" />
        </div>
      )}
      <div key={appId} ref={elementRef} />
    </Fragment>
  );
};
