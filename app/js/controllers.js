//'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
        controller('MyCtrl1', function($rootScope, $scope, $q, $timeout) {

            var name
            var i = 1
            $scope.laduj = function() {

                //  alert("dziala klick")
                // $scope.name = name;
                var defer = $q.defer();
                alert("timeout")
                //  defer.resolve(function() {
                alert("resolve")
                i = i + 1
                $scope.db.info(function(err, info) {
                    alert("start info")
                    i = i + 1
                    $scope.name = "drugie"
                    $scope.text = "To jest text"
                    $scope.$apply();
                    alert("i " + i)
                    defer.resolve(function() {
                        alert("w resolve")
                    });
                })
                alert("promise " + defer.promise)
                var protokol = $rootScope.protokol;
                //$scope.i = defer.promise
                //   });

                // $timeout(function() {

                // }, 200);

//return defer.promise 


            }
            $scope.name = "trzecie"
            $scope.$watch('pierwszy', function() {
                //alert("zmiana "+ $scope.pierwszy)
            })
            //alert(name)
        })
        .controller('MyCtrl2', [function() {

            }])
        .controller('ProtokolyCtrl', ProtokolyCtrl)
        .controller('ProtokolNowyCtrl', ProtokolNowyCtrl)
        .controller('ProtokolEdytujCtrl', ProtokolEdytujCtrl)
        .controller('PodstawaPrawnaCtrl', PodstawaPrawnaCtrl)
        .controller('RodzajKontroliCtrl', RodzajKontroliCtrl)
        .controller('ObjektyListaCtrl', ObjektyListaCtrl)
        .controller('KontrolujacyListaCtrl', KontrolujacyListaCtrl)
        .controller('KontrolujacyNowyCtrl', KontrolujacyNowyCtrl)
        ;


