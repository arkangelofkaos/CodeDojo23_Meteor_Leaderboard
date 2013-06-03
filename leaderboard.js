// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  Template.leaderboard.players = function () {
        var sortType = Session.get('sort-type');
        if (sortType === 'name') {
            return Players.find({}, {sort: {name: 1, score: -1}});
        } else {
            return Players.find({}, {sort: {score: -1, name: 1}});
        }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.add': function () {
            var _name = document.getElementById("scientistName").value;
            var _score = document.getElementById("scientistScore").value;
            _score = Number(_score);

            if (!_name || _name === "") {
                alert("Please enter a name!");
                return;
            }

            if (!_score) {
                alert("Not a score, plese enter a number!");
                return;
            }
            Players.insert({name: _name, score: _score});
        },
    'click input.inc': function () {
          Players.update(Session.get("selected_player"), {$inc: {score: 5}});
        },
    'click input.remove': function () {
          Players.remove(Session.get("selected_player"));
        },
    'click input.sort': function () {
        var sortType = Session.get('sort-type');
        if (sortType === 'name') {
            Session.set("sort-type", 'score');
        } else {
            Session.set("sort-type", 'name');
        }
    },
    'click input.randomScore': function () {
        var playersCursor =
            Players.find({})
                .forEach(function(player) {
                    var randomScore = Math.floor(Random.fraction()*10)*5
                    Players.update(player._id,
                                    {$set: {score: randomScore}});
                    }
                );
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      createPlayers();
    }
  });
}

function createPlayers() {
    var names = ["Ada Lovelace",
                       "Grace Hopper",
                       "Marie Curie",
                       "Carl Friedrich Gauss",
                       "Nikola Tesla",
                       "Claude Shannon"];
    for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i],
                    score: Math.floor(Random.fraction()*10)*5}
                    );
}
