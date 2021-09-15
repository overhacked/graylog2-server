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
// import PropTypes from 'prop-types';
import styled, { css, DefaultTheme } from 'styled-components';
// eslint-disable-next-line no-restricted-imports
import { Alert as BootstrapAlert } from 'react-bootstrap';
import { TColorVariantKeys } from '@graylog/sawmill/types';

interface AlertProps {
  $bsStyle: TColorVariantKeys,
  theme: DefaultTheme
}

const StyledAlert = styled(BootstrapAlert).attrs(({ bsStyle }: { bsStyle: TColorVariantKeys }) => ({
  bsStyle: null,
  $bsStyle: bsStyle || 'default',
}))(({ $bsStyle, theme }: AlertProps) => {
  const borderColor = theme.colors.variant.lighter[$bsStyle];
  const backgroundColor = theme.colors.variant.lightest[$bsStyle];

  return css`
    background-color: ${backgroundColor};
    border-color: ${borderColor};
    color: ${theme.utils.contrastingColor(backgroundColor)};

    a:not(.btn) {
      color: ${theme.utils.contrastingColor(backgroundColor, 'AA')};
      font-weight: bold;
      text-decoration: underline;

      &:hover,
      &:focus,
      &:active {
        color: ${theme.utils.contrastingColor(backgroundColor)};
      }

      &:hover,
      &:focus {
        text-decoration: none;
      }
    }

    &.alert-dismissible {
      .close {
        top: -9px;
      }
    }
  `;
});

const Alert = ({ bsStyle, ...rest }: {bsStyle: TColorVariantKeys}) => {
  return <StyledAlert bsStyle={bsStyle} {...rest} />;
};

export default Alert;