function ProtokolDodawanieKontrolowanychCtrl($scope, $rootScope, $db, $timeout, $route, $modal) {
    
    $scope.zmiana_inne_osoby_wymagany = function(){
       alert('dziala' + $rootScope.wybrany.wymagany)
        if($rootScope.wybrany.wymagany=='true'){
             alert('dziala' + $rootScope.wybrany.wymagany)
            $rootScope.wybrany.notatka='';
           // $rootScope.wybrany.wymagany=false
            $rootScope.wybrany.valid=false;
            $scope.inne_osoby_required=true
           // $scope.$apply()
        }
         if($rootScope.wybrany.wymagany=='false'){
               alert('dziala' + $rootScope.wybrany.wymagany)
          //     $rootScope.wybrany.wymagany=true
            $rootScope.wybrany.notatka='';
            $rootScope.wybrany.valid=true;
            $scope.inne_osoby_required=false
            //$scope.$apply()
        }
    }
    
    function map(doc) {
        if (doc.type == 'osoba') {
            emit(doc, null);
        }
    }
    $timeout(function() {

        $scope.lista_kontrolowanych_tmp = [];


        $db.query({map: map}, function(err, response) {

            console.log(err)
            // console.log(response)
            var _kontrolowani = angular.fromJson(response.rows);

            $scope.znalezionych = _kontrolowani.length
            console.log(_kontrolowani)

            console.log($rootScope.wybrany.lista_kontrolowanych)
            //alert('przed if')
            try {
                if ($rootScope.wybrany.type == 'kontrolujacy' ) {
                  //    alert('wpetli')

                    angular.forEach($rootScope.wybrany.lista_kontrolowanych, function(kontrolowany_z_listy) {
                        angular.forEach(_kontrolowani, function(kont_z_bazy) {
                            if (kont_z_bazy.key._id === kontrolowany_z_listy._id) {
                                //  alert(kont_z_bazy.key._id +'\n'+ kontrolujacy_z_listy._id)
                                var index = _kontrolowani.indexOf(kont_z_bazy);
                                _kontrolowani.splice(index, 1);
                            }

                        })
                    })
                    $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_kontrolowanych
                    $scope.lista_tmp = _kontrolowani
                    $scope.$apply();
                }
                else if($rootScope.wybrany.type == 'adresat'){
                  //  alert('lista adresatów')
                     angular.forEach($rootScope.wybrany.lista_adresatow_decyzji, function(kontrolowany_z_listy) {
                        angular.forEach(_kontrolowani, function(kont_z_bazy) {
                            if (kont_z_bazy.key._id === kontrolowany_z_listy._id) {
                                //  alert(kont_z_bazy.key._id +'\n'+ kontrolujacy_z_listy._id)
                                var index = _kontrolowani.indexOf(kont_z_bazy);
                                _kontrolowani.splice(index, 1);
                            }

                        })
                    })
                    $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_adresatow_decyzji
                    $scope.lista_tmp = _kontrolowani
                    $scope.$apply();
                }
                 else if($rootScope.wybrany.type == 'wladajacy'){
                  //  alert('lista adresatów')
                     angular.forEach($rootScope.wybrany.lista_wladajacych, function(kontrolowany_z_listy) {
                        angular.forEach(_kontrolowani, function(kont_z_bazy) {
                            if (kont_z_bazy.key._id === kontrolowany_z_listy._id) {
                                //  alert(kont_z_bazy.key._id +'\n'+ kontrolujacy_z_listy._id)
                                var index = _kontrolowani.indexOf(kont_z_bazy);
                                _kontrolowani.splice(index, 1);
                            }

                        })
                    })
                    $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_wladajacych
                    $scope.lista_tmp = _kontrolowani
                    $scope.$apply();
                }
                 else if($rootScope.wybrany.type == 'reprezentujacy'){
                  //  alert('lista adresatów')
                     angular.forEach($rootScope.wybrany.lista_reprezentujacych, function(kontrolowany_z_listy) {
                        angular.forEach(_kontrolowani, function(kont_z_bazy) {
                            if (kont_z_bazy.key._id === kontrolowany_z_listy._id) {
                                //  alert(kont_z_bazy.key._id +'\n'+ kontrolujacy_z_listy._id)
                                var index = _kontrolowani.indexOf(kont_z_bazy);
                                _kontrolowani.splice(index, 1);
                            }

                        })
                    })
                    $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_reprezentujacych
                    $scope.lista_tmp = _kontrolowani
                    $scope.$apply();
                }
                else {

                    $scope.lista_tmp = _kontrolowani
                    // $scope.$apply();
                    // alert('przed apply')
                    $scope.$apply();
                }
            } catch (err) {
                console.log(err)

                $scope.lista_tmp = _kontrolowani
                $scope.$apply();
            }


// console.log($scope.lista)

        });
    }, 0)




    $scope.zmiana_zakladki = function(nr_zakladki) {

        if (nr_zakladki == 1) {
            $scope.lista_tmp = $scope.lista
            $scope.lista = null;
            $scope.lista_kontrolujacych_tmp = null;
            $timeout(function() {
                $scope.lista_kontrolujacych_tmp = $scope.wybrany.lista_kontrolujacych;
            }, 500)



        }
        if (nr_zakladki == 2) {
            $scope.lista = $scope.lista_tmp
            $scope.lista_kontrolujacych_tmp = null;
        }



    }

    $scope.openEdytujOsobaModal = function(z_osoba) {

        if (z_osoba === 'nowy') {
            var nowa_osoba = angular.fromJson(angular.toJson(osoba))
            $rootScope.osoba = nowa_osoba;
            $rootScope.osoba._id = UUID.generate();
            $rootScope.osoba.data_utworzenia = new Date().toLocaleString();

        }
        else {
            $rootScope.osoba = angular.fromJson(angular.toJson(z_osoba))
        }
        //  $rootScope.modalMode = true;
        var modalInstance = $modal.open({
            templateUrl: 'szablony/osoby/modal.html',
            controller: OsobaEdycjaModalCtrl,
            windowClass: 'osobaModalWindow',
            backdrop: 'static'
                    // resolve: {
                    //    items: function() {
                    //       return $scope.items;
                    //   }
                    //}
        });

        modalInstance.result.then(function() {
            console.log('zapisywanie')


            //  $scope.selected = selectedItem;
            $rootScope.osoba.data_modyfikacji = new Date().toLocaleString();


            console.log($rootScope.osoba._rev)

            $db.put($rootScope.osoba, function(errors, response) {
                console.log(errors)
                if (errors === null) {
                    console.log(response)

                    $rootScope.osoba._rev = response.rev

                    console.log(z_osoba)
                    if (z_osoba === 'nowy') {
                        // alert('do listy')
                        $scope.lista.push({key: $rootScope.osoba});
                    }
                    else {
                        angular.forEach($scope.lista, function(zlisty) {
                            //   alert('w petli')
                            if (zlisty.key._id == $rootScope.osoba._id) {

                                zlisty.key = $rootScope.osoba
                                //  alert('znaleziony')
                            }
                        })
                    }
                    //$modalInstance.close();
                    // $location.path('/kontrolujacy/lista')
                    $scope.$apply()
                }
            })
        }, function() {
            console.log('Zamknij')
            //  $log.info('Modal dismissed at: ' + new Date());
        });

    }

    $scope.dodaj_do_listy = function(osoba, cel) {
        // alert("dodawanie do listy")
        if ($rootScope.wybrany.type === 'adresat') {
          //  alert('dodawanie')
            $rootScope.wybrany.lista_adresatow_decyzji.push(osoba);
            $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_adresatow_decyzji;
        }
        else if ($rootScope.wybrany.type === 'wladajacy') {
           // alert('dodawanie')
            $rootScope.wybrany.lista_wladajacych.push(osoba);
            $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_wladajacych;
        }
        else if ($rootScope.wybrany.type === 'reprezentujacy') {
           // alert('dodawanie')
            $rootScope.wybrany.lista_reprezentujacych.push(osoba);
            $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_reprezentujacych;
        }
        else {
            $scope.lista_osob_tmp = $rootScope.wybrany.lista_kontrolowanych.push(osoba);
            $scope.lista_kontrolowanych_tmp = $rootScope.wybrany.lista_kontrolowanych
        }
        $scope.lista_osob_tmp = null;
        $timeout(function() {
            if (cel === 'adresat') {
                $rootScope.wybrany.lista_adresatow_decyzji
            }
            else {
                $scope.lista_osob_tmp = $rootScope.wybrany.lista_kontrolowanych
            }
            console.log($scope.lista_osob_tmp)
        }, 200)

        //  $scope.lista_kontrolujacych_tmp=this.wybrany.lista_kontrolujacych

        var index = $scope.lista.indexOf(osoba);
        var nowa = [];
        angular.forEach($scope.lista, function(kontr) {
            if (kontr.key._id != osoba._id) {
                nowa.push(kontr)
            }
        })
        $scope.lista = nowa;
        //  this.lista.splice(index,1)
    }

    $scope.usun_z_listy_kontrolowanych = function(osoba, cel) {
// alert("usuwanie z listy")
         if ($rootScope.wybrany.type === 'adresat') {
          //  alert('usuwanie')
            var index = this.wybrany.lista_adresatow_decyzji.indexOf(osoba);
            this.wybrany.lista_adresatow_decyzji.splice(index, 1);
            this.lista_tmp.push({key: osoba})
        }
        
        else if ($rootScope.wybrany.type === 'wladajacy')   {
          //  alert('usuwanie')
            var index = this.wybrany.lista_wladajacych.indexOf(osoba);
            this.wybrany.lista_wladajacych.splice(index, 1);
            this.lista_tmp.push({key: osoba})
        }
         else if ($rootScope.wybrany.type === 'reprezentujacy')   {
          //  alert('usuwanie')
            var index = this.wybrany.lista_reprezentujacych.indexOf(osoba);
            this.wybrany.lista_reprezentujacych.splice(index, 1);
            this.lista_tmp.push({key: osoba})
        }
        else {
            var index = this.wybrany.lista_kontrolowanych.indexOf(osoba);
            this.wybrany.lista_kontrolowanych.splice(index, 1);
            this.lista_tmp.push({key: osoba})
        }
    }

}

