/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { chromeServiceMock } from '../../../../core/public/mocks';
import {
  ALL_USE_CASE_ID,
  DEFAULT_NAV_GROUPS,
  NavGroupItemInMap,
  NavGroupType,
} from '../../../../core/public';
import { UseCaseService } from './use_case_service';

const mockNavGroupsMap = {
  system: {
    id: 'system',
    title: 'System',
    description: 'System use case',
    navLinks: [],
    type: NavGroupType.SYSTEM,
  },
  search: {
    id: 'search',
    title: 'Search',
    description: 'Search use case',
    navLinks: [{ id: 'searchRelevance', title: 'Search Relevance' }],
    order: 2000,
  },
  observability: {
    id: 'observability',
    title: 'Observability',
    description: 'Observability description',
    navLinks: [{ id: 'dashboards', title: 'Dashboards' }],
    order: 1000,
  },
};
const setupUseCaseStart = (options?: { navGroupEnabled?: boolean }) => {
  const chrome = chromeServiceMock.createStartContract();
  const workspaceConfigurableApps$ = new BehaviorSubject([
    { id: 'searchRelevance', title: 'Search Relevance' },
  ]);
  const navGroupsMap$ = new BehaviorSubject<Record<string, NavGroupItemInMap>>(mockNavGroupsMap);
  const useCase = new UseCaseService();

  chrome.navGroup.getNavGroupEnabled.mockImplementation(() => options?.navGroupEnabled ?? true);
  chrome.navGroup.getNavGroupsMap$.mockImplementation(() => navGroupsMap$);

  return {
    chrome,
    navGroupsMap$,
    workspaceConfigurableApps$,
    useCaseStart: useCase.start({
      chrome,
      workspaceConfigurableApps$,
      ...options,
    }),
  };
};

describe('UseCaseService', () => {
  describe('#start', () => {
    it('should return built in use cases when nav group disabled', async () => {
      const { useCaseStart } = setupUseCaseStart({
        navGroupEnabled: false,
      });
      const useCases = await useCaseStart.getRegisteredUseCases$().pipe(first()).toPromise();

      expect(useCases).toHaveLength(2);
      expect(useCases).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'search',
            title: 'Search',
            features: expect.arrayContaining([
              { id: 'searchRelevance', title: 'Search Relevance' },
            ]),
          }),
          expect.objectContaining({
            ...DEFAULT_NAV_GROUPS.all,
          }),
        ])
      );
    });

    it('should return registered use cases when nav group enabled', async () => {
      const { useCaseStart } = setupUseCaseStart();
      const useCases = await useCaseStart.getRegisteredUseCases$().pipe(first()).toPromise();

      expect(useCases).toEqual([
        expect.objectContaining({
          id: 'observability',
          title: 'Observability',
          features: expect.arrayContaining([{ id: 'dashboards', title: 'Dashboards' }]),
        }),
        expect.objectContaining({
          id: 'search',
          title: 'Search',
          features: expect.arrayContaining([{ id: 'searchRelevance', title: 'Search Relevance' }]),
        }),
        expect.objectContaining({
          id: 'system',
          title: 'System',
          features: [],
          systematic: true,
        }),
      ]);
    });

    it('should not emit after navGroupsMap$ emit same value', async () => {
      const { useCaseStart, navGroupsMap$ } = setupUseCaseStart();
      const registeredUseCases$ = useCaseStart.getRegisteredUseCases$();
      const fn = jest.fn();

      registeredUseCases$.subscribe(fn);

      expect(fn).toHaveBeenCalledTimes(1);

      navGroupsMap$.next({ ...mockNavGroupsMap });
      expect(fn).toHaveBeenCalledTimes(1);

      navGroupsMap$.next({
        ...mockNavGroupsMap,
        observability: {
          ...mockNavGroupsMap.observability,
          navLinks: [{ id: 'bar' }],
        },
      });
      expect(fn).toHaveBeenCalledTimes(2);
    });
    it('should move all use case to the last one', async () => {
      const { useCaseStart, navGroupsMap$ } = setupUseCaseStart();

      navGroupsMap$.next({
        ...mockNavGroupsMap,
        [ALL_USE_CASE_ID]: { ...DEFAULT_NAV_GROUPS.all, navLinks: [], order: -1 },
      });
      let useCases = await useCaseStart.getRegisteredUseCases$().pipe(first()).toPromise();

      expect(useCases[useCases.length - 1]).toEqual(
        expect.objectContaining({
          id: ALL_USE_CASE_ID,
          systematic: true,
        })
      );

      navGroupsMap$.next({
        [ALL_USE_CASE_ID]: { ...DEFAULT_NAV_GROUPS.all, navLinks: [], order: 1500 },
        ...mockNavGroupsMap,
      });
      useCases = await useCaseStart.getRegisteredUseCases$().pipe(first()).toPromise();

      expect(useCases[useCases.length - 1]).toEqual(
        expect.objectContaining({
          id: ALL_USE_CASE_ID,
          systematic: true,
        })
      );
    });
  });
});
