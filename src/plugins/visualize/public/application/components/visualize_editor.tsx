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

import './visualize_editor.scss';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { EventEmitter } from 'events';

import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import {
  useChromeVisibility,
  useSavedVisInstance,
  useVisualizeAppState,
  useEditorUpdates,
  useLinkedSearchUpdates,
} from '../utils';
import { VisualizeServices } from '../types';
import { VisualizeEditorCommon } from './visualize_editor_common';
import { VisualizeAppProps } from '../app';
import { HeaderVariant } from '../../../../../core/public/index';

export const VisualizeEditor = ({ onAppLeave }: VisualizeAppProps) => {
  const { id: visualizationIdFromUrl } = useParams<{ id: string }>();
  const [originatingApp, setOriginatingApp] = useState<string>();
  const { services } = useOpenSearchDashboards<VisualizeServices>();
  const [eventEmitter] = useState(new EventEmitter());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(!visualizationIdFromUrl);
  const { chrome, uiSettings } = services;
  const showActionsInGroup = uiSettings.get('home:useNewHomePage');
  const { setHeaderVariant } = chrome;

  const isChromeVisible = useChromeVisibility(services.chrome);
  const { savedVisInstance, visEditorRef, visEditorController } = useSavedVisInstance(
    services,
    eventEmitter,
    isChromeVisible,
    visualizationIdFromUrl
  );
  const { appState, hasUnappliedChanges } = useVisualizeAppState(
    services,
    eventEmitter,
    savedVisInstance
  );
  const { isEmbeddableRendered, currentAppState } = useEditorUpdates(
    services,
    eventEmitter,
    setHasUnsavedChanges,
    appState,
    savedVisInstance,
    visEditorController
  );
  useLinkedSearchUpdates(services, eventEmitter, appState, savedVisInstance);

  useEffect(() => {
    if (showActionsInGroup) setHeaderVariant?.(HeaderVariant.APPLICATION);

    return () => {
      setHeaderVariant?.();
    };
  }, [setHeaderVariant, showActionsInGroup]);

  useEffect(() => {
    const { originatingApp: value } =
      services.embeddable
        .getStateTransfer(services.scopedHistory)
        .getIncomingEditorState({ keysToRemoveAfterFetch: ['id', 'input'] }) || {};
    setOriginatingApp(value);
  }, [services]);

  useEffect(() => {
    // clean up all registered listeners if any is left
    return () => {
      eventEmitter.removeAllListeners();
    };
  }, [eventEmitter]);

  return (
    <VisualizeEditorCommon
      visInstance={savedVisInstance}
      appState={appState}
      currentAppState={currentAppState}
      isChromeVisible={isChromeVisible}
      hasUnsavedChanges={hasUnsavedChanges}
      hasUnappliedChanges={hasUnappliedChanges}
      isEmbeddableRendered={isEmbeddableRendered}
      originatingApp={originatingApp}
      setOriginatingApp={setOriginatingApp}
      visualizationIdFromUrl={visualizationIdFromUrl}
      setHasUnsavedChanges={setHasUnsavedChanges}
      visEditorRef={visEditorRef}
      onAppLeave={onAppLeave}
    />
  );
};