function OsobaEdycjaModalCtrl($scope, $modalInstance) {

    $scope.zamknij = function() {
        $modalInstance.dismiss()
    }

    $scope.zapisz = function() {

        $modalInstance.close()
    }
}

function KontrolujacyEdycjaModalCtrl($scope, $modalInstance) {

    $scope.zamknij = function() {
        $modalInstance.dismiss()
    }

    $scope.zapisz = function() {

        $modalInstance.close()
    }
}

function KontrolujacyEdycjaCtrl($scope, $db, $routeParams, $location, $timeout, $rootScope) {

    // $scope.zaladowany = false

    $db.get($routeParams.id, function(err, doc) {
        console.log(doc)
        if (err == null) {


            //alert("dziala")
            var _kontrolujacy = angular.fromJson(doc)
            var stan = _kontrolujacy.valid;
            _kontrolujacy.valid = stan;
            $rootScope.kontrolujacy = _kontrolujacy
            // $scope.zaladowany = true
            $scope.$apply()
        }
    })




    $scope.zapisz = function() {

        $rootScope.kontrolujacy.data_modyfikacji = new Date().toLocaleString();
        // $scope.kontrolujacy.key = "kontrolujacy"
        //  $scope.kontrolujacy.imiona="moje imiona"
        // var record = angular.toJson($scope.protokol);
        $db.put($rootScope.kontrolujacy, function(errors, response) {
            console.log(errors)
            if (errors === null) {

                $location.path('/kontrolujacy/lista')
                $scope.$apply()
            }
        })


    }
}

