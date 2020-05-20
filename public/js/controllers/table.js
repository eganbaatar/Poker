/**
 * The table controller. It keeps track of the data on the interface,
 * depending on the replies from the server.
 */
app.controller("TableController", [
  "$scope",
  "$rootScope",
  "$http",
  "$routeParams",
  "$timeout",
  "sounds",
  function ($scope, $rootScope, $http, $routeParams, $timeout, sounds) {
    var seat = null;
    $scope.table = {};
    $scope.notifications = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    $scope.showingChipsModal = false;
    $scope.actionState = "";
    $scope.table.dealerSeat = null;
    $scope.myCards = ["", ""];
    $scope.mySeat = null;
    $scope.betAmount = 0;
    $scope.actionTimeout = 0;
    $scope.actionTimer = null;
    $scope.countDownTimer = null;
    $rootScope.sittingOnTable = null;
    var showingNotification = false;

    // Existing listeners should be removed
    socket.removeAllListeners();

    // Getting the table data
    $http({
      url: "/table-data/" + $routeParams.tableId,
      method: "GET",
    }).success(function (data, status, headers, config) {
      $scope.table = data.table;
      $scope.buyInAmount = data.table.maxBuyIn;
      $scope.betAmount = data.table.bigBlind;
    });

    // Joining the socket room
    socket.emit("enterRoom", $routeParams.tableId);

    $scope.minBetAmount = function () {
      if (
        $scope.mySeat === null ||
        typeof $scope.table.seats[$scope.mySeat] === "undefined" ||
        $scope.table.seats[$scope.mySeat] === null
      )
        return 0;
      // If the pot was raised
      if ($scope.actionState === "actBettedPot") {
        var minRaise =
          $scope.table.lastRaise < $scope.table.bigBlind
            ? $scope.table.bigBlind
            : $scope.table.lastRaise;
        var proposedBet = +$scope.table.biggestBet + minRaise;
        return $scope.table.seats[$scope.mySeat].chipsInPlay < proposedBet
          ? $scope.table.seats[$scope.mySeat].chipsInPlay
          : proposedBet;
      } else {
        return $scope.table.seats[$scope.mySeat].chipsInPlay <
          $scope.table.bigBlind
          ? $scope.table.seats[$scope.mySeat].chipsInPlay
          : $scope.table.bigBlind;
      }
    };

    $scope.maxBetAmount = function () {
      if (
        $scope.mySeat === null ||
        typeof $scope.table.seats[$scope.mySeat] === "undefined" ||
        $scope.table.seats[$scope.mySeat] === null
      )
        return 0;
      return $scope.actionState === "actBettedPot"
        ? $scope.table.seats[$scope.mySeat].chipsInPlay +
            $scope.table.seats[$scope.mySeat].bet
        : $scope.table.seats[$scope.mySeat].chipsInPlay;
    };

    $scope.callAmount = function () {
      if (
        $scope.mySeat === null ||
        typeof $scope.table.seats[$scope.mySeat] === "undefined" ||
        $scope.table.seats[$scope.mySeat] == null
      )
        return 0;
      var callAmount =
        +$scope.table.biggestBet - $scope.table.seats[$scope.mySeat].bet;
      return callAmount > $scope.table.seats[$scope.mySeat].chipsInPlay
        ? $scope.table.seats[$scope.mySeat].chipsInPlay
        : callAmount;
    };

    $scope.showLeaveTableButton = function () {
      return (
        $rootScope.sittingOnTable !== null &&
        (!$rootScope.sittingIn || $scope.actionState === "waiting")
      );
    };

    $scope.showPostSmallBlindButton = function () {
      return (
        $scope.actionState === "actNotBettedPot" ||
        $scope.actionState === "actBettedPot"
      );
    };

    $scope.showPostBigBlindButton = function () {
      return (
        $scope.actionState === "actNotBettedPot" ||
        $scope.actionState === "actBettedPot"
      );
    };

    $scope.showFoldButton = function () {
      return (
        $scope.actionState === "actNotBettedPot" ||
        $scope.actionState === "actBettedPot" ||
        $scope.actionState === "actOthersAllIn"
      );
    };

    $scope.showCountdown = function () {
      return (
        $scope.actionState === "actNotBettedPot" ||
        $scope.actionState === "actBettedPot" ||
        $scope.actionState === "actOthersAllIn"
      );
    };

    $scope.showCheckButton = function () {
      return (
        $scope.actionState === "actNotBettedPot" ||
        ($scope.actionState === "actBettedPot" &&
          $scope.table.biggestBet == $scope.table.seats[$scope.mySeat].bet)
      );
    };

    $scope.showCallButton = function () {
      return (
        $scope.actionState === "actOthersAllIn" ||
        ($scope.actionState === "actBettedPot" &&
          !(
            $scope.actionState === "actBettedPot" &&
            $scope.table.biggestBet == $scope.table.seats[$scope.mySeat].bet
          ))
      );
    };

    $scope.showBetButton = function () {
      return (
        $scope.actionState === "actNotBettedPot" &&
        $scope.table.seats[$scope.mySeat].chipsInPlay &&
        $scope.table.biggestBet < $scope.table.seats[$scope.mySeat].chipsInPlay
      );
    };

    $scope.showRaiseButton = function () {
      return (
        $scope.actionState === "actBettedPot" &&
        $scope.table.seats[$scope.mySeat].chipsInPlay &&
        $scope.table.biggestBet < $scope.table.seats[$scope.mySeat].chipsInPlay
      );
    };

    $scope.showAllInButton = function () {
      return (
        ($scope.actionState === "actNotBettedPot" ||
          $scope.actionState === "actBettedPot") &&
        $scope.table.seats[$scope.mySeat].chipsInPlay &&
        $scope.table.biggestBet < $scope.table.seats[$scope.mySeat].chipsInPlay
      );
    };

    $scope.showBetRange = function () {
      return (
        ($scope.actionState === "actNotBettedPot" ||
          $scope.actionState === "actBettedPot") &&
        $scope.table.seats[$scope.mySeat].chipsInPlay &&
        $scope.table.biggestBet < $scope.table.seats[$scope.mySeat].chipsInPlay
      );
    };

    $scope.showBetInput = function () {
      return (
        ($scope.actionState === "actNotBettedPot" ||
          $scope.actionState === "actBettedPot") &&
        $scope.table.seats[$scope.mySeat].chipsInPlay &&
        $scope.table.biggestBet < $scope.table.seats[$scope.mySeat].chipsInPlay
      );
    };

    $scope.showBuyInModal = function (seat) {
      $scope.buyInModalVisible = true;
      selectedSeat = seat;
    };

    $scope.potText = function () {
      if (
        typeof $scope.table.pot !== "undefined" &&
        $scope.table.pot[0].amount
      ) {
        var potText = "Pot: " + $scope.table.pot[0].amount;

        var potCount = $scope.table.pot.length;
        if (potCount > 1) {
          for (var i = 1; i < potCount; i++) {
            potText += " - Sidepot: " + $scope.table.pot[i].amount;
          }
        }
        return potText;
      }
    };

    $scope.getCardClass = function (seat, card) {
      if ($scope.mySeat === seat) {
        return $scope.myCards[card];
      } else if (
        typeof $scope.table.seats !== "undefined" &&
        typeof $scope.table.seats[seat] !== "undefined" &&
        $scope.table.seats[seat] &&
        typeof $scope.table.seats[seat].cards !== "undefined" &&
        typeof $scope.table.seats[seat].cards[card] !== "undefined"
      ) {
        return "card_" + $scope.table.seats[seat].cards[card];
      } else {
        return "card_back";
      }
    };

    $scope.seatOccupied = function (seat) {
      return (
        !$rootScope.sittingOnTable ||
        ($scope.table.seats !== "undefined" &&
          typeof $scope.table.seats[seat] !== "undefined" &&
          $scope.table.seats[seat] &&
          $scope.table.seats[seat].name)
      );
    };

    // Leaving the socket room
    $scope.leaveRoom = function () {
      socket.emit("leaveRoom");
    };

    // A request to sit on a specific seat on the table
    $scope.sitOnTheTable = function () {
      socket.emit(
        "sitOnTheTable",
        {
          seat: selectedSeat,
          tableId: $routeParams.tableId,
          chips: $scope.buyInAmount,
        },
        function (response) {
          if (response.success) {
            $scope.buyInModalVisible = false;
            $rootScope.sittingOnTable = $routeParams.tableId;
            $rootScope.sittingIn = true;
            $scope.buyInError = null;
            $scope.mySeat = selectedSeat;
            $scope.actionState = "waiting";
            $scope.$digest();
          } else {
            if (response.error) {
              $scope.buyInError = response.error;
              $scope.$digest();
            }
          }
        }
      );
    };

    // Sit in the game
    $scope.sitIn = function () {
      socket.emit("sitIn", function (response) {
        if (response.success) {
          $rootScope.sittingIn = true;
          $rootScope.$digest();
        }
      });
    };

    // Leave the table (not the room)
    $scope.leaveTable = function () {
      socket.emit("leaveTable", function (response) {
        if (response.success) {
          $rootScope.sittingOnTable = null;
          $rootScope.totalChips = response.totalChips;
          $rootScope.sittingIn = false;
          $scope.actionState = "";
          $scope.clearActionReminder();
          $rootScope.$digest();
          $scope.$digest();
        }
      });
    };

    // Post a blind (or not)
    $scope.postBlind = function (posted) {
      socket.emit("postBlind", posted, function (response) {
        if (response.success && !posted) {
          $rootScope.sittingIn = false;
        } else {
          sounds.playBetSound();
        }
        $scope.actionState = "";
        $scope.clearActionReminder();
        $scope.$digest();
      });
    };

    $scope.check = function () {
      socket.emit("check", function (response) {
        if (response.success) {
          sounds.playCheckSound();
          $scope.actionState = "";
          $scope.clearActionReminder();
          $scope.$digest();
        }
      });
    };

    $scope.fold = function () {
      socket.emit("fold", function (response) {
        if (response.success) {
          sounds.playFoldSound();
          $scope.actionState = "";
          $scope.clearActionReminder();
          $scope.$digest();
        }
      });
    };

    $scope.call = function () {
      socket.emit("call", function (response) {
        if (response.success) {
          sounds.playCallSound();
          $scope.actionState = "";
          $scope.clearActionReminder();
          $scope.$digest();
        }
      });
    };

    $scope.bet = function () {
      socket.emit("bet", $scope.betAmount, function (response) {
        if (response.success) {
          sounds.playBetSound();
          $scope.actionState = "";
          $scope.clearActionReminder();
          $scope.$digest();
        }
      });
    };

    $scope.raise = function () {
      socket.emit("raise", $scope.betAmount, function (response) {
        if (response.success) {
          sounds.playRaiseSound();
          $scope.actionState = "";
          $scope.clearActionReminder();
          $scope.$digest();
        }
      });
    };

    $scope.allIn = function () {
      if (window.confirm("Andaa neeree yu?!")) {
        socket.emit("allIn", function (response) {
          if (response.success) {
            sounds.playRaiseSound();
            $scope.actionState = "";
            $scope.clearActionReminder();
            $scope.$digest();
          }
        });
      }
    };

    $scope.setActionReminder = function () {
      if ($scope.table.minActionTimeout) {
        if ($scope.countDownTimer !== null) {
          clearInterval($scope.countDownTimer);
        }
        if ($scope.actionTimer !== null) {
          clearTimeout($scope.actionTimer);
          $scope.actionTimeout = 0;
          $scope.actionTimer = null;
        }
        $scope.countDown = $scope.table.maxActionTimeout / 1000;
        $scope.countDownTimer = setInterval($scope.intervalAction, 1000);

        $scope.actionTimeout = $scope.table.minActionTimeout;
        $scope.actionTimer = setTimeout(
          $scope.remindAction,
          $scope.actionTimeout
        );
      }
    };

    $scope.intervalAction = function () {
      if ($scope.countDown > 0) {
        $scope.countDown--;
        $scope.$apply();
      } else {
        $scope.fold();
      }
    };

    $scope.clearActionReminder = function () {
      if ($scope.actionTimer !== null) {
        clearTimeout($scope.actionTimer);
        $scope.actionTimeout = 0;
        $scope.actionTimer = null;
      }
      if ($scope.countDownTimer !== null) {
        clearInterval($scope.countDownTimer);
        $scope.countDown = 20;
        $scope.countDownTimer = null;
      }
    };

    $scope.remindAction = function () {
      sounds.playActionReminderSound();
    };

    // When the table data have changed
    socket.on("table-data", function (data) {
      $scope.table = data;
      switch (data.log.action) {
        case "fold":
          sounds.playFoldSound();
          break;
        case "check":
          sounds.playCheckSound();
          break;
        case "call":
          sounds.playCallSound();
          break;
        case "bet":
          sounds.playBetSound();
          break;
        case "raise":
          sounds.playRaiseSound();
          break;
      }
      if (data.log.message) {
        var messageBox = document.querySelector("#logMessages");
        var messageElement = angular.element(
          '<p class="log-message">' + data.log.message + "</p>"
        );
        angular.element(messageBox).append(messageElement);
        messageBox.scrollTop = messageBox.scrollHeight;
        if (data.log.notification && data.log.seat !== "") {
          if (!$scope.notifications[data.log.seat].message) {
            $scope.notifications[data.log.seat].message = data.log.notification;
            $scope.notifications[data.log.seat].timeout = $timeout(function () {
              $scope.notifications[data.log.seat].message = "";
            }, 1000);
          } else {
            $timeout.cancel($scope.notifications[data.log.seat].timeout);
            $scope.notifications[data.log.seat].message = data.log.notification;
            $scope.notifications[data.log.seat].timeout = $timeout(function () {
              $scope.notifications[data.log.seat].message = "";
            }, 1000);
          }
        }
      }
      $scope.$digest();
    });

    // When the game has stopped
    socket.on("gameStopped", function (data) {
      $scope.table = data;
      $scope.actionState = "waiting";
      $scope.clearActionReminder();
      $scope.$digest();
    });

    // When the player is asked to place the small blind
    socket.on("postSmallBlind", function (data) {
      $scope.actionState = "postSmallBlind";
      $scope.postBlind(true);
      $scope.$digest();
    });

    // When the player is asked to place the big blind
    socket.on("postBigBlind", function (data) {
      $scope.actionState = "postBigBlind";
      $scope.postBlind(true);
      $scope.$digest();
    });

    // When the player is dealt cards
    socket.on("dealingCards", function (cards) {
      $scope.myCards[0] = "card_" + cards[0];
      $scope.myCards[1] = "card_" + cards[1];
      $scope.$digest();
    });

    // When the user is asked to act and the pot was betted
    socket.on("actBettedPot", function () {
      $scope.actionState = "actBettedPot";

      var minRaise =
        $scope.table.lastRaise < $scope.table.bigBlind
          ? $scope.table.bigBlind
          : $scope.table.lastRaise;
      var proposedBet = +$scope.table.biggestBet + minRaise;
      $scope.betAmount =
        $scope.table.seats[$scope.mySeat].chipsInPlay < proposedBet
          ? $scope.table.seats[$scope.mySeat].chipsInPlay
          : proposedBet;
      $scope.setActionReminder();
      $scope.$digest();
    });

    // When the user is asked to act and the pot was not betted
    socket.on("actNotBettedPot", function () {
      $scope.actionState = "actNotBettedPot";

      $scope.betAmount =
        $scope.table.seats[$scope.mySeat].chipsInPlay < $scope.table.bigBlind
          ? $scope.table.seats[$scope.mySeat].chipsInPlay
          : $scope.table.bigBlind;
      $scope.setActionReminder();
      $scope.$digest();
    });

    // When the user is asked to call an all in
    socket.on("actOthersAllIn", function () {
      $scope.actionState = "actOthersAllIn";

      $scope.setActionReminder();
      $scope.$digest();
    });
  },
]);
