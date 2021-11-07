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
import * as React from 'react';
import PropTypes from 'prop-types';
import { Moment } from 'moment';
import { useContext } from 'react';

import DateTimeContext, { DateTimeFormats } from 'contexts/DateTimeContext';

type Props = {
  dateTime: string | number | Date | Moment,
  format?: DateTimeFormats,
};

/**
 * This component receives any date time and displays it in the browser time zone.
 */
const BrowserTime = ({ dateTime, format }: Props) => {
  const { formatAsBrowserTime } = useContext(DateTimeContext);
  const timeInBrowserTimeZone = formatAsBrowserTime(dateTime, format);

  return (
    <time dateTime={String(dateTime)} title={String(dateTime)}>
      {timeInBrowserTimeZone}
    </time>
  );
};

BrowserTime.propTypes = {
  /**
   * Date time to be displayed in the component. You can provide an ISO
   * 8601 string, a JS native `Date` object, a moment `Date` object, or
   * a number containing seconds after UNIX epoch.
   */
  dateTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.number]).isRequired,
  /**
   * Format to use to represent the date time.
   */
  format: PropTypes.string,
};

BrowserTime.defaultProps = {
  format: 'default',
};

export default BrowserTime;
