angular.module('myApp').controller('loginController', ['$scope', '$location', 'AuthService',
    function($scope, $location, AuthService) {

        $scope.login = function() {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call login from service
            AuthService.login($scope.loginForm.username, $scope.loginForm.password)
                // handle success
                .then(function() {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.loginForm = {};
                })
                // handle error
                .catch(function() {
                    $scope.error = true;
                    $scope.errorMessage = "Invalid username and/or password";
                    $scope.disabled = false;
                    $scope.loginForm = {};
                });

        };

    }
]);

/*angular.module('myApp').controller('logoutController', ['$scope', '$location', 'AuthService',
    function($scope, $location, AuthService) {

        $scope.logout = function() {

            // call logout from service
            AuthService.logout()
                .then(function() {
                    $location.path('/login');
                });

        };

    }
]);*/

angular.module('myApp').controller('deleteUserController', ['$scope', '$location', 'AuthService',
    function($scope, $location, AuthService) {

        $scope.deleteUser = function() {

            // call logout from service
            AuthService.deleteUser()
                .then(function() {
                    $location.path('/');
                });

        };

    }
]);

angular.module('myApp').controller('homeController', ['$scope', '$location', 'AuthService',
    function($scope, $location, AuthService) {

        AuthService.getUsers()
            .then(function(response) {
                console.log(response.data.status);
                if (!response.data.status) $location.path('/login');
                console.log(response.data.users);
                $scope.users = response.data.users;
            });

        $scope.newUser = function() {
            $location.path('/register');
        };

        $scope.editUser = function(username) {
            $location.path('/edit/' + username);
        };

        $scope.resetPassword = function(username) {
            $location.path('/reset/' + username);
        };


        $scope.logout = function() {

            // call logout from service
            AuthService.logout()
                .then(function() {
                    $location.path('/login');
                });

        };

        $scope.deleteUser = function(username) {
            console.log(username);

            // call logout from service
            AuthService.deleteUser(username).then(function() {
                AuthService.getUsers().then(function(response) {
                    console.log(response.data.users);
                    $scope.users = response.data.users;
                });
            });

        };

    }
]);

angular.module('myApp').controller('registerController', ['$scope', '$location', 'AuthService',
    function($scope, $location, AuthService) {

        $scope.register = function() {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call register from service
            AuthService.register($scope.registerForm)
                // handle success
                .then(function() {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.registerForm = {};
                })
                // handle error
                .catch(function() {
                    $scope.error = true;
                    $scope.errorMessage = "Something went wrong!";
                    $scope.disabled = false;
                    $scope.registerForm = {};
                });

        };

    }
]);

angular.module('myApp').controller('editController', ['$scope', '$route', '$routeParams', '$location', 'AuthService',
    function($scope, $route, $routeParams, $location, AuthService) {
        AuthService.getUser($routeParams.username)
            // handle success
            .then(function(response) {
                console.log(response.data);
                $scope.registerForm = response.data.user;
            })
            // handle error
            .catch(function() {
                $scope.error = true;
                $scope.errorMessage = "Something went wrong!";
                $scope.disabled = false;
            });

        $scope.edit = function() {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call register from service

            AuthService.edit($scope.registerForm)
                // handle success
                .then(function() {
                    $location.path('/');
                    $scope.disabled = false;
                    $scope.registerForm = {};
                })
                // handle error
                .catch(function() {
                    $scope.error = true;
                    $scope.errorMessage = "Something went wrong!";
                    $scope.disabled = false;
                    //$scope.registerForm = {};
                });
        };

    }
]);

angular.module('myApp').controller('resetController', ['$scope', '$route', '$routeParams', '$location', 'AuthService',
    function($scope, $route, $routeParams, $location, AuthService) {
        $scope.resetForm = {};
        $scope.resetForm.username = $routeParams.username;
        $scope.reset = function() {

            // initial values
            $scope.error = false;
            $scope.disabled = true;

            // call register from service
            if ($scope.resetForm.password === $scope.resetForm.repeatPassword) {
                delete $scope.resetForm.repeatPassword;
                AuthService.reset($scope.resetForm)
                    // handle success
                    .then(function() {
                        $location.path('/');
                        $scope.disabled = false;
                        $scope.resetForm = {};
                    })
                    // handle error
                    .catch(function() {
                        console.log();
                        $scope.error = true;
                        $scope.errorMessage = "Something went wrong!";
                        $scope.disabled = false;
                        //$scope.registerForm = {};
                    });
            }else{
              console.log('No coinciden');
            }

        };

    }
]);