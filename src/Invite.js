import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  EuiModal,
  EuiOverlayMask,
  EuiModalBody,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiButton,
} from '@elastic/eui';
import './App.css';
import axios from 'axios';
import Config from './Config';
import Firebase from './Firebase';
import Login from './Login';
import Services from './Services';

export default function Pricing(props) {
  console.log(props);
  const [loginModal, setLoginModal] = useState(false);
  const [inviteCode, setInviteCode] = useState(false);
  const [project, setProject] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const fonts = [
    {
      font: 'Frank Ruhl Libre',
      weights: [400, '400i', 900],
    },
  ];

  useEffect(() => {
    let id = window.location.href.split('/')[
      window.location.href.split('/').length - 1
    ];
    getInvitation(id);
  }, []);

  const toggleLoginModal = () => {
    setLoginModal(!loginModal);
  };

  const getInvitation = (code) => {
    Services.getInvitation(code)
      .then((result) => {
        console.log(result);
        if (result && result.data) {
          if (result.data.access != '') {
            alert('You have already joined this project.');
            history.push('/projects');
          } else {
            setInviteCode(code);
            setProject(result.data);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        setLoginModal(false);
        alert('An error occurred. Please try again later.');
      });
  };

  const join = (code) => {
    Services.acceptInvitation(code)
      .then((result) => {
        history.push('/projects');
      })
      .catch((err) => {
        console.log(err);
        if (
          err.message.indexOf('401') > -1 ||
          err.message.indexOf('403') > -1
        ) {
          window.reset();
          window.location = window.location.origin + window.location.pathname;
          return;
        }
        setLoginModal(false);
        alert('An error occurred. Please try again later.');
      });
  };

  const joinWithAuthCheck = (code) => {
    setInviteCode(code);
    // is logged in?
    let token = window.localStorage.getItem('authorization');
    if (token && token.length > 0) {
      join(code);
    } else {
      toggleLoginModal();
    }
  };

  const authenticate = () => {
    Services.authenticate()
      .then((result) => {
        console.log('====================================');
        console.log(result);
        toggleLoginModal();
        window.localStorage.setItem('authorization', result.data.token);
        let currentUser = result.data;
        window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
        setLoading(false);
        joinWithAuthCheck(inviteCode);
      })
      .catch((err) => {
        console.log(err);
        setLoginModal(false);
        alert('An error occurred. Please try again later.');
      });
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem className={'content'}>
        {loginModal && (
          <Login authFunc={authenticate} toggleModal={toggleLoginModal} />
        )}
        <h1 className={'pricing-title'} style={{ marginTop: 50 }}>
          Invitation
        </h1>
        {project && project.access && project.access === 'MODIFY' ? (
          <div
            style={{
              margin: '0 auto',
              textAlign: 'center',
              lineHeight: '1.4em',
            }}
          >
            You already joined {project.name}.
            <br />
            <br />
            <br />
            <EuiButton
              fill
              size="s"
              onClick={() => {
                history.push('/project/' + project.id);
              }}
            >
              Show the project
            </EuiButton>
          </div>
        ) : (
          <div
            style={{
              margin: '0 auto',
              textAlign: 'center',
              lineHeight: '1.4em',
            }}
          >
            You have been invited to join {project.name}
            <br />
            <br />
            <br />
            <EuiButton
              fill
              size="s"
              onClick={() => {
                joinWithAuthCheck(inviteCode);
              }}
            >
              Join
            </EuiButton>
          </div>
        )}
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
