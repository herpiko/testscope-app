import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import '@elastic/eui/dist/eui_theme_light.css';
import Spinner from './Spinner';

const Footer = lazy(() => import('./Footer'));
const Landing = lazy(() => import('./Landing'));
const ContactForm = lazy(() => import('./ContactForm'));
const TermAndCondition = lazy(() => import('./TermAndCondition'));
const Thankyou = lazy(() => import('./Thankyou'));
const Header = lazy(() => import('./Header'));
const Projects = lazy(() => import('./Projects'));
const Scopes = lazy(() => import('./Scopes'));
const Invite = lazy(() => import('./Invite'));
const ScenarioEditor = lazy(() => import('./ScenarioEditor'));
const SessionEditor = lazy(() => import('./SessionEditor'));
const Test = lazy(() => import('./Test'));
const Pricing = lazy(() => import('./Pricing'));

function App() {
  const [user, setUser] = useState({});
  const reset = (window.reset = () => {
    localStorage.removeItem('authorization');
    localStorage.removeItem('Authorization');
    localStorage.removeItem('currentUser');
    setUser({});
  });
  const globalRef = useRef();
  useEffect(() => {
  }, [user]);
  return (
    <div className="App flex-wrapper">
      <div>
        <Router>
          <Suspense
            fallback={
              <div
                style={{
                  margin: '0 auto',
                  textAlign: 'center',
                  width: '100%',
                  marginTop: '50vh',
                }}
              >
                <Spinner />
              </div>
            }
          >
            <Header user={user} ref={globalRef} setUser={setUser} />
            <Switch>
              <Route
                path="/"
                exact
                render={(props) => (
                  <Landing {...props} user={user} setUser={setUser} />
                )}
              />
              <Route
                path="/projects"
                exact
                render={(props) => <Projects {...props} user={user} />}
              />
              <Route
                path="/invite/:id"
                exact
                render={(props) => <Invite {...props}/>}
              />
              <Route
                path="/project/:id"
                exact
                render={(props) => <Scopes {...props} user={user} />}
              />
              <Route
                path="/project/:projectId/:scopeId/new"
                exact
                render={(props) => <ScenarioEditor {...props} user={user} />}
              />
              <Route
                path="/project/:projectId/:scopeId/:scenId"
                exact
                render={(props) => <ScenarioEditor {...props} user={user} />}
              />
              <Route
                path="/session/:projectId/:sessionId"
                exact
                render={(props) => <SessionEditor {...props} user={user} />}
              />
              <Route
                path="/test/:projectId/:sessionId"
                exact
                render={(props) => <Test {...props} user={user} />}
              />
              <Route
                path="/pricing"
                exact
                render={(props) => <Pricing {...props} user={user} />}
              />
              <Route path="/contact" exact component={ContactForm} />
              <Route path="/tc" exact component={TermAndCondition} />
              <Route path="/thankyou" exact component={Thankyou} />
            </Switch>
          </Suspense>
        </Router>
      </div>
      {!(
        window.location.href.indexOf('wedding') > -1 ||
        window.location.href.indexOf('edit') > -1 ||
        window.location.href.indexOf('create') > -1
      ) && (
        <div className={'footer-container'}>
          <Suspense
            fallback={
              <div
                style={{
                  margin: '0 auto',
                  textAlign: 'center',
                  width: '100%',
                  marginTop: '50vh',
                }}
              >
                <Spinner />
              </div>
            }
          >
            <Footer />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default App;
