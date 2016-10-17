const debug = require('debug')('loopback:jwt');
const expressJwt = require('express-jwt');
const Promise = require('bluebird');
const loopbackUser = require('./loopbackUser');
const extend = require('xtend');
const Profile = require('./profile');
const assert = require('assert');
const ManagementClient = require('auth0').ManagementClient;

class LoopbackJwt extends loopbackUser {

    constructor(options) {
        super(options);

        assert(options, 'Options must be defined');
        assert(options.secretKey, 'Options.secretKey must be defined');
        assert(options.password, 'Options.password must be defined');

        this.options = {
            secretKey: '',
            credentialsRequired: false,
            algorithms: ['RS256', 'HS256'],
            beforeCreate: null,
        };

        this.userMap = {};

        this.options = extend(this.options, options);

        this.jwtCheck = expressJwt({
            algorithms: this.options.algorithms,
            secret: this.options.secretKey,
            credentialsRequired: false,
            getToken: options.getToken,
        });

        this.management = new ManagementClient({
            token: this.options.managementConfig.token,
            domain: this.options.domain,
        });
    }

    parseTokenFromQueryString(req, res, next) {
        const accessToken = req.query.access_token;
        if (accessToken) {
            delete req.query.access_token;
            req.headers.authorization = 'Bearer ' + accessToken;
            debug(
                'parseTokenFromQueryString',
                'found token in query string. attached to headers'
            );
        }

        next();
    };

    getUserInformation(req, res, next) {
        if (!req.user) {
            debug('no current user context found.');
            return next();
        }

        let that = this;
        this.management.users.get({
            id: req.user.sub,
        }, function (err, user) {
            req.user = new Profile(user, that.options.userModel);
            next();
        });
    }

    mapUser(req, res, next) {
        if (!req.user) {
            debug('no current user context found.');
            return next();
        }

        this.user = req.user;

        debug('attempting to map user [%s]', this.user.email);

        const token = this.userMap[this.user.email];

        if (!token) {
            this.loginUser()
                .then(token => {
                    debug('mapped existing user [%s]', token.id);
                    this.userMap[this.user.email] = token;
                    req.accessToken = token;
                    next();
                })
                .catch((e) => {
                    debug('login error', e);

                    this.createUser(req)
                        .then(token => {
                            this.userMap[this.user.email] = token;
                            req.accessToken = token;
                            next();
                        })
                        .catch(e => {
                            debug('Error while creating error', e);
                            next();
                        });
                });
        } else {
            debug('found existing token [%s]', token.id);
            req.accessToken = token;
            next();
        }
    }

}

module.exports = (options) => {
    return new LoopbackJwt(options);
};