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
  EuiSelect,
  EuiOverlayMask,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiInMemoryTable,
  EuiToolTip,
  EuiButtonEmpty,
  EuiContextMenu,
  EuiPopover,
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

export default function ScenarioEditor(props) {
  const loadScope = (id) => {
    axios
      .get(Config.backendUrl + '/api/scope/' + id, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        setScenScopeId(result.data.id);
        loadScopes(result.data.projectId, result.data.id);
        setState((prevState) => ({
          ...prevState,
          scope: result.data,
        }));
      })
      .catch((err) => {
        console.log(err);
        alert('Failed to load scope data.');
      });
  };
  const loadScopes = (projectId, currentId) => {
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      scopes: [],
      error: undefined,
    }));
    axios
      .get(Config.backendUrl + '/api/scopes?projectId=' + projectId, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        let scopeOptions = [];
        for (let i in result.data) {
          scopeOptions.push({
            value: result.data[i].id,
            text: result.data[i].name,
          });
        }
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          message: noItemsFoundMsg,
          error: undefined,
          scopeOptions: scopeOptions,
        }));
      })
      .catch((err) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: null,
          message: noItemsFoundMsg,
        }));
        if (
          err.message.indexOf('401') > -1 ||
          err.message.indexOf('403') > -1
        ) {
          window.location = '/projects';
          return;
        }
      });
  };
  const loadData = (id) => {
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      error: undefined,
    }));
    axios
      .get(Config.backendUrl + '/api/scenario/' + id, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          message: noItemsFoundMsg,
          error: undefined,
        }));
        setScenId(result.data.id);
        setScenName(result.data.name);
        setScenScopeId(result.data.scopeId);
        setSteps(result.data.steps);
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
      name: {
        type: 'string',
        isInvalid: false,
        errors: ['Tidak boleh kosong'],
      },
    },
  });

  const [blankState, setBlankState] = useState();
  const [scenName, setScenName] = useState('');
  const [scenId, setScenId] = useState('');
  const [scenScopeId, setScenScopeId] = useState('');
  const [steps, setSteps] = useState([{}]);
  const [isPopoverOpen, setPopover] = useState(false);

  const history = useHistory();

  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    let id = window.location.href.split('/')[
      window.location.href.split('/').length - 1
    ];
    let scopeId = window.location.href.split('/')[
      window.location.href.split('/').length - 2
    ];
    let projectId = window.location.href.split('/')[
      window.location.href.split('/').length - 3
    ];

    loadScope(scopeId);
    let copied = window.localStorage.getItem('copiedScenario');
    if (copied && copied.length > 0) {
      copied = JSON.parse(copied);
      setScenId(null);
      setScenName('');
      setScenScopeId(copied.scopeId);
      setSteps(copied.steps);

      window.localStorage.removeItem('copiedScenario');
    } else {
      loadData(id);
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

  const renderToolsRight = () => {
    return [
      <EuiButton
        key="create"
        onClick={createModal.bind(this)}
        isDisabled={state.isLoading}
      >
        + Add new scope
      </EuiButton>,
    ];
  };

  const createModal = () => {
    setState((prevState) => ({
      ...prevState,
      modal: 'create',
    }));
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

  const onCreate = () => {
    if (!scenName || scenName?.length < 1) {
      alert('Scenario title shoud not be empty');
      return;
    }
    let payload = {
      name: scenName?.trim(),
      steps: steps,
      projectId: state?.scope?.projectId,
      scopeId: scenScopeId,
    };
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .post(Config.backendUrl + '/api/scenario', payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        history.push('/project/' + payload.projectId);
      })
      .catch((err) => {
        if (err.message.indexOf('429') > -1) {
          window.alert(
            `Too many scenarios. If this project is owned by you, please upgrade your plan. Otherwise, please contact the owner of the project.

Or you can delete old/unused scenario to preserve more space.
            `
          );
          return;
        }
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

  const onUpdate = () => {
    if (!scenName || scenName?.length < 1) {
      alert('Scenario name shoud not be empty');
      return;
    }
    let payload = {
      name: scenName?.trim(),
      steps: steps,
      projectId: state?.scope?.projectId,
      scopeId: scenScopeId,
    };
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .put(Config.backendUrl + '/api/scenario/' + scenId, payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        history.push('/project/' + payload.projectId);
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

  const onDeleteScenario = () => {
    if (
      !window.confirm(
        'Deleting a project will also delete its scopes and scenarios.\nAre you sure that you want to delete this project?'
      )
    ) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/projects/' + state.project.id, {
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
        history.push('/projects');
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

  const deleteScenario = (scenId) => {
    if (
      !window.confirm('Are you sure that you want to delete this scenario?')
    ) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/scenario/' + scenId, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        history.push('/project/' + state?.scope?.projectId);
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

  const closePopover = () => {
    setPopover(!isPopoverOpen);
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem className={'content'} style={{ padding: 15 }}>
        <div style={{ marginBottom: 15 }}>
          <a
            href={'#'}
            onClick={() => {
              history.push('/project/' + state?.scope?.projectId);
            }}
          >
            <EuiIcon type="arrowLeft" /> {state?.scope?.projectName} /{' '}
            {state?.scope?.name}
          </a>
        </div>
        <div className={'page-title'}>Scenario Composer</div>
        <div>
          <EuiButton
            style={{ float: 'right' }}
            onClick={scenId && scenId.length > 0 ? onUpdate : onCreate}
            fill
          >
            {scenId && scenId.length > 0 ? 'Save' : 'Create'}
          </EuiButton>
          {scenId && scenId.length && (
            <EuiPopover
              id={'1'}
              style={{ float: 'right' }}
              isOpen={isPopoverOpen}
              closePopover={closePopover}
              button={
                <div
                  style={{
                    width: 40,
                    height: 40,
                    textAlign: 'center',
                    marginRight: 10,
                    padding: 6,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setPopover(!isPopoverOpen);
                  }}
                >
                  <EuiIcon type={'menu'} size="l" />
                </div>
              }
            >
              <EuiContextMenu
                initialPanelId={0}
                panels={[
                  {
                    id: 0,
                    items: [
                      {
                        name: 'Copy as new scenario',
                        onClick: () => {
                          window.localStorage.setItem(
                            'copiedScenario',
                            JSON.stringify({
                              steps: steps,
                              scopeId: state?.scope?.id,
                            })
                          );
                          window.location =
                            '/project/' +
                            state?.scope?.projectId +
                            '/' +
                            scenScopeId +
                            '/new';
                        },
                      },
                      {
                        name: 'Delete',
                        onClick: () => {
                          deleteScenario(scenId);
                        },
                      },
                    ],
                  },
                ]}
              />
            </EuiPopover>
          )}
          <EuiFormRow fullWidth style={{ paddingRight: 15 }}>
            <EuiFieldText
              prepend={
                <EuiButtonEmpty size="xs" style={{ textDecoration: 'none' }}>
                  Title
                </EuiButtonEmpty>
              }
              fullWidth
              className="borderless-field-text"
              autoFocus
              placeholder="Scenario title"
              value={scenName}
              onChange={(e) => {
                let value = e.target.value || '';
                setScenName(value);
              }}
            />
          </EuiFormRow>
          <EuiFormRow fullWidth style={{ marginBottom: 15 }}>
            <EuiSelect
              fullWidth
              options={state.scopeOptions}
              value={scenScopeId}
              prepend={
                <EuiButtonEmpty size="xs" style={{ textDecoration: 'none' }}>
                  Scope
                </EuiButtonEmpty>
              }
              onChange={(e) => {
                setScenScopeId(e.target.value);
              }}
            />
          </EuiFormRow>
        </div>
        <div style={{ marginTop: 15 }}>
          {steps &&
            steps.map((item, index) => {
              return (
                <div className={'step-item'}>
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        width: '50%',
                        verticalAlign: 'top',
                      }}
                    >
                      <EuiTextArea
                        className="borderless-text-area"
                        fullWidth
                        placeholder="Step"
                        compressed
                        value={steps[index].step}
                        onChange={(e) => {
                          let value = e.target.value || '';
                          steps[index].step = value;
                          setSteps([...steps]);
                        }}
                      ></EuiTextArea>
                    </div>
                    <div
                      style={{
                        display: 'inline-block',
                        width: '50%',
                        verticalAlign: 'top',
                      }}
                    >
                      <EuiTextArea
                        className="borderless-text-area"
                        style={{ borderLeft: '1px solid lightgrey' }}
                        fullWidth
                        compressed
                        placeholder="Expectation"
                        value={steps[index].expectation}
                        onChange={(e) => {
                          let value = e.target.value || '';
                          steps[index].expectation = value;
                          setSteps([...steps]);
                        }}
                      ></EuiTextArea>
                    </div>
                  </div>
                  <div
                    style={{
                      float: 'left',
                      paddingTop: 10,
                      paddingRight: 0,
                      fontSize: 20,
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    style={{ float: 'right', paddingTop: 15, paddingLeft: 10 }}
                  >
                    <EuiIcon
                      style={{ margin: 5 }}
                      type="sortUp"
                      onClick={() => {
                        if (index < 1) return;
                        if (index === steps.length - 1) {
                          let prevStep = steps[index - 1];
                          let currentStep = steps[index];
                          steps.pop();
                          steps.pop();
                          steps.push(currentStep);
                          steps.push(prevStep);
                        } else {
                          let prevStep = steps[index - 1];
                          steps[index - 1] = steps[index];
                          steps[index] = prevStep;
                        }
                        setSteps([...steps]);
                      }}
                    />
                    <EuiIcon
                      style={{ margin: 5 }}
                      type="sortDown"
                      onClick={() => {
                        if (index + 1 === steps.length) return;
                        let nextStep = steps[index + 1];
                        steps[index + 1] = steps[index];
                        steps[index] = nextStep;
                        console.log(steps[0]);
                        setSteps([...steps]);
                      }}
                    />
                    <EuiIcon
                      style={{ margin: 5 }}
                      type="trash"
                      onClick={() => {
                        if (!window.confirm('Delete this step?')) return;
                        steps.splice(index, 1);
                        setSteps([...steps]);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          <div style={{ textAlign: 'center' }}>
            <EuiButton
              fill
              size="s"
              key="addStep"
              onClick={() => {
                steps.push({ step: '', expectation: '' });
                setSteps([...steps]);
              }}
            >
              + Step
            </EuiButton>
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
