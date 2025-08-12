import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiPanel,
  EuiFormRow,
  EuiTextArea,
  EuiButton,
  EuiIcon,
  EuiEmptyPrompt,
  EuiModal,
  EuiOverlayMask,
  EuiModalHeader,
  EuiModalBody,
  EuiModalFooter,
  EuiInMemoryTable,
  EuiTabs,
  EuiTab,
  EuiBasicTable,
} from '@elastic/eui';
import './App.css';
import Utils from './Utils';
import axios from 'axios';
import Config from './Config';
import Services from './Services';
import qs from 'qs';
import './TimePicker.css';
import emptyScope from './assets/new-scope.svg';
import threeDots from './assets/threedots.png';
import emptyScenario from './assets/new-scenario.svg';

const noItemsFoundMsg = 'Empty.';

export default function Scopes(props) {
  const loadData = (id) => {
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      scopes: [],
      error: undefined,
      modal: '',
    }));
    axios
      .get(Config.backendUrl + '/api/project/' + id, {
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
          project: result.data,
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

  const loadTesters = (projectId) => {
    Services.getTesters(projectId)
      .then((result) => {
        console.log(result.data.data);
        for (let i in result.data.data) {
          if (
            result.data.data[i].emailAddress === props.user.email_address &&
            result.data.data[i].access === 'OWNER'
          ) {
            setIsOwner(true);
          }
        }
        setTesters(result.data.data);
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
  const loadSessions = (projectId) => {
    Services.getSessions(projectId)
      .then((result) => {
        setSessions(result.data.reverse());
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
  const loadScopes = (projectId) => {
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
        let isEmptyScenarios = true;
        for (let i in result.data) {
          if (result.data[i].scenarios && result.data[i].scenarios.length > 0) {
            isEmptyScenarios = false;
            break;
          }
        }
        for (let i in result.data) {
          result.data[i].collapsed = true;
        }
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          message: noItemsFoundMsg,
          error: undefined,
          scopes: result.data,
          isEmptyScenarios: isEmptyScenarios,
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

  const [state, setState] = useState({
    isLoading: false,
    project: { scopes: [] },
    message: (
      <EuiEmptyPrompt
        title={<h3>No project</h3>}
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
      description: {
        type: 'string',
        isInvalid: false,
        errors: ['Tidak boleh kosong'],
        isValidFunc: () => {
          return true;
        },
      },
    },
  });

  const [blankState, setBlankState] = useState();
  const [testers, setTesters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [report, setReport] = useState('');
  const [copyInvitationText, setCopyInvitationText] = useState(
    'Copy invitation link'
  );
  const [copyReportText, setCopyReportText] = useState('Copy markdown text');
  const [isOwner, setIsOwner] = useState(false);

  const history = useHistory();

  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    let id = window.location.href
      .split('/')
      [window.location.href.split('/').length - 1].split('#')[0];
    let tab = window.location.href.split('#')[1];
    tab = tab || 'Scopes';
    setState((prevState) => ({
      ...prevState,
      tabs: ['Scopes', 'Sessions', 'Testers'],
      tab: tab,
    }));

    loadData(id);
    loadScopes(id);
    loadSessions(id);
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
    if (!state.name || (state.name && state.name.length < 1)) {
      return;
    }
    let scopes = [];
    if (state.scopes) {
      scopes = state.scopes.slice(0);
    }
    let name = state.name.trim();

    let payload = {
      name: name,
      projectId: state.project.id,
    };
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .post(Config.backendUrl + '/api/scope', payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        setState((prevState) => ({
          ...prevState,
          successMessage: '',
          name: '',
          modal: '',
        }));
        loadData(state.project.id);
        loadScopes(state.project.id);
      })
      .catch((err) => {
        if (err.message.indexOf('429') > -1) {
          window.alert(
            `Too many scopes. If this project is owned by you, please upgrade your plan. Otherwise, please contact the owner of the project.

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
            scopes: scopes,
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

  const onDeleteProject = () => {
    if (
      !window.confirm(
        'Deleting a project will also delete its scopes and scenarios.\nAre you sure that you want to delete this project?'
      )
    ) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/project/' + state.project.id, {
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

  const onDeleteScenario = (scenId) => {
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
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          project: {},
          successMessage: 'Succeed',
          name: '',
        }));
        loadData(state.project.id);
        loadScopes(state.project.id);
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

  const onDeleteScope = (scopeId) => {
    if (!window.confirm('Are you sure that you want to delete this scope?')) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/scope/' + scopeId, {
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
        loadData(state.project.id);
        loadScopes(state.project.id);
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

  const onFullNameKeyDown = (e) => {
    if (e && e.key === 'Enter') {
      onCreate();
    }
  };

  const generateReport = (id, scopes) => {
    let out = '';
    scopes = scopes || state.scopes;
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      error: undefined,
    }));
    axios
      .get(Config.backendUrl + '/api/session/' + id, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        let ontestCount = 0;
        let passedCount = 0;
        let failedCount = 0;
        let unassignedCount = 0;
        for (let i in scopes) {
          for (let j in scopes[i].scenarios) {
            for (let k in result.data.scenarios) {
              if (
                scopes[i].scenarios[j] &&
                result.data.scenarios[k].id === scopes[i].scenarios[j].id
              ) {
                scopes[i].scenarios[j].selected = true;
                scopes[i].scenarios[j].assigneeName =
                  result.data.scenarios[k].assigneeName;
                scopes[i].scenarios[j].status = result.data.scenarios[k].status;
                scopes[i].scenarios[j].notes = result.data.scenarios[k].notes;
                scopes[i].scenarios[j].assists =
                  result.data.scenarios[k].assists;
                if (result.data.scenarios[k].status === 0) {
                  unassignedCount += 1;
                }
                if (result.data.scenarios[k].status === 1) {
                  ontestCount += 1;
                }
                if (result.data.scenarios[k].status === 2) {
                  passedCount += 1;
                }
                if (result.data.scenarios[k].status === 3) {
                  failedCount += 1;
                }
              }
            }
          }
        }
        for (let i in scopes) {
          for (let j in scopes[i].scenarios) {
            for (let k in result.data.scenarios) {
              if (
                !scopes[i].scenarios[j] ||
                (scopes[i].scenarios[j] && !scopes[i].scenarios[j].selected)
              ) {
                scopes[i].scenarios.splice(j, 1);
              }
            }
          }
        }

        out += `### ${state?.project?.name} : ${result.data.version} \n\n`;
        out += `${result.data.description}\n\n`;
        out += `Report created at: ${new Date().toLocaleString()}\n\n`;
        out += `| Passed  | Failed |  On test | Unassigned |\n`;
        out += `|:-------:|:------:|:--------:|:----------:|\n`;
        out += `| ${passedCount} | ${failedCount} | ${ontestCount} |  ${unassignedCount} |\n`;

        // Generate markdown output
        for (let i in scopes) {
          out += '\n';
          out += `| ${scopes[i].name}   |    Tester     |  Result | Notes |\n`;
          out += `|----------|:-------------:|:--------:|-----------:|\n`;
          for (let j in scopes[i].scenarios) {
            let scen = scopes[i].scenarios[j];
            let status =
              scen.status < 2
                ? ''
                : scen.status === 2
                ? ':heavy_check_mark:'
                : ':x:';
            let assignees = scen.assigneeName;
            for (let i in scen.assists) {
              assignees += '<br/>' + scen.assists[i].name;
            }
            out += `| ${scen.name} | ${assignees} | ${status} | ${scen.notes} |\n`;
          }

          setState((prevState) => ({
            ...prevState,
            modal: 'report',
          }));
          setReport(out);
        }
      })
      .catch((err) => {
        console.log(err);
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

  const onEditProject = () => {
    let payload = state.project;
    payload.name = state.editProjectName;
    payload.description = state.editProjectDescription;
    Services.updateProject(payload)
      .then(() => {
        let id = state.project.id;
        loadData(id);
        loadScopes(id);
        loadSessions(id);
      })
      .catch((err) => {
        console.log(err);
        alert('An error occured');
      });
  };
  const onEditScope = () => {
    let payload = state.editScope;
    payload.name = state.editScopeName;
    Services.updateScope(payload)
      .then(() => {
        let id = state.project.id;
        loadData(id);
        loadScopes(id);
        loadSessions(id);
      })
      .catch((err) => {
        console.log(err);
        alert('An error occured');
      });
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem
        className={'content'}
        style={{ padding: 15, paddingBottom: 50 }}
      >
        <div className={'page-title'}>
          {state.project && state.project.name}
          <span
            className="icon-button"
            key="updateProject"
            isDisabled={state.isLoading}
            onClick={() => {
              setState((prevState) => ({
                ...prevState,
                editProjectName: state.project.name,
                editProjectDescription: state.project.description,
                modal: 'editProject',
              }));
            }}
          >
            <EuiIcon type={'pencil'} />
          </span>
          <span
            className="icon-button"
            key="deleteProject"
            onClick={onDeleteProject}
            isDisabled={state.isLoading}
          >
            <EuiIcon type={'trash'} />
          </span>
        </div>

        <div style={{ marginTop: 15 }}>
          <EuiTabs>
            {state.tabs &&
              state.tabs.map((tab, index) => {
                return (
                  <EuiTab
                    isSelected={tab === state.tab}
                    onClick={() => {
                      if (tab === 'Scopes') {
                        window.history.replaceState(
                          null,
                          'Testscope.io - Scopes',
                          window.location.pathname.split('#')[0] + '#Scopes'
                        );
                        loadScopes(state.project.id);
                      } else if (tab === 'Testers') {
                        window.history.replaceState(
                          null,
                          'Testscope.io - Testers',
                          window.location.pathname.split('#')[0] + '#Testers'
                        );
                        loadTesters(state.project.id);
                      } else if (tab === 'Sessions') {
                        window.history.replaceState(
                          null,
                          'Testscope.io - Sessions',
                          window.location.pathname.split('#')[0] + '#Sessions'
                        );
                        loadSessions(state.project.id);
                      }
                      setState((prevState) => ({
                        ...prevState,
                        tab: tab,
                      }));
                    }}
                  >
                    {tab}
                  </EuiTab>
                );
              })}
          </EuiTabs>
          {state.modal === 'report' && (
            <EuiOverlayMask>
              <EuiModal
                style={{ width: 500 }}
                onClose={() => {
                  setState((prevState) => ({
                    ...prevState,
                    modal: false,
                    pin: '',
                  }));
                }}
              >
                <EuiModalHeader></EuiModalHeader>
                <EuiModalHeader>
                  <b>Markdown Report</b>
                </EuiModalHeader>
                <EuiModalBody>
                  <div>
                    <EuiFormRow fullWidth>
                      <EuiTextArea
                        fullWidth
                        autofocus
                        id="report"
                        value={report}
                      />
                    </EuiFormRow>
                    <br />
                    <p style={{ marginBottom: 15 }}>
                      Please copy the markdown text then paste it somewhere.
                    </p>
                  </div>
                </EuiModalBody>
                <EuiModalFooter>
                  <div>
                    <EuiButton
                      fill
                      size="s"
                      style={{ float: 'right', marginBottom: 15 }}
                      onClick={() => {
                        navigator.clipboard.writeText(report);
                        setCopyReportText('Copied to clipboard');
                        setTimeout(() => {
                          setCopyReportText('Copy markdown text');
                        }, 1000);
                      }}
                    >
                      {copyReportText}
                    </EuiButton>
                  </div>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
          {state.modal === 'create' && (
            <EuiOverlayMask>
              <EuiModal
                style={{ height: 210, width: 500 }}
                onClose={() => {
                  setState((prevState) => ({
                    ...prevState,
                    modal: false,
                    pin: '',
                  }));
                }}
              >
                <EuiModalHeader></EuiModalHeader>
                <EuiModalBody>
                  <div>
                    <EuiFormRow
                      fullWidth
                      isInvalid={state.validationFields['name'].isInvalid}
                      error={
                        state.validationFields['name'].isInvalid &&
                        state.validationFields['name'].errors
                      }
                    >
                      <EuiFieldText
                        fullWidth
                        placeholder="Scope name, e.g. User Authentication"
                        autoComplete="off"
                        name={'name'}
                        value={state.name}
                        onChange={onChange}
                        onKeyDown={onFullNameKeyDown}
                        inputRef={(input) => {
                          input && input.focus();
                        }}
                      />
                    </EuiFormRow>
                    <br />
                    <p style={{ marginBottom: 15 }}>
                      A scope is like a feature set that you want to deliver.
                    </p>
                  </div>
                </EuiModalBody>
                <EuiModalFooter>
                  {state.errorMessage && state.errorMessage.length > 0 && (
                    <div
                      style={{
                        color: 'red',
                        position: 'absolute',
                        left: 0,
                        padding: 30,
                        marginTop: '-70px',
                      }}
                    >
                      {state.errorMessage}
                    </div>
                  )}
                  <EuiButton
                    isLoading={state.isLoading}
                    size="s"
                    fill
                    onClick={onCreate}
                  >
                    Create
                  </EuiButton>
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
          {state.modal === 'editProject' && (
            <EuiOverlayMask>
              <EuiModal
                style={{ height: 400 }}
                onClose={() => {
                  setState((prevState) => ({
                    ...prevState,
                    modal: false,
                    pin: '',
                  }));
                }}
              >
                <EuiModalHeader></EuiModalHeader>
                <EuiModalBody>
                  <p style={{ marginBottom: 15 }}>Edit project name</p>
                  {!(
                    state.successMessage && state.successMessage.length > 0
                  ) && (
                    <div>
                      <EuiFormRow
                        fullWidth
                        isInvalid={state.validationFields['name'].isInvalid}
                        error={
                          state.validationFields['name'].isInvalid &&
                          state.validationFields['name'].errors
                        }
                      >
                        <EuiFieldText
                          fullWidth
                          placeholder="Project name"
                          autoComplete="off"
                          name={'editProjectName'}
                          value={state.editProjectName}
                          onChange={onChange}
                          onKeyDown={onFullNameKeyDown}
                          autoFocus
                        />
                      </EuiFormRow>
                      <EuiFormRow
                        fullWidth
                        isInvalid={
                          state.validationFields['description'].isInvalid
                        }
                        error={
                          state.validationFields['description'].isInvalid &&
                          state.validationFields['description'].errors
                        }
                      >
                        <EuiTextArea
                          fullWidth
                          placeholder="Description (optional)"
                          autoComplete="off"
                          name={'editProjectDescription'}
                          value={state.editProjectDescription}
                          onChange={onChange}
                        />
                      </EuiFormRow>
                    </div>
                  )}
                </EuiModalBody>
                <EuiModalFooter>
                  {state.successMessage && state.successMessage.length > 0 && (
                    <div
                      style={{
                        color: 'green',
                        position: 'absolute',
                        left: 0,
                        padding: 30,
                        marginTop: '-70px',
                      }}
                    >
                      {state.successMessage}
                      <EuiIcon size={'l'} type={'check'} />
                    </div>
                  )}
                  {state.errorMessage && state.errorMessage.length > 0 && (
                    <div
                      style={{
                        color: 'red',
                        position: 'absolute',
                        left: 0,
                        padding: 30,
                        marginTop: '-70px',
                      }}
                    >
                      {state.errorMessage}
                    </div>
                  )}
                  {!(
                    (state.successMessage && state.successMessage.length > 0) ||
                    (state.errorMessage && state.errorMessage.length > 0)
                  ) && (
                    <EuiButton
                      isLoading={state.isLoading}
                      size="s"
                      fill
                      onClick={onEditProject}
                    >
                      Save
                    </EuiButton>
                  )}
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
          {state.modal === 'editScope' && (
            <EuiOverlayMask>
              <EuiModal
                style={{ height: 200 }}
                onClose={() => {
                  setState((prevState) => ({
                    ...prevState,
                    modal: false,
                    pin: '',
                  }));
                }}
              >
                <EuiModalHeader></EuiModalHeader>
                <EuiModalBody>
                  <p style={{ marginBottom: 15 }}>Edit scope name</p>
                  {!(
                    state.successMessage && state.successMessage.length > 0
                  ) && (
                    <EuiFormRow
                      fullWidth
                      isInvalid={state.validationFields['name'].isInvalid}
                      error={
                        state.validationFields['name'].isInvalid &&
                        state.validationFields['name'].errors
                      }
                    >
                      <EuiFieldText
                        fullWidth
                        placeholder="Scope name"
                        autoComplete="off"
                        name={'editScopeName'}
                        value={state.editScopeName}
                        onChange={onChange}
                        onKeyDown={onFullNameKeyDown}
                        inputRef={(input) => {
                          input && input.focus();
                        }}
                      />
                    </EuiFormRow>
                  )}
                </EuiModalBody>
                <EuiModalFooter>
                  {state.successMessage && state.successMessage.length > 0 && (
                    <div
                      style={{
                        color: 'green',
                        position: 'absolute',
                        left: 0,
                        padding: 30,
                        marginTop: '-70px',
                      }}
                    >
                      {state.successMessage}
                      <EuiIcon size={'l'} type={'check'} />
                    </div>
                  )}
                  {state.errorMessage && state.errorMessage.length > 0 && (
                    <div
                      style={{
                        color: 'red',
                        position: 'absolute',
                        left: 0,
                        padding: 30,
                        marginTop: '-70px',
                      }}
                    >
                      {state.errorMessage}
                    </div>
                  )}
                  {!(
                    (state.successMessage && state.successMessage.length > 0) ||
                    (state.errorMessage && state.errorMessage.length > 0)
                  ) && (
                    <EuiButton
                      isLoading={state.isLoading}
                      size="s"
                      fill
                      onClick={onEditScope}
                    >
                      Save
                    </EuiButton>
                  )}
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}

          {state.tab === 'Sessions' && (
            <div style={{ marginTop: 15 }}>
              <EuiButton
                fill
                small
                style={{ float: 'right', marginBottom: 15 }}
                onClick={() => {
                  if (state.isEmptyScenarios) {
                    alert(
                      'It seems that you have not create any test scenario. Please create one in Scopes tab.'
                    );
                    return;
                  }
                  history.push('/session/' + state.project.id + '/new');
                }}
              >
                + Test session
              </EuiButton>{' '}
              <div style={{ marginTop: 15 }}>
                <EuiBasicTable
                  items={sessions}
                  columns={[
                    { field: 'version', name: 'Version' },
                    {
                      field: 'id',
                      name: 'Scenarios',
                      render: (id) => {
                        let item = sessions.filter((item) => {
                          return item.id === id;
                        })[0];
                        return item.scenarios.length;
                      },
                    },
                    {
                      field: 'id',
                      name: '',
                      render: (id) => {
                        let item = sessions.filter((item) => {
                          return item.id === id;
                        })[0];
                        if (item.status === 1) {
                          return (
                            <EuiButton
                              size="s"
                              type="text"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    'Are you sure that you want to archive this testing session?'
                                  )
                                ) {
                                  return;
                                }
                                item.status = 3;
                                Services.updateSession(item)
                                  .then(() => {
                                    loadSessions(state.project.id);
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    alert('An error occured');
                                  });
                              }}
                            >
                              Archive
                            </EuiButton>
                          );
                        } else {
                          return (
                            <EuiButton
                              isDisabled={item.status === 1}
                              size="s"
                              type="text"
                              onClick={() => {
                                if (state.isEmptyScenarios) {
                                  alert(
                                    'It seems that you have not create any test scenario. Please create one in Scopes tab.'
                                  );
                                  return;
                                }
                                history.push(
                                  '/session/' + state.project.id + '/' + item.id
                                );
                              }}
                            >
                              Edit
                            </EuiButton>
                          );
                        }
                      },
                    },
                    {
                      field: 'id',
                      name: '',
                      render: (id) => {
                        let item = sessions.filter((item) => {
                          return item.id === id;
                        })[0];

                        return (
                          <EuiButton
                            fill
                            color={item.status === 0 ? 'danger' : 'warning'}
                            size="s"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  item.status === 0
                                    ? 'Are you sure you want to close this testing session?'
                                    : 'Are you sure you want to open this testing session?'
                                )
                              ) {
                                return;
                              }
                              if (item.status === 0) {
                                item.status = 1;
                              } else {
                                item.status = 0;
                              }
                              Services.updateSession(item)
                                .then(() => {
                                  loadSessions(state.project.id);
                                })
                                .catch((err) => {
                                  console.log(err);
                                  alert('An error occured');
                                });
                            }}
                          >
                            {item.status === 0 ? 'Close' : 'Open'}
                          </EuiButton>
                        );
                      },
                    },
                    {
                      field: 'id',
                      name: '',
                      render: (id) => {
                        let item = sessions.filter((item) => {
                          return item.id === id;
                        })[0];
                        return (
                          <EuiButton
                            fill={item.status < 2}
                            size="s"
                            onClick={() => {
                              history.push(
                                '/test/' + state.project.id + '/' + item.id
                              );
                            }}
                          >
                            {item.status === 0 ? 'Join' : 'View'}
                          </EuiButton>
                        );
                      },
                    },
                    {
                      field: 'id',
                      name: '',
                      render: (id) => {
                        let item = sessions.filter((item) => {
                          return item.id === id;
                        })[0];
                        return (
                          <EuiButton
                            fill
                            color="success"
                            size="s"
                            onClick={() => {
                              generateReport(item.id);
                            }}
                          >
                            Reports
                          </EuiButton>
                        );
                      },
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {state.tab === 'Testers' && (
            <div style={{ marginTop: 15 }}>
              <div>
                <EuiButton
                  fill
                  small
                  style={{ float: 'right', marginBottom: 15 }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin +
                        '/invite/' +
                        state.project.inviteCode
                    );
                    setCopyInvitationText('Copied to clipboard');
                    setTimeout(() => {
                      setCopyInvitationText('Copy invitation link');
                    }, 1000);
                  }}
                >
                  {copyInvitationText}
                </EuiButton>{' '}
              </div>
              <div style={{ marginTop: 15 }}>
                <EuiBasicTable
                  items={testers}
                  columns={[
                    { field: 'emailAddress', name: 'Email address' },
                    { field: 'access', name: 'Access level' },
                    { field: 'createdAt', name: 'Last updated' },
                    {
                      field: 'id',
                      name: '',
                      render: (id) => {
                        let item = testers.filter((item) => {
                          return item.id === id;
                        })[0];
                        if (
                          (item.emailAddress === props.user.email_address &&
                            item.access === 'MODIFY') ||
                          (item.emailAddress !== props.user.email_address &&
                            isOwner)
                        ) {
                          return (
                            <EuiButton
                              fill
                              size="s"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    'Are you sure you want to revoke this access?'
                                  )
                                ) {
                                  return;
                                }

                                Services.revokeTester(
                                  state.project.id,
                                  item.id
                                ).then(() => {
                                  if (
                                    item.emailAddress ===
                                    props.user.email_address
                                  ) {
                                    window.location = '/projects';
                                  } else {
                                    loadTesters(state.project.id);
                                  }
                                });
                              }}
                            >
                              Revoke
                            </EuiButton>
                          );
                        } else {
                          return '';
                        }
                      },
                    },
                  ]}
                />
              </div>
            </div>
          )}
          {state.tab === 'Scopes' && (
            <div style={{ marginTop: 15 }}>
              {state.scopes && state.scopes.length > 0 && (
                <EuiButton
                  key="create"
                  fill
                  style={{ float: 'right', marginBottom: 15 }}
                  onClick={createModal.bind(this)}
                  isDisabled={state.isLoading}
                >
                  + Scope
                </EuiButton>
              )}
              {state.scopes && state.scopes.length > 0 && (
              <span
                className="scope-right-button text-button-small"
                style={{
                  borderRadius: 10,
                  marginRight: 15,
                  paddingRight: 5,
                  paddingLeft: 5,
                  paddingTop: 7,
                  paddingBottom: 2,
                }}
                onClick={() => {
                  let scopes = state.scopes;
                  for (let i in scopes) {
                    scopes[i].collapsed = true;
                  }
                  setState((prevState) => ({
                    ...prevState,
                    scopes: scopes,
                  }));
                }}
              >
                Collapse all
              </span>
              )}
              {state.scopes && state.scopes.length > 0 && (
              <span
                className="scope-right-button text-button-small"
                style={{
                  borderRadius: 10,
                  marginRight: 15,
                  paddingRight: 5,
                  paddingLeft: 5,
                  paddingTop: 7,
                  paddingBottom: 2,
                }}
                onClick={() => {
                  let scopes = state.scopes;
                  for (let i in scopes) {
                    scopes[i].collapsed = false;
                  }
                  setState((prevState) => ({
                    ...prevState,
                    scopes: scopes,
                  }));
                }}
              >
                Expand all
              </span>
              )}
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
                      <b>{scope.name}</b>
                      <span
                        className="icon-button scope-right-button"
                        key="expandScope"
                        style={{
                          marginRight: 15,
                        }}
                      >
                        <EuiIcon
                          type={scope.collapsed ? 'arrowDown' : 'arrowUp'}
                        />
                      </span>
                      <span
                        className="icon-button scope-right-button"
                        key="deleteScope"
                        onClick={() => {
                          scope.childClicked = true;
                          history.push(
                            '/project/' +
                              scope.projectId +
                              '/' +
                              scope.id +
                              '/new'
                          );
                        }}
                        isDisabled={state.isLoading}
                      >
                        <EuiIcon type={'plusInCircleFilled'} />
                      </span>
                      <span
                        className="icon-button scope-right-button"
                        key="deleteScope"
                        onClick={() => {
                          scope.childClicked = true;
                          onDeleteScope(scope.id);
                        }}
                        isDisabled={state.isLoading}
                      >
                        <EuiIcon type={'trash'} />
                      </span>
                      <span
                        className="icon-button scope-right-button"
                        key="updateScope"
                        isDisabled={state.isLoading}
                        onClick={() => {
                          scope.childClicked = true;
                          setState((prevState) => ({
                            ...prevState,
                            editScopeName: scope.name,
                            editScope: scope,
                            modal: 'editScope',
                          }));
                        }}
                      >
                        <EuiIcon type={'pencil'} />
                      </span>

                      {scope.scenarios && scope.scenarios.length > 0 && (
                        <span
                          className="scope-right-button"
                          style={{
                            background: 'lightgrey',
                            borderRadius: 10,
                            marginRight: 15,
                            paddingRight: 5,
                            paddingLeft: 5,
                            paddingTop: 2,
                            paddingBottom: 2,
                          }}
                          key="scenarioCount"
                        >
                          {scope.scenarios.length}
                        </span>
                      )}
                      {!scope.collapsed && scope.scenarios && (
                        <div style={{ marginTop: 15 }}>
                          {scope.scenarios.map((scen, scenIdx) => {
                            return (
                              <div
                                className={'scen-item'}
                                onClick={() => {
                                  scope.childClicked = true;
                                  if (scen.childClicked) {
                                    scen.childClicked = false;
                                    return;
                                  }
                                  history.push(
                                    '/project/' +
                                      scope.projectId +
                                      '/' +
                                      scope.id +
                                      '/' +
                                      scen.id
                                  );
                                }}
                              >
                                {scen.name}
                                <span
                                  className="icon-button scope-right-button"
                                  key="deleteScope"
                                  onClick={() => {
                                    scope.childClicked = true;
                                    scen.childClicked = true;
                                    onDeleteScenario(scen.id);
                                  }}
                                  isDisabled={state.isLoading}
                                >
                                  <EuiIcon type={'trash'} />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              {!state.isLoading &&
                state.project &&
                state.scopes &&
                state.scopes.length < 1 && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 50,
                    }}
                  >
                    In a project, we're using <b>scope</b> to group some test
                    scenarios. Create your first scope now.
                    <br />
                    <br />
                    <br />
                    <EuiButton
                      key="create"
                      onClick={createModal.bind(this)}
                      isDisabled={state.isLoading}
                      fill
                    >
                      Create scope
                    </EuiButton>
                    <br />
                    <img
                      style={{ width: '50%', margin: 15, marginTop: 30 }}
                      src={emptyScope}
                    />
                  </div>
                )}
              {state.scopes &&
                state.scopes.length > 0 &&
                state.isEmptyScenarios && (
                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      marginTop: 50,
                    }}
                  >
                    We need test scenario(s) to ensure the project meets your
                    standards. Please create one.
                    <br />
                    <br />
                    <br />
                    <EuiButton
                      key="create"
                      onClick={() => {
                        history.push(
                          '/project/' +
                            state.project.id +
                            '/' +
                            state.scopes[0].id +
                            '/new'
                        );
                      }}
                      isDisabled={state.isLoading}
                      fill
                    >
                      Create a scenario
                    </EuiButton>
                    <br />
                    <img
                      style={{ width: '50%', margin: 15, marginTop: 30 }}
                      src={emptyScenario}
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
