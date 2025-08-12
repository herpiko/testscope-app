import axios from 'axios';
import Firebase from './Firebase';
import Config from './Config';

export default {
  isLoggedIn: () => {
    return new Promise((resolve, reject) => {
      axios
        .get(Config.backendUrl + '/api/user', {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  authenticate: () => {
    return new Promise((resolve, reject) => {
      var token = '';
      Firebase.auth
        .signInWithPopup(Firebase.provider)
        .then((result) => {
          let idToken = Firebase.auth.currentUser.getIdToken(true);
          console.log(idToken);
          return idToken;
        })
        .then((result) => {
          token = result;
          return axios.get(Config.backendUrl + '/api/user', {
            headers: {
              Authorization: token,
            },
          });
        })
        .then((result) => {
          result.data.token = token;
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getInvitation: (code) => {
    return new Promise((resolve, reject) => {
      axios
        .get(Config.backendUrl + '/api/invite/' + code, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  acceptInvitation: (code) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/invite/' + code, null, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getTesters: (projectId) => {
    return new Promise((resolve, reject) => {
      axios
        .get(Config.backendUrl + '/api/collaborators/' + projectId, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  revokeTester: (projectId, userId) => {
    return new Promise((resolve, reject) => {
      axios
        .put(
          Config.backendUrl + '/api/revoke/' + projectId + '/' + userId,
          null,
          {
            headers: {
              Authorization: window.localStorage.getItem('authorization'),
            },
          }
        )
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getSessions: (projectId) => {
    return new Promise((resolve, reject) => {
      axios
        .get(Config.backendUrl + '/api/sessions?projectId=' + projectId + '&count=1000', {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  createTest: (payload) => {
    return new Promise((resolve, reject) => {
      axios
        .post(Config.backendUrl + '/api/test', payload, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  deleteTest: (id) => {
    return new Promise((resolve, reject) => {
      axios
        .delete(Config.backendUrl + '/api/test/' + id, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updateTest: (payload) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/test/' + payload.id, payload, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updateSession: (payload) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/session/' + payload.id, payload, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  resetSession: (id) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/reset-session/' + id, null, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updateProject: (payload) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/project/' + payload.id, payload, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  updateScope: (payload) => {
    return new Promise((resolve, reject) => {
      axios
        .put(Config.backendUrl + '/api/scope/' + payload.id, payload, {
          headers: {
            Authorization: window.localStorage.getItem('authorization'),
          },
        })
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