function KontrolujacyNowyCtrl($scope, $db, $location) {


    var _kontrolujacy = angular.fromJson(angular.toJson(kontrolujacy))
    $scope.kontrolujacy = _kontrolujacy;
    $scope.uuid = UUID.generate();
    $scope.stopnie = stopnie;
    $scope.zmiana = function() {
        alert("zmiana");
    }





}

function KontrolujacyListaCtrl($scope, $db) {
    function map(doc) {
        if (doc.type == 'kontrolujacy') {
            emit(doc, null);
        }
    }
    $db.query({map: map}, function(err, response) {

        console.log(err)
        // console.log(response)
        var _kontrolujacy = angular.fromJson(response.rows);
        $scope.znalezionych = _kontrolujacy.length
        console.log(_kontrolujacy)

        $scope.lista = _kontrolujacy;
        // console.log($scope.lista)
        $scope.$apply();
    });
    $scope.usun = function(kontrolujacy) {
        $db.info(function(err, info) {
        })
        $db.remove(kontrolujacy, function(err, response) {
            console.log(err)
            if (err == null) {
                $db.query({map: map}, function(err, response) {

                    console.log(err)
                    // console.log(response)
                    var _kontrolujacy = angular.fromJson(response.rows);
                    $scope.znalezionych = _kontrolujacy.length
                    console.log(_kontrolujacy)

                    $scope.lista = _kontrolujacy;
                    // console.log($scope.lista)
                    $scope.$apply();
                });
                $scope.$apply();
            }
        })

    }

}

