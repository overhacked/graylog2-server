/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import * as Immutable from 'immutable';
import { waitFor } from 'wrappedTestingLibrary';

import fetch from 'logic/rest/FetchProvider';
import { StoreMock as MockStore } from 'helpers/mocking';

import validateQuery, { ValidationQuery } from './validateQuery';

jest.mock('logic/rest/FetchProvider', () => jest.fn(() => Promise.resolve()));
jest.mock('stores/users/CurrentUserStore', () => ({ CurrentUserStore: MockStore('get') }));

describe('validateQuery', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validationInput: ValidationQuery = {
    queryString: 'source:',
    timeRange: { type: 'relative', from: 300 } as const,
    streams: ['stream-id'],
    parameters: Immutable.Set(),
    parameterBindings: Immutable.Map(),
  };

  const requestPayload = {
    query: 'source:',
    filter: undefined,
    timerange: { type: 'relative', from: 300 },
    streams: ['stream-id'],
    parameters: Immutable.Set(),
    parameter_bindings: Immutable.Map(),
  };

  it('calls validate API', async () => {
    await validateQuery(validationInput);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    expect(fetch).toHaveBeenCalledWith('POST', expect.any(String), requestPayload);
  });

  it('normalizes absolute time ranges', async () => {
    await validateQuery({
      ...validationInput,
      timeRange: { type: 'absolute', from: '2021-01-01 16:00:00.000', to: '2021-01-01 17:00:00.000' },
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    const expectedPayload = {
      ...requestPayload,
      timerange: { type: 'absolute', from: '2021-01-01T22:00:00.000Z', to: '2021-01-01T23:00:00.000Z' },
    };

    expect(fetch).toHaveBeenCalledWith('POST', expect.any(String), expectedPayload);
  });
});
