import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiTextArea,
  EuiPanel,
  EuiFormRow,
  EuiButton,
  EuiIcon,
  EuiEmptyPrompt,
  EuiModal,
  EuiOverlayMask,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiInMemoryTable,
  EuiButtonEmpty,
} from '@elastic/eui';
import './App.css';
import Utils from './Utils';
import axios from 'axios';
import Config from './Config';
import qs from 'qs';
import './TimePicker.css';
import sha256 from 'sha256';
import emptyScope from './assets/new-scope.svg';
import emptyScenario from './assets/new-scenario.svg';

const noItemsFoundMsg = 'Empty.';

export default function SessionEditor(props) {
  const loadProject = (projectId) => {
    axios
      .get(Config.backendUrl + '/api/project/' + projectId, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        setState((prevState) => ({
          ...prevState,
          project: result.data,
        }));
      })
      .catch((err) => {
        console.log(err);
        alert('Failed to load scope data.');
      });
  };
  const loadScopes = (projectId) => {
    return new Promise((resolve, reject) => {
      axios
        .get(Config.backendUrl + '/api/scopes?projectId=' + projectId, {
          headers: {
            authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          setState((prevState) => ({
            ...prevState,
            scopes: result.data,
          }));
          resolve(result.data);
        })
        .catch((err) => {
          console.log(err);
          alert('Failed to load scope data.');
          reject(err);
        });
    });
  };
  const loadData = (id, scopes) => {
    scopes = scopes || state.scopes;
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      scenario: { steps: [{}] },
      error: undefined,
    }));
    axios
      .get(Config.backendUrl + '/api/session/' + id, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        console.log(scopes);
        console.log(result.data);
        for (let i in scopes) {
          for (let j in scopes[i].scenarios) {
            for (let k in result.data.scenarios) {
              if (result.data.scenarios[k].id === scopes[i].scenarios[j].id) {
                scopes[i].scenarios[j].selected = true;
              }
            }
          }
        }
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          message: noItemsFoundMsg,
          error: undefined,
          session: result.data,
          scopes: scopes,
        }));
      })
      .catch((err) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: null,
          message: noItemsFoundMsg,
        }));
        if (err.message.indexOf('401') > -1) {
          console.log(err.message);
          return;
        }
      });
  };

  const [state, setState] = useState({
    isLoading: false,
    scenario: { scopes: [] },
    message: (
      <EuiEmptyPrompt
        title={<h3>Empty</h3>}
        titleSize="xs"
        body="Tidak ada data."
        actions={
          <EuiButton size="s" key="loadData" onClick={loadData}>
            Load Projects
          </EuiButton>
        }
      />
    ),
    selection: [],
    validationFields: {
      version: {
        type: 'string',
        isInvalid: false,
        errors: ['Tidak boleh kosong'],
      },
    },
  });

  const [blankState, setBlankState] = useState();
  const [edit, setEdit] = useState(false);

  const history = useHistory();

  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    let id = window.location.href.split('/')[
      window.location.href.split('/').length - 1
    ];
    let projectId = window.location.href.split('/')[
      window.location.href.split('/').length - 2
    ];

    loadProject(projectId);
    if (id == 'new') {
      loadScopes(projectId);
    } else {
      loadScopes(projectId).then((scopes) => {
        loadData(id, scopes);
      });
    }
  }, [props.user]);

  const loadDatasWithError = () => {
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      error: undefined,
    }));
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: 'ouch!... again... ',
        message: noItemsFoundMsg,
      }));
    }, 500);
  };

  const onChange = (e) => {
    let value = e.target.value || null;
    let validationFields = { ...state.validationFields };
    if (validationFields[e.target.name]) {
      validationFields[e.target.name].isInvalid = false;
    }
    let name = e.target.name;
    if (name && name.length > 0) {
      setState((prevState) => ({
        ...prevState,
        [name]: value,
        successMessage: '',
        errorMessage: '',
        validationFields: validationFields,
      }));
    }
  };

  const onSave = () => {
    if (!state?.session?.version || state?.session?.version?.length < 1) {
      alert('Session version shoud not be empty');
      return;
    }
    let payload = {
      version: state?.session?.version?.trim(),
      description: state?.session?.description,
      projectId: state?.project?.id,
      scenarios: [],
    };
    for (let i in state.scopes) {
      for (let j in state.scopes[i].scenarios) {
        let scen = state.scopes[i].scenarios[j];
        if (scen.selected) {
          payload.scenarios.push({ id: scen.id });
        }
      }
    }

    if (payload.scenarios.length < 1) {
      alert('You have to select at least one scenario to test');
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .post(Config.backendUrl + '/api/session', payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        history.push('/project/' + payload.projectId + '#Sessions');
      })
      .catch((err) => {
        if (err.message.indexOf('429') > -1) {
          window.alert(
            `Too many sessions. If this project is owned by you, please upgrade your plan. Otherwise, please contact the owner of the project.

Or you can delete old/unused scope to preserve more space.
            `
          );
          window.location = '/pricing';
          return;
        }
        if (err.message.indexOf('409') > -1) {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            errorMessage: 'Failed.',
            version: '',
          }));
          setTimeout(() => {
            setState((prevState) => ({ successMessage: '' }));
          }, 1000);
        }
        if (err.message.indexOf('401') > -1) {
          window.reset();
          window.location = '/';
          return;
        }
        setState((prevState) => ({ isLoading: false }));
      });
  };

  const onUpdate = () => {
    if (!state?.session?.version || state?.session?.version?.length < 1) {
      alert('Session version shoud not be empty');
      return;
    }
    let payload = {
      version: state?.session?.version?.trim(),
      description: state?.session?.description,
      projectId: state?.project?.id,
      scenarios: [],
    };
    for (let i in state.scopes) {
      for (let j in state.scopes[i].scenarios) {
        let scen = state.scopes[i].scenarios[j];
        if (scen.selected) {
          payload.scenarios.push({ id: scen.id });
        }
      }
    }

    if (payload.scenarios.length < 1) {
      alert('You have to select at least one scenario to test');
      return;
    }

    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .put(Config.backendUrl + '/api/session/' + state?.session?.id, payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        history.push('/project/' + payload.projectId + '#Sessions');
      })
      .catch((err) => {
        if (err.message.indexOf('409') > -1) {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            errorMessage: 'Failed.',
            name: '',
          }));
          setTimeout(() => {
            setState((prevState) => ({ successMessage: '' }));
          }, 1000);
        }
        if (err.message.indexOf('401') > -1) {
          window.reset();
          window.location = '/';
          return;
        }
        setState((prevState) => ({ isLoading: false }));
      });
  };

  const onDeleteSession = () => {
    if (!window.confirm('Are you sure that you want to delete this session?')) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/session/' + state.session.id, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          project: {},
          successMessage: 'Succeed',
          name: '',
        }));
        history.push('/project/' + state.project.id);
      })
      .catch((err) => {
        if (err.message.indexOf('409') > -1) {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            errorMessage: 'Failed',
          }));
          setTimeout(() => {
            setState((prevState) => ({ successMessage: '' }));
          }, 1000);
        }
        if (err.message.indexOf('401') > -1) {
          window.reset();
          window.location = '/';
          return;
        }
        setState((prevState) => ({ isLoading: false }));
      });
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem className={'content'} style={{ padding: 15 }}>
        <div style={{ marginBottom: 15, marginTop: 15 }}>
          <span
            style={{ color: '#006BB4', cursor: 'pointer' }}
            onClick={() => {
              history.push('/project/' + state?.project?.id + '#Sessions');
            }}
          >
            <EuiIcon type="arrowLeft" /> {state?.project?.name}
          </span>
        </div>
        <div className={'page-title'}>Session Composer</div>
        <div>
          <div style={{ marginBottom: 15 }}></div>
          <EuiButton
            style={{ float: 'right' }}
            onClick={state?.session?.id ? onUpdate : onSave}
            fill
          >
            {state?.session?.id ? 'Save' : 'Create'}
          </EuiButton>
          <EuiFormRow fullWidth style={{ paddingRight: 15 }}>
            <EuiFieldText
              fullWidth
              className="borderless-field-text"
              autoFocus
              placeholder="Specific version that will be tested"
              prepend={
                <EuiButtonEmpty size="xs" style={{ textDecoration: 'none' }}>
                  Version
                </EuiButtonEmpty>
              }
              value={state?.session?.version}
              onChange={(e) => {
                let session = state.session || {};
                let value = e.target.value || '';
                session.version = value || '';
                setState((prevState) => ({
                  ...prevState,
                  session: session,
                }));
              }}
            />
          </EuiFormRow>
          <EuiFormRow fullWidth style={{ paddingRight: 15 }}>
            <EuiTextArea
              fullWidth
              prepend={
                <EuiButtonEmpty size="xs" style={{ textDecoration: 'none' }}>
                  Description
                </EuiButtonEmpty>
              }
              className="borderless-field-text"
              placeholder="Description"
              value={state?.session?.description}
              onChange={(e) => {
                let session = state.session || {};
                let value = e.target.value || '';
                session.description = value || '';
                setState((prevState) => ({
                  ...prevState,
                  session: session,
                }));
              }}
            />
          </EuiFormRow>
          <div style={{ marginTop: 50, marginBottom: 15 }}>
            Please select your testing scopes.
            <span
              className="scope-right-button text-button-small"
              style={{
                borderRadius: 10,
                marginRight: 15,
                paddingRight: 5,
                paddingLeft: 5,
                paddingTop: 2,
                paddingBottom: 2,
              }}
              onClick={() => {
                let scopes = state.scopes;
                for (let i in scopes) {
                  for (let j in scopes[i].scenarios) {
                    scopes[i].scenarios[j].selected = false;
                  }
                }
                setState((prevState) => ({
                  ...prevState,
                  scopes: scopes,
                }));
              }}
            >
              Deselect all scopes
            </span>
            <span
              className="scope-right-button text-button-small"
              style={{
                borderRadius: 10,
                marginRight: 15,
                paddingRight: 5,
                paddingLeft: 5,
                paddingTop: 2,
                paddingBottom: 2,
              }}
              onClick={() => {
                let scopes = state.scopes;
                for (let i in scopes) {
                  for (let j in scopes[i].scenarios) {
                    scopes[i].scenarios[j].selected = true;
                  }
                }
                setState((prevState) => ({
                  ...prevState,
                  scopes: scopes,
                }));
              }}
            >
              Select all scopes
            </span>
          </div>

          {state.project &&
            state.scopes &&
            state.scopes.map((scope, index) => {
              return (
                <div
                  className={'scope-item'}
                  onClick={() => {
                    if (scope.childClicked) {
                      scope.childClicked = false;
                      return;
                    }
                    let scopes = state.scopes;
                    for (let i in scopes) {
                      if (scopes[i].id === scope.id) {
                        scopes[i].collapsed = !scopes[i].collapsed;
                        break;
                      }
                    }
                    setState((prevState) => ({
                      ...prevState,
                      scopes: scopes,
                    }));
                  }}
                >
                  {scope.name}
                  <span
                    className="scope-right-button"
                    key="expandScope"
                    style={{
                      marginRight: 15,
                    }}
                  >
                    <EuiIcon type={scope.collapsed ? 'arrowDown' : 'arrowUp'} />
                  </span>
                  <span
                    className="scope-right-button text-button-small"
                    style={{
                      borderRadius: 10,
                      marginRight: 15,
                      paddingRight: 5,
                      paddingLeft: 5,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                    onClick={() => {
                      scope.childClicked = true;
                      let scopes = state.scopes;
                      for (let i in scopes) {
                        for (let j in scopes[i].scenarios) {
                          if (scopes[i].id == scope.id) {
                            scopes[i].scenarios[j].selected = false;
                          }
                        }
                      }
                      setState((prevState) => ({
                        ...prevState,
                        scopes: scopes,
                      }));
                    }}
                  >
                    Deselect all
                  </span>
                  <span
                    className="scope-right-button text-button-small"
                    style={{
                      borderRadius: 10,
                      marginRight: 15,
                      paddingRight: 5,
                      paddingLeft: 5,
                      paddingTop: 2,
                      paddingBottom: 2,
                    }}
                    onClick={() => {
                      scope.childClicked = true;
                      let scopes = state.scopes;
                      for (let i in scopes) {
                        for (let j in scopes[i].scenarios) {
                          if (scopes[i].id == scope.id) {
                            scopes[i].scenarios[j].selected = true;
                          }
                        }
                      }
                      setState((prevState) => ({
                        ...prevState,
                        scopes: scopes,
                      }));
                    }}
                  >
                    Select all
                  </span>
                  {!scope.collapsed && scope.scenarios && (
                    <div style={{ marginTop: 15 }}>
                      {scope.scenarios.map((scen, scenIdx) => {
                        return (
                          <div
                            className={'scen-item'}
                            onClick={() => {
                              scope.childClicked = true;
                              scen.selected = !scen.selected;
                              let scopes = state.scopes;
                              setState((prevState) => ({
                                ...prevState,
                                scopes: scopes,
                              }));
                            }}
                          >
                            {scen.name}
                            {scen.selected && (
                              <span
                                className="scope-right-button"
                                style={{
                                  background: '#5D5FEF',
                                  color: 'white',
                                  borderRadius: 10,
                                  marginTop: -5,
                                  marginRight: 15,
                                  paddingRight: 5,
                                  paddingLeft: 5,
                                  paddingTop: 2,
                                  paddingBottom: 2,
                                }}
                              >
                                <EuiIcon type="check" />
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
