import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFieldText,
  EuiPanel,
  EuiFormRow,
  EuiButton,
  EuiTextArea,
} from '@elastic/eui';
import './App.css';
import Utils from './Utils';
import axios from 'axios';
import Config from './Config';

class ContactForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      validationFields: {
        emailOrPhoneNumber: {
          type: 'string',
          isInvalid: false,
          errors: ['Tidak boleh kosong'],
        },
        message: {
          type: 'string',
          isInvalid: false,
          errors: ['Tidak boleh kosong'],
        },
      },
    };
  }

  componentDidMount() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }
  onChange = e => {
    let value = e.target.value || null;
    let obj = {};
    obj[e.target.name] = value;
    let validationFields = {...this.state.validationFields};
    if (validationFields[e.target.name]) {
      validationFields[e.target.name].isInvalid = false;
      obj.validationFields = validationFields;
    }
    this.setState(obj);
  };
  send = () => {
    let state = {...this.state};
    Utils.validateFields(state).then(result => {
      this.setState({validationFields: result.validationFields});
      this.forceUpdate();
      if (!result.isValid) {
        return;
      }
    this.setState({isLoading: true}, () => {
      setTimeout(() => {
        axios
          .post(
            Config.backendUrl + '/api/messages',
            {
              message: this.state.message,
              emailOrPhoneNumber: this.state.emailOrPhoneNumber,
            },
            {
              headers: {
                authorization: window.localStorage.getItem('authorization'),
              },
            },
          )
          .then(result => {
            this.setState({isLoading: false});
            alert('We\'ll reach you back. Thank you!');
            window.location = '/';
          })
          .catch(err => {
            console.log(err);
            alert('Failed to proceed.');
            this.setState({isLoading: false});
          });
      }, 500);
    });
    });
  };

  render() {
    return this.state.isLoading ? (
      <div
        className="heart-loading"
        style={{padding: 30, textAlign: 'center', height: 180}}>
        Loading...
        <br />
      </div>
    ) : (
      <EuiFlexGroup wrap>
        <EuiFlexItem style={{maxWidth: 500, padding: 10, margin: '0 auto'}}>
              <EuiButton
                size="s"
                style={{margin: 5, width:100}}
                onClick={() => {
                  window.history.back();
                }}>
                Back
              </EuiButton>
          <EuiPanel style={{marginTop: 15}}>
            <h3 style={{marginBottom: 15}}>Leave your message</h3>
            <EuiFormRow
              fullWidth
              label="Email address"
              isInvalid={
                this.state.validationFields['emailOrPhoneNumber'].isInvalid
              }
              error={
                this.state.validationFields['emailOrPhoneNumber'].isInvalid &&
                this.state.validationFields['emailOrPhoneNumber'].errors
              }>
              <EuiFieldText
                fullWidth
                placeholder="Email address"
                name={'emailOrPhoneNumber'}
                value={this.state.emailOrPhoneNumber}
                onChange={this.onChange}
              />
            </EuiFormRow>
            <EuiFormRow
              fullWidth
              label="Message"
              isInvalid={this.state.validationFields['message'].isInvalid}
              error={
                this.state.validationFields['message'].isInvalid &&
                this.state.validationFields['message'].errors
              }>
              <EuiTextArea
                placeholder="Message"
                fullWidth
                name="message"
                value={this.state.message}
                onChange={this.onChange}
              />
            </EuiFormRow>
            <EuiButton size="s" fill onClick={this.send}>
              Send
            </EuiButton>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default ContactForm;
