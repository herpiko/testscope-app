import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Config from './Config';
import {
  EuiIcon,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui';
import appLogo from './assets/testscope-logo.png';

export default function Logo(props) {
  const fonts = [
    {
      font: 'Arial',
      weights: [400, '400i', 900],
    },
  ];

  const styles = {
    container: {
      color: props.fontColor || '#173268',
      padding: 10,
      fontFamily: fonts[0].font,
      borderRadius: 5,
      fontSize: props.fontSize || 24,
      cursor: 'pointer',
    },
    logo: {
      paddingTop:7,
      height:30,
    }
  };
  return (
    <div
      style={styles.container}
      onClick={() => {
        window.location = '/';
      }}
    >
      <img src={appLogo} style={styles.logo}/>
    </div>
  );
}
