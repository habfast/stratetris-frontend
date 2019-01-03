import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Switch, Route } from 'react-router-dom';
import Helmet from 'react-helmet';
import styled, { css, ThemeProvider } from 'styled-components';
import treeChanges from 'tree-changes';

import history from 'modules/history';
import theme, { headerHeight } from 'modules/theme';
import { utils } from 'styled-minimal';

import config from 'config';
import { showAlert } from 'actions/index';

import Home from 'routes/Home';
import NotFound from 'routes/NotFound';

import GlobalStyles from 'components/GlobalStyles';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  opacity: 1 !important;
  position: relative;
  transition: opacity 0.5s;
`;

const Main = styled.main`
  min-height: 100vh;
`;

export class App extends React.Component {
  render() {
    return (
      <Router history={history}>
        <ThemeProvider theme={theme}>
          <AppWrapper>
            <Helmet
              defer={false}
              htmlAttributes={{ lang: 'pt-br' }}
              encodeSpecialCharacters={true}
              defaultTitle={config.title}
              titleTemplate={`%s | ${config.name}`}
              titleAttributes={{ itemprop: 'name', lang: 'pt-br' }}
            />
            <Main>
              <Switch>
              
                <Route
                  path="/"
                  exact
                  component={Home}
                />
                <Route component={NotFound} />
              </Switch>
            </Main>
            <GlobalStyles />
          </AppWrapper>
        </ThemeProvider>
      </Router>
    );
  }
}

export default App;