function ProtokolEdytujCtrl($rootScope, $scope, $db, $routeParams, $location, $timeout) {


    $scope.hashTable = {
        nazwa: 'nazwa1',
        nazwa2: 'nazwa2'
    }

    angular.forEach($scope.hashTable, function(el) {
        console.log(el)
    })


    $scope.komunikat = 'Ładowanie protokołu...'
    $scope.uuid = $routeParams.id;
    $scope.adres = $location.absUrl();

    $scope.odnosniki = []



    if ($rootScope.protokol == undefined) {
        $db.get($routeParams.id, function(errors, doc) {
            $rootScope.protokol = angular.fromJson(doc)
            //     $scope.liczba_art = $rootScope.protokol.przepisy.length;
            angular.forEach($rootScope.protokol.dane, function(el) {
                $scope.odnosniki.push(el)
            })
            console.log($scope.odnosniki)
            $rootScope.wybrany = $scope.odnosniki[0]
            $scope.poprzedni = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) - 1];
            $scope.nastepny = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) + 1]
            $scope.$apply();
        })
    }
    else {
// alert($routeParams.id + " " + $rootScope.protokol._id)
        if ($routeParams.id != $rootScope.protokol._id) {
            $db.get($routeParams.id, function(errors, doc) {
                $rootScope.protokol = angular.fromJson(doc)
                // $scope.liczba_art = $rootScope.protokol.przepisy.length;
                // $scope.odnosniki = $rootScope.protokol.dane;
                angular.forEach($rootScope.protokol.dane, function(el) {
                    $scope.odnosniki.push(el)
                })
                console.log($scope.odnosniki)
                //  var step = $location.search('step')
                $rootScope.wybrany = $scope.odnosniki[0]
                // alert("step " + step)
                $scope.poprzedni = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) - 1];
                $scope.nastepny = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) + 1]
                $scope.$apply();
            })
        }
        else {
            //$scope.odnosniki = $rootScope.protokol.dane;
            angular.forEach($rootScope.protokol.dane, function(el) {
                $scope.odnosniki.push(el)
            })
            $rootScope.wybrany = $scope.odnosniki[$routeParams.index_odnosnika]
            // alert("step " + step)
            angular.forEach($rootScope.protokol.dane, function(odnosnik) {
                odnosnik.aktywny = false;
                console.log('zmianiam na flase');
            });
            $rootScope.wybrany.aktywny = true;
            $scope.poprzedni = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) - 1];
            $scope.nastepny = $scope.odnosniki[$scope.odnosniki.indexOf($scope.wybrany) + 1]
            //  $scope.$apply();
        }
    }


    $scope.sub_klick = function(el, parent) {
        angular.forEach(parent.dane, function(ele) {
            ele.aktywny = false
        })
        el.aktywny = true
        $rootScope.wybrany = el
    }


    $scope.klick = function(odnosnik) {
        //  alert('wybrany ' + odnosnik.nazwa)
        angular.forEach(odnosnik.dane, function(el) {
            el.aktywny = false;
        })

        $rootScope.wybrany = null;
        //$scope.$apply();
        //alert('dziala')
        $timeout(function() {



            $rootScope.wybrany = odnosnik;
            $scope.poprzedni = $scope.odnosniki[$scope.odnosniki.indexOf(odnosnik) - 1];
            $scope.nastepny = $scope.odnosniki[$scope.odnosniki.indexOf(odnosnik) + 1]

            //  $location.hash([$rootScope.protokol.dane.indexOf(odnosnik)])
            // $routeParams.index_odnosnika= $rootScope.protokol.dane.indexOf(odnosnik)           
            // $location.search('step', $rootScope.protokol.dane.indexOf(odnosnik));
            $location.path('protokol/edytuj/' + $rootScope.protokol._id + '/' + $scope.odnosniki.indexOf(odnosnik))
            //alert($location.absUrl());
            //$location.replace();
        }, 0);
    }


}

