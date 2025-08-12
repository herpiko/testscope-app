import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiPanel } from '@elastic/eui';
import './App.css';
import Config from './Config';

class Thankyou extends React.Component {
  componentDidMount() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  render() {
    return (
      <EuiFlexGroup wrap>
        <EuiFlexItem className={'content'} style={{ padding: 15 }}>
          <div className={'page-title'}>🤩</div>
          <EuiPanel
            style={{
              marginTop: 15,
              textAlign: 'left',
              lineHeight: '1.4em',
              marginBottom: 30,
            }}
          >
            <p>
              Thank you for subscribing to our paid app service! Your purchase
              not only grants you access to customer support but also supports
              the ongoing development of our app. We truly appreciate your
              support and look forward to providing you with an exceptional
              experience.
            </p>
            <p>
              <br />
              <br />
              Sincerely,
              <br />
              <br />
              Herpiko
              <br />
              <br />
              <hr />
              <br />
              Customer support and feedback:
              <ul>
                <li>
                  - Email: herpiko@gmail.com
                </li>
                <li>
                  - Telegram: herpiko
                </li>
                <li>
                  - Twitter: herpiko
                </li>
              </ul>
               
            </p>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default Thankyou;
