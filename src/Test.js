import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
	EuiToolTip,
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
	EuiContextMenu,
	EuiPopover,
} from '@elastic/eui';
import './App.css';
import Linkify from 'react-linkify';
import Utils from './Utils';
import axios from 'axios';
import Config from './Config';
import Services from './Services';
import qs from 'qs';
import './TimePicker.css';
import sha256 from 'sha256';
import emptyScope from './assets/new-scope.svg';
import emptyScenario from './assets/new-scenario.svg';

const noItemsFoundMsg = 'Empty.';

export default function Test(props) {
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
				if (
					err.message.indexOf('401') > -1 ||
					err.message.indexOf('403') > -1
				) {
					window.location = '/projects';
					return;
				}
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
					if (
						err.message.indexOf('401') > -1 ||
						err.message.indexOf('403') > -1
					) {
						window.location = '/projects';
						return;
					}
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
								console.log('================================================');
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

				setOntest(ontestCount);
				setPassed(passedCount);
				setFailed(failedCount);
				setUnassigned(unassignedCount);

				for (let i in scopes) {
					let selected = [];
					for (let j in scopes[i].scenarios) {
						for (let k in result.data.scenarios) {
							if (scopes[i].scenarios[j] && scopes[i].scenarios[j].selected) {
								let isExists = false;
								for (let l in selected) {
									if (selected[l].id === scopes[i].scenarios[j].id) {
										isExists = true;
									}
								}
								if (!isExists) {
									selected.push(scopes[i].scenarios[j]);
								}
							}
						}
					}
					if (selected.length > 0) {
					scopes[i].scenarios = selected;
						scopes[i].selected = true
					}
				}
				setState((prevState) => ({
					...prevState,
					isLoading: false,
					message: noItemsFoundMsg,
					error: undefined,
					session: result.data,
				}));
			})
			.catch((err) => {
				console.log(err);
				alert('An error occured');
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
	const [currentTest, setCurrentTest] = useState();
	const [passed, setPassed] = useState(0);
	const [ontest, setOntest] = useState(0);
	const [failed, setFailed] = useState(0);
	const [unassigned, setUnassigned] = useState(0);
	const [testers, setTesters] = useState([]);
	const [assists, setAssists] = useState([]);
	const [copyInvitationText, setCopyInvitationText] = useState(
		'Copy session link'
	);
	const [isTestPopoverOpen, setTestPopover] = useState(false);
	const [isSessionPopoverOpen, setSessionPopover] = useState(false);
	const [failReason, setFailReason] = useState('');

	const loadTesters = (projectId) => {
		Services.getTesters(projectId)
			.then((result) => {
				console.log(result.data.data);
				let filtered = [];
				let arr = [];
				for (let i in result.data.data) {
					if (result.data.data[i].emailAddress !== props.user.email_address) {
						filtered.push(result.data.data[i]);
					}
				}
				for (let i in filtered) {
					arr.push({
						id: filtered[i].id,
						name: filtered[i].emailAddress,
						originName: filtered[i].emailAddress,
						onClick: () => {
							arr[i].assist = !arr[i].assist;
							if (arr[i].assist) {
								arr[i].name += ' ✔️';
							} else {
								arr[i].name = arr[i].originName;
							}
							setTesters(arr);
							setTestPopover(false);
						},
					});
				}
				setTesters(arr);
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

	const history = useHistory();

	const passStep = (index) => {
		if (!currentTest) {
			console.log('currentTest is null');
			return;
		}
		console.log(index);
		let test = currentTest.test;

		let lastPassed = -1;
		for (let i in test.steps) {
			if (test.steps[i].passed) {
				lastPassed = parseInt(i);
			}
		}
		if (lastPassed === index) {
			test.steps[index].passed = !test.steps[index].passed;
		} else {
			for (let i in test.steps) {
				if (i <= index) {
					test.steps[i].passed = true;
				} else {
					test.steps[i].passed = false;
				}
			}
		}

		Services.updateTest(test)
			.then(() => {
				setCurrentTest({
					scope: currentTest.scope,
					scenario: currentTest.scenario,
					test: test,
				});
			})
			.catch((err) => {
				console.log(err);
				alert('An error occured');
			});
	};

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
		loadScopes(projectId).then((scopes) => {
			if (id !== 'new') {
				loadData(id, scopes);
			}
		});
		loadTesters(projectId);
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

	const closeTestPopover = () => {
		setTestPopover(!isTestPopoverOpen);
	};
	const closeSessionPopover = () => {
		setSessionPopover(!isSessionPopoverOpen);
	};

	const backToScope = () => {
		setCurrentTest(null);
	};
	return (
		<EuiFlexGroup wrap>
			<EuiFlexItem className={'content'} style={{ padding: 15 }}>
				{!currentTest && (
					<div>
						<EuiPopover
							id={'1'}
							style={{ float: 'right' }}
							isOpen={isSessionPopoverOpen}
							closePopover={closeSessionPopover}
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
										setSessionPopover(!isSessionPopoverOpen);
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
												name: 'Copy session link',
												onClick: () => {
													navigator.clipboard.writeText(
														window.location.origin + window.location.pathname
													);
													setSessionPopover(false);
												},
											},
											{
												name: 'Reset session',
												onClick: () => {
													if (
														!window.confirm(
															'Are you sure that you want to reset the session? All the session progress and result will be lost.'
														)
													) {
														return;
													}
													Services.resetSession(state?.session?.id)
														.then(() => {
															backToScope();
															loadData(state.session.id);
															setSessionPopover(false);
														})
														.catch((err) => {
															console.log(err);
															alert('An error occured');
															setSessionPopover(false);
														});
												},
											},
											{
												name: 'Close session',
												onClick: () => {
													if (
														!window.confirm(
															'Are you sure you want to close this testing session?'
														)
													) {
														return;
													}
													let item = state?.session;
													item.status = 1;
													Services.updateSession(item)
														.then(() => {
															history.push(
																'/project/' + state?.project?.id + '#Sessions'
															);
															setSessionPopover(false);
														})
														.catch((err) => {
															console.log(err);
															alert('An error occured');
														});
												},
											},
										],
									},
								]}
							/>
						</EuiPopover>
					</div>
				)}
				<div style={{ marginBottom: 15, marginTop: 15 }}>
					<span
						style={{ color: '#006BB4', cursor: 'pointer' }}
						onClick={() => {
							if (!currentTest) {
								history.push('/project/' + state?.project?.id + '#Sessions');
							} else {
								backToScope();
							}
						}}
					>
						<EuiIcon type="arrowLeft" />
						{currentTest ? 'Back' : state?.project?.name}
					</span>
				</div>
				<div className={'page-title'}>
					{state?.project?.name} : {state?.session?.version}
				</div>
				<div>
					<div style={{ marginBottom: 15 }}></div>
					{state?.session?.description &&
						state?.session?.description.length > 0 && (
							<Linkify>
								<p
									style={{
										lineHeight: '1.5em',
										padding: 10,
										whiteSpace: 'pre-line',
									}}
								>
									{state?.session?.description}
								</p>
							</Linkify>
						)}
					{!currentTest && (
						<EuiPanel
							style={{
								textAlign: 'center',
								marginTop: 30,
								lineHeight: '2em',
								borderRadius: 7,
							}}
						>
							<span style={{ fontSize: 24, color: 'green' }}>
								Passed: {passed}{' '}
							</span>
							&nbsp;&nbsp;&nbsp;
							<span style={{ fontSize: 24, color: 'red' }}>
								Failed: {failed}{' '}
							</span>
							&nbsp;&nbsp;&nbsp;
							<span style={{ fontSize: 24, color: 'blue' }}>
								On test: {ontest}{' '}
							</span>
							&nbsp;&nbsp;&nbsp;
							<span style={{ fontSize: 24, color: 'grey' }}>
								Unassigned: {unassigned}{' '}
							</span>
						</EuiPanel>
					)}
					{currentTest && (
						<EuiPanel style={{ marginTop: 0, marginBottom: 15 }}>
							<EuiButton
								style={{ float: 'right', margin: 5 }}
								onClick={() => {
									let test = currentTest.test;
									for (let i in test.steps) {
										test.steps[i].passed = true;
									}
									setCurrentTest({
										scope: currentTest.scope,
										scenario: currentTest.scenario,
										test: test,
									});

									setTimeout(() => {
										let test = currentTest.test;
										for (let i in test.steps) {
											test.steps[i].passed = true;
										}
										test.assists = [];
										for (let i in testers) {
											if (testers[i].assist) {
												test.assists.push({
													id: testers[i].id,
													name: testers[i].name,
												});
											}
										}
										test.status = 2;
										Services.updateTest(test)
											.then(() => {
												backToScope();
												loadData(state.session.id);
											})
											.catch((err) => {
												console.log(err);
												alert('An error occured');
											});
									}, 300);
								}}
								fill
								size="s"
								color="success"
							>
								Pass
							</EuiButton>
							<EuiButton
								style={{ float: 'right', margin: 5 }}
								onClick={() => {
									setState((prevState) => ({
										...prevState,
										modal: 'fail',
									}));
								}}
								fill
								size="s"
								color="danger"
							>
								Fail
							</EuiButton>
							<EuiPopover
								id={'1'}
								style={{ float: 'right' }}
								isOpen={isTestPopoverOpen}
								closePopover={closeTestPopover}
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
											setTestPopover(!isTestPopoverOpen);
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
													name: 'Unassign',
													onClick: () => {
														Services.deleteTest(currentTest.test.id)
															.then(() => {
																backToScope();
																loadData(state.session.id);
															})
															.catch((err) => {
																console.log(err);
																alert('An error occured');
															});
													},
												},
												{
													name: 'Set Assistants',
													toolTipTitle: 'Test Assistants',
													toolTipContent:
														'Some scenarios may need more than one tester to test. Add them here to share the responsibility of specific test',
													toolTipPosition: 'bottom',
													panel: 1,
												},
											],
										},
										{
											id: 1,
											initialFocusedItemIndex: 1,
											items: testers,
											title: 'Back',
										},
									]}
								/>
							</EuiPopover>

							<h2 style={{ fontSize: 18, marginTop: 50 }}>
								Scope: {currentTest?.scope?.name}
							</h2>
							<h2 style={{ fontSize: 18, marginTop: 5 }}>
								Scenario: <b>{currentTest?.scenario?.name}</b>
							</h2>
						  {testers.filter((value) => { return value.assist }).length > 0 &&
							<h2 style={{ fontSize: 18, marginTop: 5 }}>
								Assistant(s):{' '}
								{testers.map((tester, index) => {
									if (tester.assist) {
										return <span>{tester.originName} </span>;
									} else {
										return '';
									}
								})}
							</h2>
								}
							<div style={{ marginTop: 15 }}>
								{currentTest.test.steps.map((item, index) => {
									return (
										<div
											className={
												'step-item' + (item.passed ? ' scen-item-green' : '')
											}
											onClick={() => {
												passStep(index);
											}}
										>
											<div>
												<div
													style={{
														display: 'inline-block',
														width: '50%',
														verticalAlign: 'top',
													}}
												>
													<p
														style={{
															lineHeight: '1.5em',
															padding: 10,
															whiteSpace: 'pre-line',
														}}
													>
														{currentTest.test.steps[index].status}
														&nbsp;
														{currentTest.test.steps[index].step}
													</p>
												</div>
												<div
													style={{
														display: 'inline-block',
														width: '50%',
														verticalAlign: 'top',
													}}
												>
													<p
														style={{
															lineHeight: '1.5em',
															padding: 10,
															whiteSpace: 'pre-line',
														}}
													>
														{currentTest.test.steps[index].expectation}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</EuiPanel>
					)}
					{!currentTest && (
						<div>
							{state?.session?.status === 0 && (
								<div
									style={{
										marginTop: 30,
										textAlign: 'center',
									}}
								>
									Please select a scenario that you want to test :
								</div>
							)}
							<div style={{ marginTop: 15 }}>
								{state.project &&
									state.scopes &&
									state.scopes.map((scope, index) => {
										if (!scope.selected) {
											return '';
										}
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
													<EuiIcon
														type={scope.collapsed ? 'arrowDown' : 'arrowUp'}
													/>
												</span>
												{!scope.collapsed && scope.scenarios && (
													<div style={{ marginTop: 15 }}>
														{scope.scenarios.map((scen, scenIdx) => {
															return (
																<div
																	className={
																		'scen-item' +
																		(scen.status === 2
																			? ' scen-item-green'
																			: scen.status === 3
																			? ' scen-item-red'
																			: '')
																	}
																	onClick={() => {
																		scope.childClicked = true;
																		if (state?.session?.status > 0) {
																			alert('The session is already closed.');
																			return;
																		}
																		if (
																			scen.status === 2 ||
																			scen.status === 3
																		) {
																			if (
																				!window.confirm(
																					'The test is already done. Do you want to re-test it?'
																				)
																			) {
																				return;
																			}
																		}

																		Services.createTest({
																			sessionId: state.session.id,
																			scenarioId: scen.id,
																		})
																			.then((result) => {
																				setCurrentTest({
																					scope: scope,
																					scenario: scen,
																					test: result.data,
																				});
																			})
																			.catch((err) => {
																				if (err.message.indexOf('409') > -1) {
																					alert(
																						'The scenario is already taken by other tester'
																					);
																					loadData(state.session.id);
																				}
																			});
																	}}
																>
																	{scen.name}
																	{scen.notes && scen.notes.length > 0 && (
																		<br />
																	)}
																	{scen.notes && scen.notes.length > 0 && (
																		<span style={{ fontSize: 12 }}>
																			Note: {scen.notes}
																		</span>
																	)}
																	{scen.assigneeName &&
																		scen.assigneeName.length > 0 && (
																			<span
																				style={{ float: 'right', fontSize: 12 }}
																			>
																				{scen.assigneeName}
																				&nbsp; &nbsp;
																				{scen.assists &&
																					scen.assists.length > 0 && (
																						<EuiToolTip
																							content={
																								<p>
																									{scen.assists.map(
																										(tester, index) => {
																											if (tester.assist) {
																												return (
																													<span>
																														{tester.name}{' '}
																													</span>
																												);
																											} else {
																												return '';
																											}
																										}
																									)}
																								</p>
																							}
																						>
																							<EuiIcon
																								type="users"
																								style={{ marginRight: 5 }}
																							></EuiIcon>
																						</EuiToolTip>
																					)}
																				<EuiIcon
																					color={
																						scen.status === 2
																							? 'green'
																							: scen.status === 3
																							? 'red'
																							: scen.assigneeName ===
																							  props.user.email_address
																							? 'blue'
																							: 'blue'
																					}
																					type={
																						scen.status === 2
																							? 'check'
																							: scen.status === 3
																							? 'cross'
																							: scen.assigneeName ===
																							  props.user.email_address
																							? 'visGauge'
																							: 'lock'
																					}
																				/>
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
						</div>
					)}
				</div>
				{state.modal === 'fail' && (
					<EuiOverlayMask>
						<EuiModal
							style={{ width: 500 }}
							onClose={() => {
								setState((prevState) => ({
									...prevState,
									modal: false,
								}));
							}}
						>
							<EuiModalHeader></EuiModalHeader>
							<EuiModalBody>
								<div>
									<p style={{ marginBottom: 15 }}>
										Please describe how this scenario failed.
									</p>
									<EuiFormRow fullWidth>
										<EuiTextArea
											fullWidth
											autoComplete="off"
											name={'notes'}
											value={failReason}
											onChange={(e) => {
												let val = e.target.value;
												setFailReason(val);
											}}
											inputRef={(input) => {
												input && input.focus();
											}}
										/>
									</EuiFormRow>
									<br />
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
									onClick={() => {
										let test = currentTest.test;
										test.status = 3;
										if (failReason.length > 0) {
											test.notes = failReason;
										}
										Services.updateTest(test)
											.then(() => {
												backToScope();
												loadData(state.session.id);
												setState((prevState) => ({
													...prevState,
													modal: '',
												}));
												setFailReason('');
											})
											.catch((err) => {
												console.log(err);
												alert('An error occured');
												setState((prevState) => ({
													...prevState,
													modal: '',
												}));
												setFailReason('');
											});
									}}
								>
									Submit
								</EuiButton>
							</EuiModalFooter>
						</EuiModal>
					</EuiOverlayMask>
				)}
			</EuiFlexItem>
		</EuiFlexGroup>
	);
}
