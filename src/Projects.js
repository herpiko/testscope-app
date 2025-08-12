import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
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
  EuiFormControlLayout,
  EuiContextMenu,
  EuiPopover,
  EuiTextArea,
} from '@elastic/eui';
import qs from 'qs';
import sha256 from 'sha256';
import './App.css';
import Utils from './Utils';
import axios from 'axios';
import Config from './Config';
import { isMobile } from 'react-device-detect';
import './TimePicker.css';
import emptyProject from './assets/new-project.svg';
import threeDots from './assets/threedots.png';

const noItemsFoundMsg = 'Tidak ada data.';

export default function Projects(props) {
  const loadProjects = () => {
    setState((prevState) => ({
      ...prevState,
      message: 'Loading...',
      isLoading: true,
      projects: [],
      error: undefined,
    }));
    axios
      .get(Config.backendUrl + '/api/projects', {
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
          projects: result.data,
          projectsAll: result.data,
        }));
      })
      .catch((err) => {
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          error: null,
          projects: undefined,
          message: noItemsFoundMsg,
        }));
        if (err.message.indexOf('401') > -1) {
          console.log(err.message);
          window.reset();
          history.push('/');
          return;
        }
      });
  };

  const [state, setState] = useState({
    isLoading: false,
    projects: [],
    message: (
      <EuiEmptyPrompt
        title={<h3>No projects</h3>}
        titleSize="xs"
        body="Tidak ada data."
        actions={
          <EuiButton fill size="s" key="loadProjects" onClick={loadProjects}>
            Load Projects
          </EuiButton>
        }
      />
    ),
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
  const [isPopoverOpen, setPopover] = useState(false);

  const history = useHistory();

  useEffect(() => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    let query = qs.parse(window.location.search.replace('?', ''));
    loadProjects();
    if (props.user && props.user.paidPackage) {
      setTimeout(() => {
        if (
          document.getElementByClassName('euiTableHeaderCellCheckbox').length >
          0
        ) {
          document.getElementsByClassName(
            'euiTableHeaderCellCheckbox'
          )[0].innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" class="euiIcon euiIcon--medium euiIcon-isLoaded" focusable="false" style="color:red;"><path d="M11 3h5v1H0V3h5V1a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2zm-7.056 8H7v1H4.1l.392 2.519c.042.269.254.458.493.458h6.03c.239 0 .451-.189.493-.458l1.498-9.576H14l-1.504 9.73c-.116.747-.74 1.304-1.481 1.304h-6.03c-.741 0-1.365-.557-1.481-1.304l-1.511-9.73H9V5.95H3.157L3.476 8H8v1H3.632l.312 2zM6 3h4V1H6v2z"></path></svg>`;
        }
      }, 500);
    }
  }, [props.user]);

  const loadProjectsWithError = () => {
    setState((prevState) => ({
      ...prevState,
      message: 'Memuat daftar penerima...',
      isLoading: true,
      projects: undefined,
      error: undefined,
    }));
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        isLoading: false,
        error: 'ouch!... again... ',
        projects: undefined,
        message: noItemsFoundMsg,
      }));
    }, 500);
  };

  const renderToolsRight = () => {
    return [
      <EuiButton
        fill
        key="addProject"
        onClick={addProjectModal.bind(this)}
        isDisabled={state.isLoading}
      >
        + Create new project
      </EuiButton>,
    ];
  };

  const addProjectModal = () => {
    setState((prevState) => ({
      ...prevState,
      modal: 'addProject',
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
        addProjectSuccessMessage: '',
        addProjectErrorMessage: '',
        validationFields: validationFields,
      }));
    }
  };

  const onAddProject = () => {
    if (!state.name || (state.name && state.name.length < 1)) {
      return;
    }
    let projects = [];
    if (state.projects) {
      projects = state.projects.slice(0);
    }
    let name = state.name.trim();

    let hash = sha256(state.invitationId + name);
    let payload = {
      name: name,
      description: state.description,
    };
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .post(Config.backendUrl + '/api/project', payload, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        projects.unshift(payload);
        setState((prevState) => ({
          ...prevState,
          isLoading: false,
          projects: projects,
          addProjectSuccessMessage: name + ' is successfuly created ',
          name: '',
        }));
        setTimeout(() => {
          setState((prevState) => ({
            ...prevState,
            modal: '',
          }));
          history.push('/project/' + result.data.id);
        }, 1000);
      })
      .catch((err) => {
        setState((prevState) => ({ isLoading: false }));
        if (err.message.indexOf('429') > -1) {
          window.alert(
            `Too many projects. Please upgrade your plan or contact customer support.

Or you can delete old/unused project to preserve more space.
            `
          );
          window.location = '/pricing';
          return;
        } else if (err.message.indexOf('409') > -1) {
          setState((prevState) => ({
            ...prevState,
            isLoading: false,
            projects: projects,
            addProjectErrorMessage: name + ' sudah ada ',
            name: '',
          }));
          setTimeout(() => {
            setState((prevState) => ({ addProjectSuccessMessage: '' }));
          }, 1000);
        }
        if (err.message.indexOf('401') > -1) {
          window.reset();
          window.location = '/';
          return;
        }
      });
  };
  const onFullNameKeyDown = (e) => {
    if (e && e.key === 'Enter') {
      onAddProject();
    }
  };

  const deleteProject = (projectId) => {
    if (
      !window.confirm(
        'Deleting a project will also delete its scopes and scenarios.\nAre you sure that you want to delete this project?'
      )
    ) {
      return;
    }
    setState((prevState) => ({ ...prevState, isLoading: true }));
    axios
      .delete(Config.backendUrl + '/api/project/' + projectId, {
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

  const closePopover = () => {
    setPopover(!isPopoverOpen);
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem className={'content'} style={{ padding: 15 }}>
        <div className={'page-title'}>Projects</div>
        {!(
          !state.projectsAll ||
          (state.projectsAll && state.projectsAll.length < 1)
        ) && (
          <div style={{ textAlign: 'center', margin: 30 }}>
            <EuiFormControlLayout
              className={'hide-in-mobile'}
              icon="search"
              style={{
                display: 'inline-block',
                marginRight: 15,
                width: 1000,
              }}
            >
              <input
                style={{ paddingLeft: 40 }}
                type="text"
                className="euiFieldText"
                aria-label="Filter"
                placeholder="Search"
                onChange={(e) => {
                  let val = e.target.value;
                  let filtered = state.projectsAll;
                  if (!val || val === '') {
                    setState((prevState) => ({
                      ...prevState,
                      projects: filtered,
                    }));

                    return;
                  }
                  filtered = filtered.filter((item) => {
                    return (
                      item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
                    );
                  });
                  setState((prevState) => ({
                    ...prevState,
                    projects: filtered,
                  }));
                }}
              />
            </EuiFormControlLayout>
            <EuiButton
              fill
              key="addProject"
              onClick={addProjectModal.bind(this)}
              isDisabled={state.isLoading}
            >
              + Create new project
            </EuiButton>
          </div>
        )}
        <div style={{ marginTop: 15, style: 'center' }}>
          {!state.isLoading &&
            (!state.projectsAll ||
              (state.projectsAll && state.projectsAll.length < 1)) && (
              <div
                style={{ width: '100%', textAlign: 'center', marginTop: 50 }}
              >
                You have no project. Please create your first project to test!
                <br />
                <br />
                <br />
                <EuiButton
                  fill
                  key="addProject"
                  onClick={addProjectModal.bind(this)}
                  isDisabled={state.isLoading}
                >
                  + Create new project
                </EuiButton>
                <br />
                <img
                  style={{ width: '50%', margin: 15, marginTop: 30 }}
                  src={emptyProject}
                />
              </div>
            )}
          {props.user &&
            props.user.paidPackage &&
            props.user.paidPackage.length > 0 && (
              <h1 style={{ margin: 15 }}>Daftar Tamu</h1>
            )}
          {state.modal === 'addProject' && (
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
                  <p style={{ marginBottom: 15 }}>Create new project</p>
                  {!(
                    state.addProjectSuccessMessage &&
                    state.addProjectSuccessMessage.length > 0
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
                          name={'name'}
                          value={state.name}
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
                          name={'description'}
                          value={state.description}
                          onChange={onChange}
                        />
                      </EuiFormRow>
                    </div>
                  )}
                </EuiModalBody>
                <EuiModalFooter>
                  {state.addProjectSuccessMessage &&
                    state.addProjectSuccessMessage.length > 0 && (
                      <div
                        style={{
                          color: 'green',
                          position: 'absolute',
                          left: 0,
                          padding: 30,
                          marginTop: '-70px',
                        }}
                      >
                        {state.addProjectSuccessMessage}
                        <EuiIcon size={'l'} type={'check'} />
                      </div>
                    )}
                  {state.addProjectErrorMessage &&
                    state.addProjectErrorMessage.length > 0 && (
                      <div
                        style={{
                          color: 'red',
                          position: 'absolute',
                          left: 0,
                          padding: 30,
                          marginTop: '-70px',
                        }}
                      >
                        {state.addProjectErrorMessage}
                      </div>
                    )}
                  {!(
                    (state.addProjectSuccessMessage &&
                      state.addProjectSuccessMessage.length > 0) ||
                    (state.addProjectErrorMessage &&
                      state.addProjectErrorMessage.length > 0)
                  ) && (
                    <EuiButton
                      isLoading={state.isLoading}
                      size="s"
                      fill
                      onClick={onAddProject}
                    >
                      Create
                    </EuiButton>
                  )}
                </EuiModalFooter>
              </EuiModal>
            </EuiOverlayMask>
          )}
          <div className={'projects'}>
            <div className={'projects-container'}>
              {state.projects &&
                state.projects.map((project, index) => {
                  return (
                    <div
                      className={'project-item'}
                      onClick={() => {
                        if (project.childClicked) {
                          project.childClicked = false;
                          return;
                        }
                        history.push('/project/' + project.id);
                      }}
                    >
                      <EuiPopover
                        id={'1'}
                        style={{ float: 'right' }}
                        isOpen={project.pop}
                        panelStyle={{ width: 80 }}
                        closePopover={() => {
                          project.childClicked = true;
                          let projects = state.projects;
                          for (let i in projects) {
                            projects[i].pop = false;
                          }
                          setState((prevState) => ({
                            ...prevState,
                            projects: projects,
                            projectsAll: state.projectsAll,
                          }));
                        }}
                        button={
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              textAlign: 'center',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              project.childClicked = true;
                              let projects = state.projects;
                              for (let i in projects) {
                                if (projects[i].id === project.id) {
                                  projects[i].pop = !projects[i].pop;
                                }
                              }
                              setState((prevState) => ({
                                ...prevState,
                                projects: projects,
                                projectsAll: state.projectsAll,
                              }));
                            }}
                          >
                            <img style={{ width: 30 }} src={threeDots} />
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
                                  name: 'Delete',
                                  onClick: () => {
                                    deleteProject(project.id);
                                  },
                                },
                              ],
                            },
                          ]}
                        />
                      </EuiPopover>

                      <div style={{ height: 25 }}>{project.name}</div>
                      <p
                        style={{
                          height: 45,
                          fontSize: 11,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {project.description}
                      </p>
                      <p style={{ fontSize: 11 }}>
                        By {project.authorName}
                        <br />
                        Created at {project.createdAt}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
