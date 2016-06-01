angular.module('myApp').factory('AuthService',
  ['$q', '$timeout', '$http',
  function ($q, $timeout, $http) {
    console.log('User: ' + localStorage.getItem('user'));
    // create user variable
    var user = localStorage.getItem('user');
    //localStorage.setItem('user', null);

    // return available functions for use in the controllers
    return ({
      isLoggedIn: isLoggedIn,
      getUserStatus: getUserStatus,
      getUsers: getUsers,
      getUser: getUser,
      login: login,
      logout: logout,
      register: register,
      edit: edit,
      reset: reset,
      deleteUser: deleteUser
    });

    function isLoggedIn() {
      console.log(localStorage.getItem('user'));
      var test = localStorage.getItem('user');
      if(test) {
        return true;
      } else {
        console.log('pues no entra');
        return false;
      }
    }

    function getUserStatus() {
      return $http.get('/api/status')
      // handle success
      .success(function (data) {
        //console.log(data);
        if(data.status){
          user = true;
        } else {
          user = false;
        }
        localStorage.setItem('user', user);
      })
      // handle error
      .error(function (data) {
        user = false;
        localStorage.setItem('user', user);
      });
    }

    function getUsers() {
      return $http.get('/api/users')
      // handle success
      .success(function (data) {
        //console.log(data);
        if(data.status){
          user = true;
        } else {
          user = false;
        }
        localStorage.setItem('user', user);
      })
      // handle error
      .error(function (data) {
        user = false;
        localStorage.setItem('user', user);
      });
    }

    function login(username, password) {

      // create a new instance of deferred
      var deferred = $q.defer();
 
      // send a post request to the server
      $http.post('/api/login',
        {username: username, password: password})
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true;
            localStorage.setItem('user', user);
            deferred.resolve();
          } else {
            user = false;
            localStorage.setItem('user', user);
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          user = false;
          localStorage.setItem('user', user);
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function logout() {

      // create a new instance of deferred
      var deferred = $q.defer();

      // send a get request to the server
      $http.get('/api/logout')
        // handle success
        .success(function (data) {
          user = false;
          localStorage.setItem('user', user);
          deferred.resolve();
        })
        // handle error
        .error(function (data) {
          user = false;
          localStorage.setItem('user', user);
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function deleteUser(username) {

      // create a new instance of deferred
      var deferred = $q.defer();
      //console.log(username);

      // send a post request to the server
      $http.delete('/api/delete/' + username)
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            user = true;
            localStorage.setItem('user', user);
            deferred.resolve();
          } else {
            user = false;
            localStorage.setItem('user', user);
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          user = false;
          localStorage.setItem('user', user);
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }


    function register(form) {

      // create a new instance of deferred
      var deferred = $q.defer();
      console.log(form);

      // send a post request to the server
      $http.post('/api/register',
        form)
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function edit(form) {

      // create a new instance of deferred
      var deferred = $q.defer();
      //console.log(form);

      // send a post request to the server
      $http.post('/api/edit',
        form)
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function reset(form) {

      // create a new instance of deferred
      var deferred = $q.defer();
      //console.log(form);

      // send a post request to the server
      $http.post('/api/reset',
        form)
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }

    function getUser(username) {

      // create a new instance of deferred
      var deferred = $q.defer();
      console.log(username);

      // send a post request to the server
      return $http.get('/api/users/' + username)
        // handle success
        .success(function (data, status) {
          if(status === 200 && data.status){
            deferred.resolve();
          } else {
            deferred.reject();
          }
        })
        // handle error
        .error(function (data) {
          deferred.reject();
        });

      // return promise object
      return deferred.promise;

    }


}]);