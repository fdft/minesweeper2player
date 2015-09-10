var myApp = angular.module('minesweeper', ["firebase"]);

myApp.controller('GameController', ['$scope', '$firebaseObject',
function($scope, $firebaseObject) {
	$scope.PLAYER1 = "1";
	$scope.PLAYER2 = "2";
	$scope.currentPlayer = $scope.PLAYER1;
    $scope.alive = "";
    $scope.side = 8;
    $scope.tileType = { 'hiddenEmpty': 0,
    					'hiddenMine': 1,
    					'revealedEmpty': 2,
    					'revealedMine1': 3,
    					'revealedMine2': 4,
    					'missedEmpty': 5};
    $scope.state = new Array();

    $scope.range = function () {
        var input = [];
        for (var i = 0; i < $scope.side; i++) input.push(i);
        return input;
    };

    $scope.reveal = function (row, col) {
        if ($scope.state[row][col].value == $scope.tileType['hiddenMine']) {
            //$scope.pwnd();
            if ( $scope.currentPlayer == $scope.PLAYER1) {
            	$scope.state[row][col].value = $scope.tileType['revealedMine1'];
            } else {
            	$scope.state[row][col].value = $scope.tileType['revealedMine2'];
            }
        } else if ($scope.state[row][col].value == $scope.tileType['hiddenEmpty']) {
            $scope.tryreveal(row, col);
        } else {
        	return; // Don't do anything.
        }
        
        if ($scope.currentPlayer == $scope.PLAYER1 ) {
        	$scope.currentPlayer = $scope.PLAYER2;
        } else {
        	$scope.currentPlayer = $scope.PLAYER1;
        }
    };

    $scope.tryreveal = function (row, col) {
        if (row < 0 || row >= $scope.side || col < 0 || col >= $scope.side) return;

        if ($scope.state[row][col].value == $scope.tileType['hiddenEmpty']) {
            $scope.state[row][col].value = 2;

            if ($scope.isz(row - 1, col - 1) && 
                $scope.isz(row - 1, col) && 
                $scope.isz(row - 1, col + 1) && 
                $scope.isz(row, col - 1) && 
                $scope.isz(row, col + 1) && 
                $scope.isz(row + 1, col - 1) && 
                $scope.isz(row + 1, col) && 
                $scope.isz(row + 1, col + 1)) {
                    $scope.tryreveal(row - 1, col - 1);
                    $scope.tryreveal(row - 1, col);
                    $scope.tryreveal(row - 1, col + 1);
                    $scope.tryreveal(row, col - 1);
                    $scope.tryreveal(row, col + 1);
                    $scope.tryreveal(row + 1, col - 1);
                    $scope.tryreveal(row + 1, col);
                    $scope.tryreveal(row + 1, col + 1);
            }
        }
    };
    
    $scope.pwnd = function () {
        for(var i = 0; i< $scope.side; i++) {
            for(var j = 0; j < $scope.side; j++) {
                if($scope.state[i][j].value == $scope.tileType['hiddenEmpty']) {
                    $scope.state[i][j].value = 2;
                } else if($scope.state[i][j].value == $scope.tileType['hiddenMine']) {
                    $scope.state[i][j].value = 3;
                }
            }
        }
        
        $scope.alive = "You're PWND!"
    };
    
    $scope.endmame = function () {
        if($scope.alive != "") {
            return;
        }
        
        var missed = false;
        for(var i = 0; i< $scope.side; i++) {
            for(var j = 0; j < $scope.side; j++) {
                if($scope.state[i][j].value == 0) {
                    missed = true;
                    $scope.state[i][j].value = 4;
                }
            }
        }
        
        if(missed) {
           $scope.pwnd();
        } else {
           $scope.alive = "Fine! You win!"
        }
    };

    
    
    $scope.isz = function (row, col) {
        if (row < 0 || row >= $scope.side || col < 0 || col >= $scope.side)
            return true;

        return $scope.state[row][col].value == $scope.tileType['hiddenEmpty'] || 
               $scope.state[row][col].value == $scope.tileType['revealedEmpty']  ||
               $scope.state[row][col].value == $scope.tileType['missedEmpty'];
    };

    $scope.printTile = function (st, row, col) {
        if ($scope.state[row][col].value == $scope.tileType['hiddenEmpty'] 
        	|| $scope.state[row][col].value == $scope.tileType['hiddenMine']
        	|| $scope.state[row][col].value == $scope.tileType['revealedMine1']
        	|| $scope.state[row][col].value == $scope.tileType['revealedMine2'])
            return "";

        var ret = 
            !$scope.isz(row - 1, col - 1) + 
            !$scope.isz(row - 1, col) + 
            !$scope.isz(row - 1, col + 1) + 
            !$scope.isz(row, col - 1) + 
            !$scope.isz(row, col + 1) + 
            !$scope.isz(row + 1, col - 1) + 
            !$scope.isz(row + 1, col) + 
            !$scope.isz(row + 1, col + 1);
        
        if(ret == 0) {
            return "";
        }
        
        return ret;
    };

    $scope.showBomb = function(st) {
    	if (st.value == $scope.tileType['revealedMine1']
    		|| st.value == $scope.tileType['revealedMine2'])
    		return true;
    	return false;
    }
    $scope.getCSSClass = function (st) {
        if (st.value == $scope.tileType['hiddenMine'] || st.value == $scope.tileType['hiddenEmpty'])
            return 'gd gd-hidden';
        else if (st.value == $scope.tileType['revealedEmpty'])
            return 'gd gd-show';
        else if (st.value == $scope.tileType['revealedMine1'])
            return 'gd gd-show-mine1';
        else if (st.value == $scope.tileType['revealedMine2'])
         	return 'gd gd-show-mine2';
        else if (st.value == $scope.tileType['missedEmpty'])
            return 'gd gd-show-missed';
    };

    $scope.initstate = function () {
        for (var i = 0; i < $scope.side; i++) {
            $scope.state[i] = new Array($scope.side);
            for (var j = 0; j < $scope.side; j++) {
                $scope.state[i][j] = {
                    value: $scope.tileType['hiddenEmpty']
                };
            }
        }

        $scope.randme();
    };
    
    $scope.reinit = function () {
        $scope.alive = "";
        for (var i = 0; i < $scope.side; i++) {
            for (var j = 0; j < $scope.side; j++) {
                $scope.state[i][j].value = $scope.tileType['hiddenEmpty'];
            }
        }

        $scope.randme();
    };
    
    $scope.randme = function () {
        var randscreated = 0;
        while (randscreated < 10) {
            var currentrow = Math.floor(Math.random() * ($scope.side));
            var currentcol = Math.floor(Math.random() * ($scope.side));

            if ($scope.state[currentrow][currentcol].value != $scope.tileType['hiddenMine']) {
                $scope.state[currentrow][currentcol].value = $scope.tileType['hiddenMine'];
                randscreated++;
            }
        }
    };
    
    $scope.debugClickAllNonBombs = function () {
        for (var i = 0; i < $scope.side; i++) {
            for (var j = 0; j < $scope.side; j++) {
                if ( $scope.state[i][j].value == $scope.tileType['hiddenEmpty'])
                	$scope.state[i][j].value = $scope.tileType['revealedEmpty']
            }
        }
    };
}]);
