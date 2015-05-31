# LYCOS Bark

An exploration into the Reactive Framework [Meteor.js](http://www.meteor.com).

### Installation

To get Lycos Bark up and running on your local machine you first need to install meteor:

#####OSX/Linux#####

`curl https://install.meteor.com/ | sh`

then type `meteor` in terminal from within the project directory to boot up the local meteor server at `http://localhost:3000/`


####TODO:

- [ ] Hide "invite a friend" form unless heading clicked
  - Uses [editable text fields](http://editable-text.meteor.com/)/[github](https://github.com/jackadams/meteor-editable-text/)
- [x] Add `admin` field to `user.profile` Mongo collection
  - [ ] Restrict creation of rooms to `super users`
  - [ ] Give `super users` ability to remove rooms

####DONE:

- [x] Edit Comments
- [x] Delete Comments
- [x] Add Sass Support via `meteor-scss` [github](https://github.com/fourseven/meteor-scss)

