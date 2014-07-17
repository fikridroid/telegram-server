var passport = require('passport');
require('./passport')(passport);
var User = require('./models/user');
var emberObjWrapper = require('./emberObjWrapper');

exports.register = function(req, res){
  //console.log(req.body.user);
  var newUser = new User({
    username: req.body.user.username,
    name: req.body.user.name,
    eamil: req.body.user.email,
    password: req.body.user.password
  });

  newUser.save(function(err, user){
    // console.log(user);
    req.login(user, function(err) { // Set cookie here 
      if (err) { return res.send(400); }
      // var emberUser = {
      //   'id':       user.username, // _id
      //   'username': user.username,
      //   'name':     user.name,
      //   'email':    user.email
      // };   
      return res.send(200, {user: [emberObjWrapper.emberUser(user)]});
    });
  });
};

exports.loginOrGetFolloweesOrFollowers = function(req, res, next){
  var username      = req.query.username,
      password      = req.query.password,
      operation     = req.query.operation,
      follower      = req.query.follower,
      followee      = req.query.followee;
      // followedByCurrentUser = req.query.followedByCurrentUser,
      // followingCurrentUser = req.query.followedByCurrentUser;

  if(operation == 'login'){
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.send(400); }
      if (!user) { return res.send(400); }
      req.login(user, function(err) { // Set cookie here 
        if (err) { return res.send(400); }
        // var emberUser = {
        //   // 'id':       user.username, // _id
        //   'username': user.username,
        //   'name':     user.name,
        //   'email':    user.email
        // };
        return res.send(200, {user: [emberObjWrapper.emberUser(user)]});
      });
    })(req, res, next);

  // ======= GET Following users (users that current URL user follows)=======

  } else if(follower){
    var emberFollowees = [];
    // console.log("follower : "+follower);
    var currentUserid = follower;
    User.find({'followers': currentUserid}, function(err, followees){
      // console.log("followees : "+followees);
      if(followees){
        followees.forEach(
          // Search in array of followers or followees for eachUser 
          // for currentUserid => followingCurrentUser or followedByCurrentUser
          function(user){
            // var eachUser = {
            //   'id':        user.username,
            //   'username':  user.username,
            //   'followingCurrentUser': true,
            //   'followedByCurrentUser': true
            // }
            emberFollowees.push(emberObjWrapper.emberUser(user, currentUserid));
          }
        )
        return res.send(200, {users: emberFollowees});
      } else {
        return res.send(404);
      };
    });
  }
  // ======= GET Followers (users that follows current URL user)=============
  // Find 
  else if(followee){
    var emberFollowers = [];
    // console.log("followee : "+followee);
    var currentUserid = followee;
    User.find({'followees': currentUserid}, function(err, followers){
      // console.log("followers : "+followers);
      if(followers){
        followers.forEach(
          function(user){
            emberFollowers.push(emberObjWrapper.emberUser(user, currentUserid));
          }
        )
        return res.send(200, {users: emberFollowers});
      } else {
        return res.send(404);
      };
    });
  }
};

exports.getUser = function(req, res){
  var userId = req.params.user_id;
  User.findOne({'username': userId}, function(err, user){
    // console.log('====== user =======');
    // console.log(user);

    if(user != null) {
      // var emberUser = {
      //   'id':       user.username, // _id
      //   'username': user.username,
      //   'name':     user.name,
      //   'email':    user.email
      // };   
      return res.send(200, {user: emberObjWrapper.emberUser(user)});
    } else {
      console.log('====== NOP =======');
      return res.send(404);
    }
  });
};

exports.logout = function(req, res){
  req.logout();
  res.send(200);
};