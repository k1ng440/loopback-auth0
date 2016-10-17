const debug = require('debug')('loopback:jwt');

class loopbackUser {
    createUser() {
        debug('creating new user');

        return new Promise((resolve, reject) => {
            const newUserData = {
                firstName: this.user.name.givenName,
                lastName: this.user.name.familyName,
                auth0Identifier: this.user.id,
                email: this.user.email,
                password: this.options.password,
            };

            if (typeof this.options.beforeCreate === 'function') {
                this.options.beforeCreate(newUserData, user);
            }

            this.options.userModel.create(newUserData)
                .then(newUser => {
                    debug('new user created [%s]', newUser.email);
                    this.loginUser()
                        .then(token => {
                            resolve(token);
                        }).catch(e => {
                            debug('error while try to login after creating user',
                             e);
                            reject(e);
                        });
                })
                .catch(e => {
                    debug('error creating user', e);
                    reject(e);
                });
        });
    }

    loginUser() {
        debug('attempting to login user [%s]', this.user.email);
        return this.options.userModel.login({
            email: this.user.email,
            password: this.options.password,
        });
    }
};

module.exports = loopbackUser;
