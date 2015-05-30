/*****************************************************************************/
/* Subscriptions */
/*****************************************************************************/
Meteor.subscribe('comments');
Meteor.subscribe('users');
Meteor.subscribe('rooms');

/*****************************************************************************/
/* Initial State */
/*****************************************************************************/
Session.set('activeRoom', 'main');
Session.set('showInviteConfirm', false);
Session.set('showRoomAddDialog', false);


// TODO - Create Routing for Each Room
// Iron.location.get();
// Tracker.autorun(function () {

// });

/*****************************************************************************/
/* RPC Methods */
/*****************************************************************************/
Meteor.methods({
  inviteFriend: function (email) {
    Session.set('showInviteConfirm', true);
  }
});

/*****************************************************************************/
/* Template Helpers */
/*****************************************************************************/
Template.Navigation.helpers({
  mainRoom: function () {
    return Rooms.findOne({name: 'main'});
  },

  rooms: function () {
    return Rooms.find({name: {$ne: 'main'}}, {sort: {name: 1}});
  },

  isRoomActiveClass: function () {
    return Session.equals('activeRoom', this.name) ? 'active' : '';
  },

  showInviteConfirm: function () {
    return Session.equals('showInviteConfirm', true);
  }
});

Template.Room.helpers({
  activeRoom: function () {
    return Session.get('activeRoom');
  }
});

Template.RoomAddDialog.helpers({
  showRoomAddDialog: function () {
    return Session.equals('showRoomAddDialog', true);
  }
});

Template.CommentList.helpers({
  comments: function () {
    var room = Session.get('activeRoom');

    // TODO - Create Pagination Functions
    // Comments.find({}, {sort: {timestamp: -1}, limit: 10})
    // return Comments.find({room: room}, {sort: {timestamp: 1}});

    return Comments.find({room: room}, {sort: {timestamp: 1}});
  }
});

Template.CommentItem.helpers({

  formattedTimestamp: function (timestamp) {
    return moment(timestamp).calendar();
  },
  isOwner: function () {
    var comment = this;
    var user = Meteor.users.findOne({'profile.login': comment.login});
    return !!user;
  },

  // Returns Github User Avatar
  avatarUrl: function (_user) {
    var comment = this;
    var user = Meteor.users.findOne({'profile.login': comment.login});
    if (user == undefined){
      // fallback to placekitten avatar if not available
      return 'https://placekitten.com/g/64/64';
    } else {
      return user.profile.avatarUrl;
    }

  },
});

/*****************************************************************************/
/* Template Events */
/*****************************************************************************/
Template.Navigation.events({
  // user events
  'click [data-user-logout]': function (e, tmpl) {
    Meteor.logout(function () {
      console.log('logged out');
    });
  },
  // room events
  'click [data-room-add]': function (e, tmpl) {
    Session.set('showRoomAddDialog', true);
  },

  'click [data-remove-room]': function (e, tmpl) {
    var room = this;
    Rooms.remove(room._id);
  },

  'click [data-room]': function (e, tmpl) {
    Session.set('activeRoom', this.name);
  },

  'submit form[data-invite]': function (e, tmpl) {
    e.preventDefault();

    var form = e.target;
    var email = tmpl.find('[name=email]').value;
    form.reset();

    Meteor.call('inviteFriend', email);
  }
});

Template.RoomAddDialog.events({
  'submit form': function (e, tmpl) {
    e.preventDefault();

    var form = tmpl.find('form');
    var roomName = tmpl.find('input[name=room]').value;

    form.reset();

    if (roomName.trim() == "")
      return;

    if (Rooms.findOne({name: roomName}))
      return;

    Rooms.insert({
      name: roomName
    });

    Session.set('showRoomAddDialog', false);
    Session.set('activeRoom', roomName);
  },

  'click [data-cancel]': function (e, tmpl) {
    e.preventDefault();
    var form = tmpl.find('form');
    form.reset();
    Session.set('showRoomAddDialog', false);
  }
});

Template.CommentItem.events({

  'click [data-comment-remove]': function (e, tmpl) {
    var comment = this;
    // var user = Meteor.users.findOne({'profile.login': comment.login});
    Comments.remove(comment._id);
  },

  'click [data-comment-edit]': function  (e, tmpl) {
    var comment = this;

    // Session.set('isEditable', true);
  }

});

Template.CommentAdd.events({
  'submit form': function (e, tmpl) {
    e.preventDefault();

    var form = tmpl.find('form');
    var comment = tmpl.find('[name=comment]').value;
    var user = Meteor.user();

    if (comment.trim() == "")
      return;

    Comments.insert({
      login: user.profile.login,
      timestamp: new Date,
      room: Session.get('activeRoom'),
      comment: comment
    }, function (error, result) {
      if (error) { throw error }
      // log out result?
    });

    // var scrollHeight = $('.comment-list').height();
    // $(".main-list").animate({ scrollTop: scrollHeight }, "slow");
    chatCount.set($('.comment-item').length);

    form.reset();
  }
});

// keeps track of chat height
chatCount = new ReactiveVar;

// AutoRun function for setting window position
Tracker.autorun(function() {
  Session.get('activeRoom');
  chatCount.get();
  var newHeight = $('.comment-list').height();
  $('.main-list').animate({scrollTop: newHeight}, 'slow');
});

// on template render set reactive var
Template.CommentItem.onRendered(function() {
  chatCount.set($('.comment-item').length);
});
