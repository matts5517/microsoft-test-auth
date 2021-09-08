<template>
  <div>
    <!-- <div>You will be prompted to login at load of site.</div>
    <h5>Please logout below</h5>
    {{ isLoggedIn }} -->
    <header class="header">
      <h3>
        Example App using Azure AD (msal.js) with a NodeJS serverless backend
      </h3>

      <div class="auth-wrapper">
        <button
          class="btn btn-outline-success btn-sm"
          type="button"
          v-if="!isLoggedIn"
          @click="login"
        >
          login
        </button>
        <button
          class="btn btn-outline-success btn-sm"
          type="button"
          v-if="isLoggedIn"
          @click="logout"
        >
          logout
        </button>
      </div>
    </header>
    <div class="body">
      <div style="width:300px;">
        <p>Get new token silent method</p>

        <button
          class="btn btn-outline-success btn-sm"
          type="button"
          @click="getTokenSilent"
        >
          Get New Token
        </button>
        {{ idTokenClaims }}
      </div>
      <div class="card">
        <div class="card-title">Public API Route</div>
        <p>
          This data does not need a login or idToken to access, open to public.
        </p>
        <button
          style="width: 185px;"
          class="btn btn-outline-success btn-sm"
          type="button"
          @click="getPublicData"
        >
          Get Public Data
        </button>
        <br />
        {{ publicApiData }}
      </div>
      <div class="card">
        <div class="card-title">Private API Route</div>
        <p>
          This data needs an IdToken to be verified by a NodeJs backend before
          data is sent back to the client.
        </p>
        <button
          style="width: 185px;"
          class="btn btn-outline-success btn-sm"
          type="button"
          @click="getPrivateData"
        >
          Get Private Data
        </button>
        <br />
        <div v-if="!error">{{ privateApiData }}</div>
        <div style="color:red; font-weight:bold;" v-if="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as msal from "@azure/msal-browser";
import axios from "axios";
const msalConfig = {
  auth: {
    clientId: "043dbbb8-211c-43f2-af74-fb062d385968",
    authority:
      "https://login.microsoftonline.com/79be6dc1-d78e-4bbb-b22b-d994c0a417a7",
  },
};
// const publicClientApplication = new msal.PublicClientApplication(msalConfig);
const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
  scopes: [
    "api://043dbbb8-211c-43f2-af74-fb062d385968/Users.Read",
    "openid",
    "profile",
  ],
  forceRefresh: true,
};

// ******* this code works ***********
// const myAccount = msalInstance.getAllAccounts()[0];
// console.log(myAccount);

// const account = msalInstance.getAccountByUsername(myAccount.username);
// loginRequest.account = account;
// console.log(loginRequest);
// // this refreshes the token in sessionStorage and returns a new id token also.
// // we should check the current id token and only do a refresh when needed.
// msalInstance
//   .acquireTokenSilent(loginRequest)
//   .then((tokenRes) => {
//     console.log(tokenRes);
//   })
//   .catch((err) => {
//     console.log(err);
//     // open login popup here is silent token fails
//     this.login();
//   });

