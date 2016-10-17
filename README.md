# loopback-auth0
Loopback middleware for auth0


# Requirements
* Auth0 Secret Key from client
* [Auth0 Management API v2](https://auth0.com/docs/api/management/v2)



# Installation

* npm
```
npm install github:k1ng440/loopback-auth0
```

* Create an async boot script
```
$ slc loopback:boot-script auth0
> What type of boot script do you want to generate? async
> create server\boot\auth0.js
```

* Edit ***server\boot\auth0.js*** and paste following code

```js
 const secretKey = 'AUTH0 SECRET KEY';
 const domain = 'YOUR DOMAIN.auth0.com';
 const password = 'SOME_RANDOM_PASSWORD_FOR_LOOPBACK_USERS';
 const managementConfig = {
      "APIKey": "Auth0 management API Key", // get it from https://auth0.com/docs/api/management/v2
      "GlobalClientSecret": // get it from https://auth0.com/docs/api/management/v2
      "token": "Auth0 management API Token" // get it from https://auth0.com/docs/api/management/v2
 }


 const jwt = require('loopback-auth0')({
     domain: domain,
     secretKey: new Buffer(secretKey, 'base64'),
     userModel: app.models.User,
     password: password,
     managementConfig: config.management,
 });

 app.middleware('initial', jwt.parseTokenFromQueryString.bind(jwt));
 app.middleware('initial', jwt.jwtCheck.bind(jwt));
 app.middleware('initial', jwt.getUserInformation.bind(jwt));
 app.middleware('initial', jwt.mapUser.bind(jwt));

```


# Issue Reporting
If you have found a bug or if you have a feature request, please report them at this repository issues section


# Auther
[***Asaduzzaman Pavel***](http://www.codegenie.co)


# License

This project is licensed under the MIT license. See the LICENSE file for more info.
