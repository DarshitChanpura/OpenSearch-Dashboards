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

import React, { FC, useRef, useLayoutEffect, useState } from 'react';
import { Observable } from 'rxjs';
import classNames from 'classnames';
import { MountPoint, UnmountCallback } from '../../../types';
import './header_controls_container.scss';

interface HeaderControlsContainerProps {
  controls$: Observable<MountPoint | undefined>;
  className?: string;
  'data-test-subj'?: string;
}

export const HeaderControlsContainer: FC<HeaderControlsContainerProps> = ({
  controls$,
  className,
  'data-test-subj': testSubject,
}) => {
  // useObservable relies on useState under the hood. The signature is type SetStateAction<S> = S | ((prevState: S) => S);
  // As we got a Observable<Function> here, React's setState setter assume he's getting a `(prevState: S) => S` signature,
  // therefore executing the mount method, causing everything to crash.
  // piping the observable before calling `useObservable` causes the effect to always having a new reference, as
  // the piped observable is a new instance on every render, causing infinite loops.
  // this is why we use `useLayoutEffect` manually here.
  const [mounter, setMounter] = useState<{ mount: MountPoint | undefined }>({ mount: undefined });
  useLayoutEffect(() => {
    const s = controls$.subscribe((value) => {
      setMounter({ mount: value });
    });
    return () => s.unsubscribe();
  }, [controls$]);

  const elementRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<UnmountCallback | null>(null);

  useLayoutEffect(() => {
    if (unmountRef.current) {
      unmountRef.current();
      unmountRef.current = null;
    }

    if (mounter.mount && elementRef.current) {
      try {
        unmountRef.current = mounter.mount(elementRef.current);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  }, [mounter]);

  const containerClassName = classNames(
    'euiHeaderSection',
    'euiHeaderSection--dontGrow',
    'headerControl',
    className
  );

  return (
    <div
      data-test-subj={testSubject || 'headerControl'}
      className={containerClassName}
      ref={elementRef}
    />
  );
};
