import React, { useEffect, useState } from 'react';
import './App.css';
import {
  EuiIcon,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiCard,
} from '@elastic/eui';
import axios from 'axios';
import Config from './Config';
import Firebase from './Firebase';
import Login from './Login';
import Pricing from './Pricing';
import Footer from './Footer';
import featureBackground from './assets/qa_engineer.png';
import { useHistory, useLocation } from 'react-router-dom';

const fonts = [
  {
    font: 'Frank Ruhl Libre',
    weights: [400, '400i', 900],
  },
];

const styles = {
  featureHeaderBg: {
    //backgroundImage: `url(${featureBackground})`,
  },
  card: { margin: 15, display: 'inline-block', maxWidth: 220 },
};

export default class Landing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      productType: 'Software',
      productTypes: [
        'Software',
        'Project',
        'Plan',
        'Physical product',
        'Robot',
        'UAT',
        'Experiment',
        'Self',
        'Hardware',
        'Preparation',
        'Recipes',
        'Thought',
        'Repair',
        'Toys',
        'Hypothesis',
      ],
    };
  }
  componentDidMount() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    setInterval(() => {
      let count = this.state.count;
      count += 1;
      if (count > this.state.productTypes.length - 1) {
        count = 0;
      }
      let obj = { productType: this.state.productTypes[count], count: count };
      this.setState(obj);
    }, 500);
  }

  render() {
    return (
      <div>
        <div className={'content-wide'} style={{ background: 'white' }}>
          <div className={'content feature-header'}>
            <div className={'feature-text-container'}>
              <p className={'feature-text'}>
                Robust framework for <br /> manually testing your
                <div style={{ fontSize: 32, color: '#5D5FEF', paddingTop: 10 }}>
                  {this.state.productType}
                </div>
              </p>
              <p className={'feature-desc'}>
              </p>
            </div>
          </div>
        </div>
        <div
          className={'content'}
          style={{ textAlign: 'center', paddingTop: 50, paddingBottom: 50 }}
        >
          <EuiFlexItem style={styles.card}>
            <EuiCard
              style={{ height: 200 }}
              icon={<EuiIcon size="xxl" type={`spacesApp`} />}
              title={`Manage`}
              description="Create and organize your test scopes in feasible way like no other"
            />
          </EuiFlexItem>
          <EuiFlexItem style={styles.card}>
            <EuiCard
              style={{ height: 200 }}
              icon={<EuiIcon size="xxl" type={`graphApp`} />}
              title={`Collaborate`}
              description="Do parallel testing to speed up shipping whatever you want to ship"
            />
          </EuiFlexItem>
          <EuiFlexItem style={styles.card}>
            <EuiCard
              style={{ height: 200 }}
              icon={<EuiIcon size="xxl" type={`appSearchApp`} />}
              title={`Integrate`}
              description="Integrate to your existing workflow in GitLab or GitHub"
            />
          </EuiFlexItem>
          <EuiFlexItem style={styles.card}>
            <EuiCard
              style={{ height: 200 }}
              icon={<EuiIcon size="xxl" type={`notebookApp`} />}
              title={`Report`}
              description="Generate well documented and human-readable reports in various formats"
            />
          </EuiFlexItem>
        </div>
        <div
          className={'content'}
          style={{ textAlign: 'center', paddingTop: 0, paddingBottom: 50 }}
        >
          <EuiFlexItem className={'content'}>
            <EuiPanel style={{ margin: 15 }}>
              <p>
                Learn how Testscope could help you on manual testing
                <EuiButton
                  size="s"
                  fill
                  style={{ margin: 15 }}
                  onClick={() => {
                    let url =
                      'https://testscope-io.github.io/';
                    const newWindow = window.open(
                      url,
                      '_blank',
                      'noopener,noreferrer'
                    );
                    if (newWindow) newWindow.opener = null;
                  }}
                >
                  Read our documentation
                </EuiButton>
              </p>
            </EuiPanel>
          </EuiFlexItem>
        </div>
      </div>
    );
  }
}
