import React from 'react';
import './App.css';
import { EuiModal, EuiOverlayMask, EuiModalBody } from '@elastic/eui';
import SigninWithGoogleButton from './assets/signinwithgoogle.png';
import Spinner from './Spinner';

class Login extends React.Component {
  state = {
    isLoading: false,
  };
  componentDidMount() {}

  signin = () => {
    this.setState({ isLoading: true });
    this.props.authFunc();
  };

  render() {
    return (
      <EuiOverlayMask>
        <EuiModal
          style={{ padding: 15, textAlign: 'center', background: '#fafbfd'}}
          onClose={this.props.toggleModal}
        >
          {!this.state.isLoading ? (
            <EuiModalBody>
              <p
                style={{
                  color: 'grey',
                  fontSize: 11,
                  marginTop: 15,
                  lineHeight: '1.4em',
                }}
              >
                By continuing, you agree to our
                <br />
                <a href="/tc" target="_blank">
                  Term of Service & Privacy policies.
                </a>
              </p>
              <br/>
              <img
                alt="google-signin-button"
                style={{ height: 50, cursor: 'pointer' }}
                src={SigninWithGoogleButton}
                onClick={this.signin}
              />
            </EuiModalBody>
          ) : (
            <div style={{ width: '100%', margin: '0 auto' }}>
              <Spinner />
            </div>
          )}
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}

export default Login;
