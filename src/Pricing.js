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
import Services from './Services';
import Firebase from './Firebase';
import Login from './Login';

export default function Pricing(props) {
  console.log(props);
  const [payment, setPayment] = useState({});
  const [loading, setLoading] = useState({});
  const [loginModal, setLoginModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const history = useHistory();

  const fonts = [
    {
      font: 'Frank Ruhl Libre',
      weights: [400, '400i', 900],
    },
  ];

  useEffect(() => {
    console.log(payment.paymentUrl);
    console.log(!payment.existingPaymentUrlChecked);
    if (props && props.user && props.user.id) {
      if (!payment.existingPaymentUrlChecked) {
        getExistingPaymentUrl(props.user.id);
      }
    }
  }, [payment, props.user]);

  const toggleLoginModal = () => {
    setLoginModal(!loginModal);
  };

  const closePayment = () => {
    setPaymentModal(false);
    //var checkInterval = setInterval(() => {
    axios
      .get(
        Config.backendUrl +
          '/api/payments/invoice/' +
          payment.invoiceExternalId,
        {
          headers: {
            authorization: window.localStorage.getItem('authorization'),
          },
        }
      )
      .then((result) => {
        console.log(result);
        if (result.data.status === 'PAID' || result.data.status === 'SETTLED') {
          //clearInterval(checkInterval)
          setTimeout(() => {
            window.location = '/thankyou';
          }, 500);
          /*
           * */
        }
      })
      .catch((err) => {
        //clearInterval(checkInterval)
        console.log(err);
        alert('An error occured. Please try again later.');
        let obj = { ...loading };
        obj[payment.selectedService] = false;
        setLoading(obj);
      });
    //}, 1000)
  };

  const getExistingPaymentUrl = (userId) => {
    axios
      .get(Config.backendUrl + '/api/payments/invoice-by-user-id/' + userId, {
        headers: {
          authorization: window.localStorage.getItem('authorization'),
        },
      })
      .then((result) => {
        console.log(result);
        let obj = {};
        obj.selectedService = 'standard';
        obj.paymentUrl = result.data.url;
        obj.invoiceExternalId = result.data['external_id'];
        obj['existingPaymentUrlChecked'] = true;
        setPayment(obj);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const purchase = (service) => {
    let obj = {};
    if (payment.paymentUrl && payment.paymentUrl.length > 0) {
      setPaymentModal(true);
      obj = { ...loading };
      obj[service] = false;
      setLoading(obj);
      return;
    }
    obj = { ...loading };
    obj[service] = true;
    setLoading(obj);
    axios
      .post(
        Config.backendUrl + '/api/payments/invoice',
        {
          items: [{ id: service }],
        },
        {
          headers: {
            authorization: window.localStorage.getItem('authorization'),
          },
        }
      )
      .then((result) => {
        console.log(result);
        let obj = {};
        obj.selectedService = service;
        obj.paymentUrl = result.data.url;
        obj.invoiceExternalId = result.data['external_id'];
        setPayment(obj);
        setPaymentModal(true);
        obj = { ...loading };
        obj[service] = false;
        setLoading(obj);
      })
      .catch((err) => {
        console.log(err);
        let obj = { ...loading };
        obj[payment.selectedService] = false;
        setLoading(obj);
      });
  };

  const purchaseWithAuthCheck = (service) => {
    // No need to recreate invoice, use the existing one
    if (
      payment.selectedService === service &&
      payment.paymentUrl &&
      payment.paymentUrl.length > 0
    ) {
      let obj = { ...loading };
      obj[payment.selectedService] = true;
      setLoading(obj);
      setPaymentModal(true);
      return;
    }

    setPayment({
      selectedService: service,
      paymentUrl: null,
      invoiceId: null,
      invoiceExternalId: null,
    });
    // is logged in?
    let token = window.localStorage.getItem('authorization');
    if (token && token.length > 0) {
      let obj = { ...loading };
      obj[payment.selectedService] = true;
      setLoading(obj);
      purchase(service);
    } else {
      toggleLoginModal();
    }
  };

  const PricingItem = (props) => {
    return (
      <EuiPanel className={'pricing-item'}>
        <div className={'pricing-item-container'}>
          <h1 className={'pricing-item-title'}>{props.name}</h1>
          <div className={'pricing-item-price'}>
            <span
              style={{
                fontSize: 24,
                fontWeight: 'bold',
              }}
            >
              {props.price}
            </span>
            <br />
            {props.type === 'monthly' && '/bulan'}
            {props.description != '' && props.description}
          </div>
          <div>
            <ul style={{ textAlign: 'center', padding: 15, fontSize: 14 }}>
              {props.features.map((feature, index) => {
                if (props.boldFirstItem && index === 0) {
                  return (
                    <li key={index} style={{ fontWeight: 'bold' }}>
                      {feature}
                    </li>
                  );
                } else {
                  return <li key={index}>{feature}</li>;
                }
              })}
            </ul>
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            width: '100%',
            position: 'relative',
            bottom: 0,
          }}
        >
          {props.purchaseType && props.purchaseType.length > 0 ? (
            props.user && props.user.subscription_type == 'standard' && props.name === 'Standard' ? (
              <div style={{ height: 55, fontWeight: 'bold' }}>
                Currently you are in <br/>standard tier.
              </div>
            ) : (props.name==='Standard') ? (
              <EuiButton
                isLoading={loading[props.service]}
                isDisabled={props.isDisabled}
                style={{ marginBottom: 15 }}
                className={
                  'euiButton euiButton--primary' +
                  (props.isDisabled ? '' : ' euiButton--fill')
                }
                onClick={() => {
                  purchaseWithAuthCheck(props.service);
                }}
              >
                {payment.paymentUrl && payment.paymentUrl.length > 0
                  ? 'Check payment'
                  : (props.name==='Standard' && props.purchaseType === 'subscribe')
                  ? 'Subscribe'
                  : 'Coming soon'}
              </EuiButton>
            ) : (<div style={{height:55}}></div>)
          ) : props.isLoggedIn &&
            props.user &&
            props.user.subscription_type === 'user' ? (
            <div style={{ height: 55, fontWeight: 'bold' }}>
              Currently you are in <br/>free tier.
            </div>
          ) : props.user && props.user.subscription_type !== 'standard' ? (
            <EuiButton
              className={'euiButton euiButton--primary euiButton--fill'}
              style={{ marginBottom: 15 }}
              onClick={() => {
                toggleLoginModal();
              }}
            >
              Try it now
            </EuiButton>
          ) : (
            <div style={{ height: 55 }}></div>
          )}
        </div>
      </EuiPanel>
    );
  };

  const getUserProfile = (token) => {
    Services.isLoggedIn()
      .then((result) => {
        if (result && result.data && result.data) {
          let currentUser = result.data;
          currentUser.token = token;
          window.localStorage.setItem(
            'currentUser',
            JSON.stringify(currentUser)
          );
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
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

        if (token && token.length > 0) {
          getUserProfile(token);
        } else {
          setLoading(false);
        }
        // If tier 1
        if (
          payment.selectedService === '4b6613a8-3c64-41e4-b474-924360caa824'
        ) {
          let obj = { ...loading };
          obj[payment.selectedService] = true;
          setLoading(obj);
          purchase(payment.selectedService);
        } else {
          window.location = '/projects';
        }
      })
      .catch((err) => {
        toggleLoginModal();
        console.log(err);
        setLoading(false);
        alert('An error occured. Please try again later.');
      });
  };

  return (
    <EuiFlexGroup wrap>
      <EuiFlexItem className={'content pricing'}>
        {loginModal && (
          <Login authFunc={authenticate} toggleModal={toggleLoginModal} />
        )}
        {paymentModal && (
          <EuiOverlayMask style="background:white;">
            <div style={{ height: '100%', width: '100%', textAlign: 'center' }}>
              <iframe
                src={payment.paymentUrl}
                title={'Payment'}
                style={{ height: window.innerHeight - 60, width: '100%' }}
              />
              <br />
              <EuiButton
                fill
                onClick={() => {
                  closePayment();
                }}
              >
                Close
              </EuiButton>
            </div>
          </EuiOverlayMask>
        )}
        <h1 className={'pricing-title'}>Pricing</h1>
        <div
          style={{
            margin: '0 auto',
            textAlign: 'center',
            lineHeight: '1.4em',
          }}
        >
          <PricingItem
            isLoggedIn={props.user && props.user.id}
            user={props.user}
            name={'Free'}
            service={'free'}
            price={'$0'}
            features={[
              '1 collaborator invitation per project',
              '3 initiated projects',
              '10 scopes',
              '50 scenarios',
              '50 sessions',
              'Unlimited project by invitation',
            ]}
          />
          <PricingItem
            isLoggedIn={props.user && props.user.id}
            user={props.user}
            name={'Standard'}
            service={'4b6613a8-3c64-41e4-b474-924360caa824'}
            price={'$48 yearly'}
            type={'yearly'}
            description={'equal with $4/month'}
            features={[
              'Customer support *',
              '10 collaborator invitations per project',
              '10 initiated projects',
              '100 scopes',
              '1000 scenarios',
              '1000 sessions',
              'Unlimited project by invitation',
            ]}
            boldFirstItem={true}
            purchaseType={'subscribe'}
          />
          <PricingItem
            isLoggedIn={props.user && props.user.id}
            user={props.user}
            name={'Premium'}
            service={'4b6613a8-3c64-41e4-b474-924360caa824'}
            price={'Let\'s talk'}
            type={'yearly'}
            features={[
              'Customer support *',
              '100 collaborator invitations per project',
              '100 initiated projects',
              '10000 scopes',
              '10000 scenarios',
              '10000 sessions',
              'Unlimited project by invitation',
            ]}
            boldFirstItem={true}
            purchaseType={'subscribe'}
          />
          <PricingItem
            isLoggedIn={props.user && props.user.id}
            user={props.user}
            name={'Open Source'}
            service={'4b6613a8-3c64-41e4-b474-924360caa824'}
            price={'Free'}
            type={'yearly'}
            features={[
              'Customer support *',
              'Unlimited forever',
              'Please submit your proposal to herpiko@gmail.com',
            ]}
            boldFirstItem={true}
            purchaseType={'subscribe'}
          />
        </div>
        <br />
        <br />
        <div style={{ textAlign: 'center' }}>
          * Customer support respond time is around 12-24 hours.
          <br />
          <br />
          If you encountered any problem in payment or have question, please do
          not hesitate to contact me at herpiko@gmail.com.
        </div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
}