export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false,
      publicApiData: "",
      privateApiData: "",
      endpointUrl:
        "https://wlffgqpqv0.execute-api.us-east-1.amazonaws.com/dev/",
      // endpointUrl: "http://localhost:3000/",
      redirectUri: "https://lams-microsoft-node-auth.netlify.app/",
      // redirectUri: "http://localhost:8080/",
      error: "",
      username: "",
      idTokenClaims: "",
    };
  },

  methods: {
    logout() {
      msalInstance.logoutPopup();
      this.isLoggedIn = false;
    },
    login() {
      msalInstance
        .loginPopup({
          redirectUri: this.redirectUri,
        })
        .then((response) => {
          console.log(response);
          this.username = response.account.username;
        });
      // const myAccounts = msalInstance.getAllAccounts();
      this.isLoggedIn = true;
    },
    getTokenSilent() {
      try {
        const myAccount = msalInstance.getAllAccounts()[0];
        console.log(myAccount);
        const account = msalInstance.getAccountByUsername(myAccount.username);
        loginRequest.account = account;
        console.log(loginRequest);
      } catch (error) {
        this.login();
      }

      msalInstance
        .acquireTokenSilent(loginRequest)
        .then((tokenRes) => {
          console.log(tokenRes);
          this.idTokenClaims = tokenRes.idTokenClaims;
        })
        .catch((err) => {
          console.log(err);
          // open login popup here is silent token fails
          this.login();
        });
    },
    getPublicData() {
      // this.getTokenSilent();
      axios
        .get(this.endpointUrl + `public`, {
          // headers: {
          //   Authorization: idToken, // the token is a variable which holds the id jwt token
          // },
        })
        // if successfull
        .then((response) => {
          console.log(response.data.data);
          this.publicApiData = response.data.data;
        })
        // if error
        .catch((err) => {
          console.log(err.response);
        });
    },
    async getPrivateData() {
      this.error = "";
      try {
        console.log("beofre id token");
        const idToken = await this.getAccessToken();
        console.log(idToken);
        axios
          .get(this.endpointUrl + `private`, {
            headers: {
              Authorization: idToken, // the token is a variable which holds the id jwt token
            },
          })
          // if successfull
          .then((response) => {
            console.log(response.data.data);
            this.privateApiData = response.data.data;
          })
          // if error
          .catch((err) => {
            console.log(err.response);
          });
      } catch (error) {
        this.error = "You do not have access to this resource. Please login.";
      }
    },
    async getIdToken() {
      const myAccount = msalInstance.getAllAccounts()[0];
      const tenantId = myAccount.tenantId;
      const localAccountId = myAccount.localAccountId;
      const aud = myAccount.idTokenClaims.aud;
      const sessionStorageKey =
        localAccountId +
        "." +
        tenantId +
        "-login.windows.net-idtoken-" +
        aud +
        "-" +
        tenantId +
        "-";

      return JSON.parse(window.sessionStorage[sessionStorageKey]).secret;
    },
    async getAccessToken() {
      const myAccount = msalInstance.getAllAccounts()[0];
      const tenantId = myAccount.tenantId;
      const localAccountId = myAccount.localAccountId;
      const aud = myAccount.idTokenClaims.aud;
      const sessionStorageKey =
        localAccountId +
        "." +
        tenantId +
        "-login.windows.net-idtoken-" +
        aud +
        "-" +
        tenantId +
        "-";

      const accessTokenKey =
        localAccountId +
        "." +
        tenantId +
        "-login.windows.net-accesstoken-" +
        aud +
        "-" +
        tenantId +
        "-openid profile email";

      console.log(accessTokenKey, sessionStorageKey);

      // let key =
      //   "efe5cb72-f05f-411e-9a05-2c02e9b4200e.79be6dc1-d78e-4bbb-b22b-d994c0a417a7-login.windows.net-accesstoken-043dbbb8-211c-43f2-af74-fb062d385968-79be6dc1-d78e-4bbb-b22b-d994c0a417a7-openid profile email";

      console.log(window.sessionStorage[sessionStorageKey].secret);
      return JSON.parse(window.sessionStorage[sessionStorageKey]).secret;
    },
  },
  mounted() {
    // check for login at load of site
    const user = msalInstance.getAllAccounts()[0];
    if (user) {
      console.log("user is logged in");
      this.isLoggedIn = true;
      return;
    }
    console.log("user is not logged in");
    this.isLoggedIn = false;
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body,
html {
  margin: 0;
  padding: 0;
}
.header {
  background: #d8dadc;
  position: absolute;
  width: 100%;
  top: 0px;
  height: 50px;
  display: flex;
  align-items: center;
  padding: 5px;
}
.auth-wrapper {
  margin-left: auto;
}
.body {
  display: flex;
  justify-content: center;
}
.card {
  padding: 10px;
  margin: 10px;
  width: 500px;
  align-items: center;
}
.card-title {
  font-weight: bold;
}
</style>
