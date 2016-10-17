class Profile {
    constructor(data, userModel) {
        this.data = data;
        this.userModel = userModel;

        if (data.identities) {
            this.provider = data.identities[0].provider;
        }

        this.displayName = data.name;
        this.id = this.getId();
        this.email = this.getEmail();
        this.isEmailVerified = this.isEmailVerified();
        this.getDescription();

        this.name = {
            familyName: data.family_name,
            givenName: data.given_name,
        };

        if (data.emails) {
            this.emails = data.emails.map(email => ({
                value: email,
            }));
        } else if (data.email) {
            this.emails = [{
                value: data.email,
            }];
        }


        //copy these fields
        let copy = ['picture',
            'locale',
            'nickname',
            'gender',
            'identities',
        ];

        copy.filter(k => k in data).forEach(k => {
            this[k] = data[k];
        });
    }

    getId() {
        return typeof this.data.user_id !== undefined ?
            this.data.user_id :
            this.data.sub;
    }

    getUserName() {
        return new Promise((resolve, reject) => {
            let username = '';
            let available = false;

            if (this.data.username) {
                username = this.data.username;
            } else if (this.data.screen_name) {
                username = this.data.username;
            }

            if (_.empty(useername)) {
                username = this.data.name.replace(' ', '');
            }

            while (available === false) {
                this.userModel.count({
                    username: username,
                }, function(err, count) {
                    if (err) {
                        debug('Error while counting user', err);
                        return reject(false);
                    }

                    available = count > 0;

                    if (available === true) {
                        resolve(username);
                    } else {
                        username = username + _.random(0, 5000);
                    }
                });
            }
        });
    }

    isEmailVerified() {
        return (typeof this.data.email_verified !== undefined) &&
            this.data.email_verified === true;
    }

    getEmail() {
        let id = null;
        if (this.data.email) {
            id = this.data.email;
        } else {
            const usersplit = this.getId(user).split('|');
            id = usersplit[1] + '@' + 'change_this_email.com';
        }

        return id;
    }

    getDescription() {
        let description;

        if (this.headline) {
            description = this.headline;
        } else if (this.description) {
            description = this.description;
        } else if (this.bio) {
            description = this.bio;
        } else if (this.about) {
            description = this.data.about;
        }

        this.description = description;

        return description;
    }
}

module.exports = Profile;