function ProtokolDodawanieKontrolujacychCtrl($scope, $rootScope, $db, $timeout, $route, $modal) {

    function map(doc) {
        if (doc.type == 'kontrolujacy') {
            emit(doc, null);
        }
    }
    $timeout(function() {

        $scope.lista_kontrolujacych_tmp = $scope.wybrany.lista_kontrolujacych;


        $db.query({map: map}, function(err, response) {

            console.log(err)
            // console.log(response)
            var _kontrolujacy = angular.fromJson(response.rows);

            $scope.znalezionych = _kontrolujacy.length
            console.log(_kontrolujacy)

            console.log($rootScope.wybrany.lista_kontrolujacych)
            //alert('przed if')
            try {
                if ($rootScope.wybrany.lista_kontrolujacych.length > 0) {
                    //   alert('wpetli')

                    angular.forEach($rootScope.wybrany.lista_kontrolujacych, function(kontrolujacy_z_listy) {
                        angular.forEach(_kontrolujacy, function(kont_z_bazy) {
                            if (kont_z_bazy.key._id === kontrolujacy_z_listy._id) {
                                //  alert(kont_z_bazy.key._id +'\n'+ kontrolujacy_z_listy._id)
                                var index = _kontrolujacy.indexOf(kont_z_bazy);
                                _kontrolujacy.splice(index, 1);
                            }

                        })
                    })

                    // $scope.lista = _kontrolujacy
                    $scope.lista_tmp = _kontrolujacy
                    $scope.$apply();
                }
                else {
                    //$scope.lista = _kontrolujacy;
                    $scope.lista_tmp = _kontrolujacy
                    // $scope.$apply();
                    // alert('przed apply')
                    $scope.$apply();
                }
            } catch (err) {
                console.log(err)
                // $scope.lista = _kontrolujacy;
                $scope.lista_tmp = _kontrolujacy
                $scope.$apply();
            }


// console.log($scope.lista)

        });
    }, 0)




    $scope.zmiana_zakladki = function(nr_zakladki) {

        if (nr_zakladki == 1) {
            $scope.lista_tmp = $scope.lista
            $scope.lista = null;
            $scope.lista_kontrolujacych_tmp = null;
            $timeout(function() {
                $scope.lista_kontrolujacych_tmp = $scope.wybrany.lista_kontrolujacych;
            }, 500)



        }
        if (nr_zakladki == 2) {
            $scope.lista = $scope.lista_tmp
            $scope.lista_kontrolujacych_tmp = null;
        }



    }

    $scope.openEdytujKontrolujacyModal = function(z_kontrolujacy) {

        if (z_kontrolujacy === 'nowy') {
            var nowy_kontrolujacy = angular.fromJson(angular.toJson(kontrolujacy))
            $rootScope.kontrolujacy = nowy_kontrolujacy;
            $rootScope.kontrolujacy._id = UUID.generate();
            $rootScope.kontrolujacy.data_utworzenia = new Date().toLocaleString();

        }
        else {
            $rootScope.kontrolujacy = angular.fromJson(angular.toJson(z_kontrolujacy))
        }
        //  $rootScope.modalMode = true;
        var modalInstance = $modal.open({
            templateUrl: 'szablony/kontrolujacy/modal.html',
            controller: KontrolujacyEdycjaModalCtrl,
            windowClass: 'kontrolujacyModalWindow',
            backdrop: 'static'
                    // resolve: {
                    //    items: function() {
                    //       return $scope.items;
                    //   }
                    //}
        });

        modalInstance.result.then(function() {
            console.log('zapisywanie')


            //  $scope.selected = selectedItem;
            $rootScope.kontrolujacy.data_modyfikacji = new Date().toLocaleString();

            // $scope.kontrolujacy.key = "kontrolujacy"
            //  $scope.kontrolujacy.imiona="moje imiona"
            // var record = angular.toJson($scope.protokol);
            console.log($rootScope.kontrolujacy._rev)
            //$rootScope.kontrolujacy._rev = UUID.generate()
            $db.put($rootScope.kontrolujacy, function(errors, response) {
                console.log(errors)
                if (errors === null) {
                    console.log(response)

                    $rootScope.kontrolujacy._rev = response.rev
                    //  alert('kont ' + _kontrolujacy)
                    console.log(z_kontrolujacy)
                    if (z_kontrolujacy === 'nowy') {
                        alert('do listy')
                        $scope.lista.push({key: $rootScope.kontrolujacy});
                    }
                    else {
                        angular.forEach($scope.lista, function(zlisty) {
                            //   alert('w petli')
                            if (zlisty.key._id == $rootScope.kontrolujacy._id) {

                                zlisty.key = $rootScope.kontrolujacy
                                //  alert('znaleziony')
                            }
                        })
                    }
                    //$modalInstance.close();
                    // $location.path('/kontrolujacy/lista')
                    $scope.$apply()
                }
            })
        }, function() {
            console.log('Zamknij')
            //  $log.info('Modal dismissed at: ' + new Date());
        });

    }

    $scope.dodaj_do_listy = function(kontrolujacy) {
        // alert("dodawanie do listy")
        $rootScope.wybrany.lista_kontrolujacych.push(kontrolujacy);
        $scope.lista_kontrolujacych_tmp = null;
        $timeout(function() {
            $scope.lista_kontrolujacych_tmp = $rootScope.wybrany.lista_kontrolujacych
            console.log($scope.lista_kontrolujacych_tmp)
        }, 200)

        //  $scope.lista_kontrolujacych_tmp=this.wybrany.lista_kontrolujacych

        var index = $scope.lista.indexOf(kontrolujacy);
        var nowa = [];
        angular.forEach($scope.lista, function(kontr) {
            if (kontr.key._id != kontrolujacy._id) {
                nowa.push(kontr)
            }
        })
        $scope.lista = nowa;
        //  this.lista.splice(index,1)
    }

    $scope.usun_z_listy_kontrolujacych = function(kontrolujacy) {
// alert("usuwanie z listy")
        var index = this.wybrany.lista_kontrolujacych.indexOf(kontrolujacy);
        this.wybrany.lista_kontrolujacych.splice(index, 1);
        this.lista_tmp.push({key: kontrolujacy})
    }
}

