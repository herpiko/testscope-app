import React from 'react';

import Logo from './Logo';

export default function Footer(props) {
  return (
    <div className="footer">
      <span style={{ textDecoration: 'none' }}>
        <span>
          <b style={{ fontSize: 14 }}>
            a product by&nbsp;
            <a
              style={{ textDecoration: 'none', color: 'white' }}
              target="_blank"
              rel="noopener noreferrer"
              href="https://walkeriid.github.io/"
            >
              walkeri
            </a>
          </b>
        </span>
      </span>
      <div style={{ fontSize: 14, marginTop: 15 }}>
        <a style={{ textDecoration: 'none', color: 'white' }} href="/pricing">
          Pricing
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a style={{ textDecoration: 'none', color: 'white' }} href="/tc">
          Terms of Service
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a style={{ textDecoration: 'none', color: 'white' }} target="_blank" href="https://gitlab.com/medionidus-walkeri/testscopeio-issues/-/issues">
          Feedback
        </a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a style={{ textDecoration: 'none', color: 'white' }} target="_blank" href="https://testscope-io.github.io/">
          Documentation
        </a>
      </div>
    </div>
  );
}
