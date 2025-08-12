import React, { useEffect, useState, forwardRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import {
  EuiIcon,
  EuiButton,
  EuiButtonEmpty,
  EuiContextMenu,
  EuiPopover,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import Services from './Services';
import Login from './Login';
import Logo from './Logo';
import Utils from './Utils';

const limit = {
  free: {
    project: 3,
    scope: 10,
    scenario: 50,
    session: 50,
    test: 100,
  },
  standard: {
    project: 10,
    scope: 100,
    scenario: 1000,
    session: 1000,
    test: 1000,
  }
}

const MainHeader = forwardRef((props, ref) => {
  const [isPopoverOpen, setPopover] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [menuModal, setMenuModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    copyUrlStr: 'Copy link',
  });

  const location = useLocation();
  const history = useHistory();

  const fonts = [
    {
      font: 'Frank Ruhl Libre',
      weights: [400, '400i'],
    },
  ];

  const styles = {
    primaryFont: {
      fontFamily: fonts[0].font,
    },
    burger: {
      paddingTop: 17,
      paddingRight: 100,
      paddingLeft: 17,
      cursor: 'pointer',
      width: 35,
    },
    burgerStrip: {
      width: 30,
      height: 5,
      marginBottom: 5,
      backgroundColor: '#173268',
    },
    menuModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      display: 'inline-block',
      backgroundColor: '#e1ecf6',
      height: '100%',
      width: '300px',
      zIndex: 998,
      boxShadow: '0 0 15px rgba(0,0,0,0.75)',
      clipPath: 'inset(0px -15px 0px 0px)',
    },
    menuModalClose: {
      color: '#173268',
      cursor: 'pointer',
      float: 'right',
      margin: 30,
      top: 0,
      right: 0,
    },
    menuItem: {
      height: 60,
      width: '90%',
      lineHeight: 1.5,
      margin: 15,
      color: '#173268',
      cursor: 'pointer',
      padding: 30,
    },
  };

  useEffect(() => {
    let currentUser = {};
    currentUser = JSON.parse(window.localStorage.getItem('currentUser'));
    props.setUser(currentUser);
    let token = window.localStorage.getItem('authorization');
    setLoading(true);
    if (token && token.length > 0) {
      getUserProfile(token);
    } else {
      setLoading(false);
    }
    /*
     * */
  }, []);

  const getUserProfile = (token) => {
    Services.isLoggedIn()
      .then((result) => {
        if (result && result.data && result.data) {
          let currentUser = result.data;
          currentUser.token = token;
          props.setUser(currentUser);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        window.reset();
        setLoading(false);
      });
  };

  const closePopover = () => {
    setPopover(!isPopoverOpen);
  };
  const toggleLoginModal = () => {
    setLoginModal(!loginModal);
  };
  const toggleMenuModal = () => {
    setMenuModal(!menuModal);
  };
  const authenticate = () => {
    setLoading(true);
    Services.authenticate()
      .then((result) => {
        toggleLoginModal();
        let token = result.data.token;
        window.localStorage.setItem('authorization', token);
        let currentUser = result.data;
        window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
        props.setUser(currentUser);

        if (token && token.length > 0) {
          getUserProfile(token);
        } else {
          setLoading(false);
        }
        history.push('/projects');
      })
      .catch((err) => {
        toggleLoginModal();
        console.log(err);
        setLoading(false);
        alert('Terjadi gangguan. Silakan coba beberapa saat lagi.');
      });
  };

  return (
    <div
      style={{
        background: '#153167',
        height: 60,
        width: '100%',
        display: 'block',
      }}
    >
      {loginModal && (
        <Login authFunc={authenticate} toggleModal={toggleLoginModal} />
      )}
      {menuModal && (
        <div style={styles.menuModal}>
          <div className="App-header-button-top">
            <div style={{ height: 70 }}>
              <div
                style={styles.menuModalClose}
                onClick={() => {
                  toggleMenuModal();
                }}
              >
                <EuiIcon type="cross" size="xl" />
              </div>
            </div>
            {!(props.user && props.user.token) && (
              <div
                style={styles.menuItem}
                onClick={() => {
                  toggleLoginModal();
                }}
              >
                <EuiIcon type="kqlFunction" size="l" />
                &nbsp;&nbsp; Login/Signup
              </div>
            )}
            {props.user && props.user.token && (
              <div
                style={styles.menuItem}
                onClick={() => {
                  toggleMenuModal();
                  history.push('/projects');
                }}
              >
                <EuiIcon type="pencil" size="l" />
                &nbsp;&nbsp; Projects
              </div>
            )}
            {props.user && props.user.token && (
              <div
                style={styles.menuItem}
                onClick={() => {
                  toggleMenuModal();
                  history.push('/pricing');
                }}
              >
                <EuiIcon type="glasses" size="l" />
                &nbsp;&nbsp;Upgrade
              </div>
            )}
            {props.user && props.user.token && (
              <div
                style={styles.menuItem}
                onClick={() => {
                  toggleMenuModal();
                  if (window.confirm('Are you sure that you want to logout?')) {
                    window.reset();
                    window.location = '/';
                  }
                }}
              >
                <EuiIcon type="exit" size="l" />
                &nbsp;&nbsp;Logout
              </div>
            )}
          </div>
        </div>
      )}

      <div className="topnav">
        {/*
        {props.user && props.user.token ? (
          <div
            className="topnav-left"
            style={styles.burger}
            onClick={() => {
              toggleMenuModal();
            }}
          >
            <div style={styles.burgerStrip} />
            <div style={styles.burgerStrip} />
            <div style={styles.burgerStrip} />
          </div>
        ) : (
          <div className="topnav-left">
            <div
              style={styles.burger}
              className={'hide-in-desktop'}
              onClick={() => {
                toggleMenuModal();
              }}
            >
              <div style={styles.burgerStrip} />
              <div style={styles.burgerStrip} />
              <div style={styles.burgerStrip} />
            </div>
            <div style={styles.burger} className={'hide-in-mobile'}></div>
          </div>
        )}
      */}
        {
          <div
            className="topnav-left hide-in-mobile"
            style={{ paddingLeft: 100 }}
          >
            <Logo />
          </div>
        }
        {!loading && (
          <div className={'topnav-right'} c>
            {!(
              props.user &&
              props.user.token &&
              props.user.token.length > 0
            ) && (
              <div>
                <EuiButton
                  size="s"
                  className="hide-in-mobile"
                  style={{
                    margin: 15,
                    backgroundColor: 'white',
                    color: 'black',
                    border: 0,
                    boxShadow: 'none',
                  }}
                  onClick={() => {
                    history.push('/pricing');
                  }}
                >
                  Pricing
                </EuiButton>
                <EuiButton
                  className={'topnav-float-right'}
                  size="s"
                  fill
                  style={{ margin: 15 }}
                  onClick={() => {
                    toggleLoginModal();
                  }}
                >
                  Continue with Google
                </EuiButton>
              </div>
            )}
            {props.user && props.user.token && props.user.token.length > 0 && (
              <div>
                <EuiButton
                  size="s"
                  style={{
                    margin: 15,
                    backgroundColor: 'white',
                    color: 'black',
                    border: 0,
                    boxShadow: 'none',
                  }}
                  onClick={() => {
                    history.push('/projects');
                  }}
                >
                  All Projects
                </EuiButton>
                {props.user.subscription_type !== 'standard' && (
                  <EuiButton
                    className="hide-in-mobile"
                    size="s"
                    style={{
                      margin: 15,
                      backgroundColor: 'white',
                      color: 'black',
                      border: 0,
                      boxShadow: 'none',
                    }}
                    onClick={() => {
                      history.push('/pricing');
                    }}
                  >
                    Pricing
                  </EuiButton>
                )}

                {props.user.subscription_type === 'standard' && (
                  <EuiButton
                    size="s"
                    className="hide-in-mobile"
                    style={{
                      margin: 15,
                      backgroundColor: 'white',
                      color: 'black',
                      border: 0,
                      boxShadow: 'none',
                    }}
                    onClick={() => {
                      history.push('/thankyou');
                    }}
                  >
                    Thank you!
                  </EuiButton>
                )}

                <EuiPopover
                  className={'topnav-float-right'}
                  id={'1'}
                  isOpen={isPopoverOpen}
                  closePopover={closePopover}
                  button={
                    <EuiButton
                      onClick={() => {
                        setPopover(!isPopoverOpen);
                      }}
                      size="s"
                      style={{
                        margin: 15,
                        backgroundColor: 'white',
                        color: 'black',
                        border: 0,
                        boxShadow: 'none',
                      }}
                    >
                      <EuiIcon type="user" size="l" />
                    </EuiButton>
                  }
                >
                  <EuiContextMenu
                    initialPanelId={0}
                    panels={[
                      {
                        id: 0,
                        title:
                          props.user.email_address +
                          (props.user.subscription_type === 'standard'
                            ? ' - 🤩'
                            : ' - FREE'),
                        items: [
                          {
                            name: (props && props.user && (props.user.subscription_type.substr(0,1).toUpperCase() + props.user.subscription_type.substr(1) + ' tier quota')),
                            panel: 1,
                          },
                          {
                            name: 'Logout',
                            onClick: () => {
                              if (
                                window.confirm(
                                  'Are you sure that you want to logout?'
                                )
                              ) {
                                window.reset();
                                window.location = '/';
                              }
                            },
                          },
                        ],
                      },
                      {
                              id: 1,
                              title: 'Back',
											        initialFocusedItemIndex: 1,
                              content:     (<EuiText style={{marginTop:10}}>
                                 <h3>Your quota</h3>
                                 <p>
                                 <div style={{background:'#f2f2f2', border:'1px solid #f2f2f2', marginTop:5}}>
                                   <div style={{float:'left',marginLeft:5}}>
                                    Project: {props && props.user && props.user.quotas && props.user.quotas.project} / {limit[props.user.subscription_type].project}
                                    </div>
                                    <div style={{height:24,width:(props && props.user && props.user.quotas && props.user.quotas.project / limit[props.user.subscription_type].project * 100)+'%', background:'#c6c7ff'}}>
                                    </div>
                                 </div>
                                 <div style={{background:'#f2f2f2', border:'1px solid #f2f2f2', marginTop:5}}>
                                   <div style={{float:'left',marginLeft:5}}>
                                    Scope: {props && props.user && props.user.quotas && props.user.quotas.scope} / {limit[props.user.subscription_type].scope}
                                    </div>
                                    <div style={{height:24,width:(props && props.user && props.user.quotas && props.user.quotas.scope / limit[props.user.subscription_type].scope * 100)+'%', background:'#c6c7ff'}}>
                                    </div>
                                 </div>
                                 <div style={{background:'#f2f2f2', border:'1px solid #f2f2f2', marginTop:5}}>
                                   <div style={{float:'left',marginLeft:5}}>
                                    Scenario: {props && props.user && props.user.quotas && props.user.quotas.scenario} / {limit[props.user.subscription_type].scenario}
                                    </div>
                                    <div style={{height:24,width:(props && props.user && props.user.quotas && props.user.quotas.scenario / limit[props.user.subscription_type].scenario * 100)+'%', background:'#c6c7ff'}}>
                                    </div>
                                 </div>
                                 <div style={{background:'#f2f2f2', border:'1px solid #f2f2f2', marginTop:5}}>
                                   <div style={{float:'left',marginLeft:5}}>
                                    Session: {props && props.user && props.user.quotas && props.user.quotas.session} / {limit[props.user.subscription_type].session}
                                    </div>
                                    <div style={{height:24,width:(props && props.user && props.user.quotas && props.user.quotas.session / limit[props.user.subscription_type].session * 100)+'%', background:'#c6c7ff'}}>
                                    </div>
                                 </div>
                                 <div style={{background:'#f2f2f2', border:'1px solid #f2f2f2', marginTop:5}}>
                                   <div style={{float:'left',marginLeft:5}}>
                                    Test: {props && props.user && props.user.quotas && props.user.quotas.test} / {limit[props.user.subscription_type].test}
                                    </div>
                                    <div style={{height:24,width:(props && props.user && props.user.quotas && props.user.quotas.test / limit[props.user.subscription_type].test * 100)+'%', background:'#c6c7ff'}}>
                                    </div>
                                 </div>
                                 </p>
                               </EuiText>),
                      }
                    ]}
                  />
                </EuiPopover>
              </div>
            )}
          </div>
        )}
      </div>

      {/*
			<div style={{overflow: 'hidden'}}>
			</div>
			<div style={{ float: 'right' }}>
			</div>
				*/}
    </div>
  );
});
export default MainHeader;