function  ProtokolNowyCtrl($scope, $db, $log, $location) {
    $scope.protokol = protokol;
    $scope.uuid = UUID.generate();
    $scope.zapisz = function() {
        $log.info('Zapis protokołu')
        $scope.protokol._id = $scope.uuid
        $scope.protokol.data_utworzenia = new Date().toLocaleString();
        var record = angular.toJson($scope.protokol);
        $db.put($scope.protokol, function(errors, response) {
            console.log(errors)
            if (errors === null) {

                $location.path('/protokoly')
                $scope.$apply()
            }
        })


    }
}
;
function ProtokolyCtrl($scope, $timeout, $db) {

    $db.allDocs({include_docs: true}, function(err, response) {
        console.log(err)
        console.log(response)
        var _protokoly = angular.fromJson(response.rows);
        $scope.liczba_protokolow = _protokoly.length
        console.log(_protokoly)

        $scope.protokoly = _protokoly;
        console.log($scope.protokoly)
        $scope.$apply();
    });
}
;
function PodstawaPrawnaCtrl($scope) {

    $scope.czy_dodac_wlasne = false;
    var przepis = {
        nazwa: '',
        wybrany: false,
        wymagany: false,
        dodany: true
    };
    $scope.dodajPrzepis = function() {
        //alert('dziala')
        $rootScope.wybrany.przepisy.push($scope.przepis);
        $scope.przepis = przepis.constructor();
        $scope.czy_dodac_wlasne = false;
        $scope.edycjaPrzepisu = false;
    }

    $scope.usunPrzepis = function(przepis) {
        var index = $rootScope.wybrany.przepisy.indexOf(przepis);
        $rootScope.wybrany.przepisy.splice(index, 1);
    }

    $scope.blurPrzepis = function(valid) {
        //alert('blur'+valid)
        if (valid === false) {
            $scope.przepis.nazwa = startyTytulPrzepisu;
        }
        $scope.edycjaPrzepisu = false;
    }

    $scope.klickChceDodac = function() {
        $scope.przepis = przepis.constructor();
        $scope.przepis.dodany = true;
    }

    var startyTytulPrzepisu = "";
    $scope.edytujPrzepis = function(przepis) {
        $scope.edycjaPrzepisu = true;
        startyTytulPrzepisu = przepis.nazwa;
        $scope.przepis = przepis;
    }

    $scope.klickArtykul = function(artykul) {
        //alert('dziala')
        console.log(artykul.wybrany)
        if (artykul.wybrany === false) {
            angular.forEach(artykul.paragrafy, function(paragraf) {
                paragraf.wybrany = false;
                paragraf.wymagany = false;
                console.log("p wybrany:" + paragraf.wybrany)
                console.log("p wymagany:" + paragraf.nazwa + "" + paragraf.wybrany)
            });
        }

        if (artykul.wybrany === true) {
            angular.forEach(artykul.paragrafy, function(paragraf) {
                // paragraf.wybrany = false;
                paragraf.wymagany = true;
                console.log("p:" + paragraf.wybrany)
                console.log("p wymagany po zmianie na t:" + paragraf.nazwa + "" + paragraf.wymagany)
            });
        }

        angular.forEach($scope.wybrany.przepisy, function(artykul) {
            console.log(artykul.nazwa + artykul.wymagany)
            console.log("sprawdzam " + artykul.nazwa + "=" + artykul.wymagany)
            if (artykul.wybrany === true) {
                czy_jest_wybrany_art = true;
                var czy_jest_wybrany_paragraf = false;
                angular.forEach(artykul.paragrafy, function(paragraf) {
                    if (paragraf.wybrany === true) {
                        czy_jest_wybrany_paragraf = true;
                    }
                })
                if (czy_jest_wybrany_paragraf === true) {
                    angular.forEach(artykul.paragrafy, function(paragraf) {
                        paragraf.wymagany = false;
                    });
                }
                if (czy_jest_wybrany_paragraf === false) {
                    angular.forEach(artykul.paragrafy, function(paragraf) {
                        paragraf.wymagany = true;
                    });
                }

            }



        });
        if (czy_jest_wybrany_art === true) {
            console.log("jest wybrany:" + czy_jest_wybrany_art)
            angular.forEach($scope.wybrany.przepisy, function(artykul) {

                artykul.wymagany = false;
                console.log("sprawdzam po zmianie wymagany" + artykul.nazwa + "=" + artykul.wymagany)
            })
        }
        if (czy_jest_wybrany_art === false) {
            console.log("jest wybranyII:" + czy_jest_wybrany_art)
            angular.forEach($scope.wybrany.przepisy, function(artykul) {
                artykul.wymagany = true;
            });
        }
        czy_jest_wybrany_art = false

    };
}


