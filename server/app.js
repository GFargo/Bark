/*****************************************************************************/
/* Publish Functions */
/*****************************************************************************/
Meteor.publish('comments', function () {
  return Comments.find({}, {sort: {timestamp: 1}})
});

Meteor.publish('users', function () {
  // return Meteor.users.find({}, {fields: {profile: 1}});
  if (this.userId) {
    return Meteor.users.find({_id: 'GpL3Mr2Ak4bYepmnN'},
                             {fields: {'admin': true}}
                            );
  } else {
    this.ready();
  }
});

Meteor.publish('rooms', function () {
  return Rooms.find({}, {sort: {name: 1}});
});

/*****************************************************************************/
/* RPC Methods */
/*****************************************************************************/
Meteor.methods({
  inviteFriend: function (email) {
    var user = Meteor.user();
    var url = Meteor.absoluteUrl() || "http://localhost:3000"

    if (!user) {
      throw new Meteor.Error("Not authorized to invite friends!");
    }

    Email.send({
      to: email,
      from: user.profile.email,
      subject: "Join Flack!",
      html: "I'd like to invite you to <a href='" + url + "' target='_blank'>Lycos Bark, get your Bark on!</a>"
    });
  }
});

/*****************************************************************************/
/* Accounts */
/*****************************************************************************/
Accounts.onCreateUser(function (options, user) {
  options.profile.login = user.services.github.username;
  options.profile.email = user.services.github.email;

  var accessToken = user.services.github.accessToken;
  var username = options.profile.login;

  // add header Authorization: token <token>
  var apiOptions = {
    headers: {
      'Authorization': 'token ' + accessToken,
      'User-Agent': 'eventedmind-devel'
    }
  };

  var url = 'https://api.github.com/users/' + username;
  var response = HTTP.get(url, apiOptions);

  options.profile.avatarUrl = response.data.avatar_url;
  options.profile.githubId = response.data.id;
  options.profile.url = response.data.html_url;

  user.profile = options.profile;
  return user;
});

/*****************************************************************************/
/* Security */
/*****************************************************************************/
Comments.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc) {
    return false;
  },

  remove: function (userId, doc) {
    return !!userId;
  }
});

Rooms.allow({
  insert: function (userId, doc) {
    return !!userId;
  },

  update: function (userId, doc) {
    return false;
  },

  remove: function (userId, doc) {
    var user = Meteor.user();
    return !!user.profile.admin;
  }
});

/*****************************************************************************/
/* Database Seeding */
/*****************************************************************************/
if (!Rooms.findOne({name: 'main'})) {
  Rooms.insert({name: 'main'});
}

// Admin Seeds
Meteor.users.update({'profile.login': 'GFargo'},{ $set: { "profile.admin": 'true' }});