function RodzajKontroliCtrl($scope, $rootScope) {
//alert('dziala');

    $scope.edycjaRodzajuKontroli = false;
    $scope.klickChceDodac = function(nowyRodzaj) {
        $scope.rk = {
            nazwa: '',
            wybrany: false,
            wymagany: false,
            dodany: true
        }
    }

    $scope.dodajRodzajKontroli = function() {
        $rootScope.wybrany.rodzaje_kontroli.push($scope.rk);
        $scope.czy_dodac_wlasne = false
    }

    $scope.edytujRodzajKontroli = function(rk) {
        $scope.edycjaRodzajuKontroli = true;
        $scope.staraNazwa = rk.nazwa;
        $scope.rk = rk;
    }

    $scope.blurRodzajKontroli = function(valid) {

        if (valid === false) {
            $scope.rk.nazwa = $scope.staraNazwa;
        }
        $scope.edycjaRodzajuKontroli = false
    }

    $scope.usunRodzajKontroli = function(rk) {
        var index = $rootScope.wybrany.rodzaje_kontroli.indexOf(rk)
        $rootScope.wybrany.rodzaje_kontroli.splice(index, 1);
    }


    $scope.klickRodzajKontroli = function(rodzajKontroli) {

        var czy_jest_wybrany = false;
        angular.forEach($scope.wybrany.rodzaje_kontroli, function(rk) {
            //  console.log('sprawdzany ' + rk.nazwa)
            if (rk.wybrany === true) {
                //  console.log("wybrany " + rk.nazwa)
                czy_jest_wybrany = true;
                return

            }
        })


        if (czy_jest_wybrany === true) {
            angular.forEach($scope.wybrany.rodzaje_kontroli, function(rk) {

                if (rk.wybrany === true) {
                    rk.wymagany = true;
                }
                else {
                    rk.wymagany = false;
                }
            })

        }
        console.log('wybrany ' + czy_jest_wybrany)
        if (czy_jest_wybrany === false) {
            angular.forEach($scope.wybrany.rodzaje_kontroli, function(rk) {
                rk.wymagany = true;
            })

        }


    }

}

function ObjektyListaCtrl($scope, $rootScope) {

}