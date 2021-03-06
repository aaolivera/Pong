//Constantes
function C() {
    var self = this;
    self.width = 600;
    self.height = 400;

    self.anchoLineaCentral = 2;
    self.altoLineaCentral = 10;
    self.separacionLineaCentral = 6;
    self.lineWidth = 4;

    self.barraWidth = 6;
    self.barraHeight = 100;

    self.pelotaWidth = 12;
    self.pelotaHeight = 12;

    self.negro = "#000000";
    self.blanco = "#FFFFFF";
}

//

function ViewModel() {
    var self = this;
    var usuarioId = guid();
    self.Partida = ko.observable(null);
    Dibujador(self.Partida, new C());

    var host = new Host(usuarioId);

    self.BuscarPartida = function () {
        host.BuscarPartida(function(esVicitante) {
            self.Partida(new Partida(host, new C(), esVicitante));
        });
    }

    self.Ping = function() {
        host.Ping();
    }

    self.subirBajarTeclado = function (d, e) {
        //38 //40
        if (self.Partida() !== null && e.keyCode === 40) {
            self.Partida().JugadorLocal.Bajar();
        }
        if (self.Partida() !== null && e.keyCode === 38) {
            self.Partida().JugadorLocal.Subir();
        }
    }
};

function Partida(host, c, esVicitante) {
    var self = this;
    self.Host = host;
    self.NotificarActualizacion = ko.observable();
    self.JugadorLocal = new JugadorLocal(self, c);
    self.JugadorRemoto = new JugadorRemoto(self, c);
    self.Pelota = new Pelota(self, c);

    self.Host.Iniciar = function (valoresIniciales) {
        self.Pelota.Inicializar(valoresIniciales.velX * esVicitante, valoresIniciales.velY);
        setInterval(function () {
            self.Pelota.Mover();
        }, 17);//17
    };
    
    self.Host.Ready();
}

function JugadorLocal(partida, c) {
    var self = this;
    self.x = 10;
    self.y = c.height / 2;

    self.Subir = function () {
        if (self.y > 0 && self.y <= c.height) {
            partida.Host.Subir(function () {
                self.y -= 10;
                partida.NotificarActualizacion.notifySubscribers();
            });
        }
    }

    self.Bajar = function () {
        if (self.y >= 0 && (self.y + c.barraHeight) < c.height) {
            partida.Host.Bajar(function () {
                self.y += 10;
                partida.NotificarActualizacion.notifySubscribers();
            });
        }
    }
}

function JugadorRemoto(partida, c) {
    var self = this;
    self.x = c.width - 10 - c.barraWidth;
    self.y = c.height / 2;

    partida.Host.RecibirMovimiento = function (arriba) {
        self.y += 10 * (arriba ? -1 : 1);
        partida.NotificarActualizacion.notifySubscribers();
    };
}

function Pelota(partida, c) {
    var self = this;
    self.x = c.width / 2 - c.pelotaWidth / 2;
    self.y = c.height / 2 - c.pelotaHeight / 2;
    self.velX = 0;
    self.velY = 0;

    self.Inicializar = function(x, y) {
        self.velX = x;
        self.velY = y;
    }

    self.Mover = function () {
        if (self.HayColisionConPared()) {
            self.velY *= -1;
        }
        if (self.HayColisionConJugadorLocal()) {
            self.velX *= -1;
            self.velY = self.CalcularDireccionY(partida.JugadorLocal.y);
        }
        if (self.HayColisionConJugadorVicitante()) {
            self.velX *= -1;
            self.velY = self.CalcularDireccionY(partida.JugadorRemoto.y);
        }

        self.x += self.velX;
        self.y += self.velY;
        partida.NotificarActualizacion.notifySubscribers();
    }

    self.HayColisionConPared = function () {
        return !((self.y + c.pelotaHeight) < c.height && self.y > 0 );
    }

    self.HayColisionConJugadorLocal = function () {
        return self.x === (partida.JugadorLocal.x + c.barraWidth) && ((self.y + c.pelotaHeight) > partida.JugadorLocal.y && self.y < (partida.JugadorLocal.y + c.barraHeight));
    }

    self.HayColisionConJugadorVicitante = function () {
        return (self.x + c.pelotaWidth) === partida.JugadorRemoto.x && ((self.y + c.pelotaHeight) > partida.JugadorRemoto.y && self.y < (partida.JugadorRemoto.y + c.barraHeight));
    }

    self.CalcularDireccionY = function(y) {
        var centroBarra = y + (c.barraHeight / 2);
        var centroPelota = self.y + (c.pelotaHeight / 2);
        return (centroPelota - centroBarra) / (c.barraHeight / 2);
    }

    //self.HayPunto = function () {
    //    return (self.x + c.pelotaWidth) === partida.JugadorRemoto.x && ((self.y + c.pelotaHeight) < partida.JugadorRemoto.y || self.y < (partida.JugadorRemoto.y + c.barraHeight));
    //}
}

$(document).ready(function () {
    ko.applyBindings(new ViewModel());
});

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

function Dibujador(partida, c) {
    var self = this;
    var canvas = document.getElementById('canvas');
    canvas.width = c.width;
    canvas.height = c.height;
    var context = canvas.getContext('2d');

    var dibujarFondo = function () {
        context.beginPath();
        context.fillStyle = c.negro;
        context.fillRect(0, 0, c.width, c.height);
        context.stroke();
    }

    var dibujarLineaCentral = function () {
        context.lineWidth = c.lineWidth;
        context.strokeStyle = c.blanco;
        for (var h = 0; h < c.height; h++) {
            context.beginPath();
            context.moveTo(c.width / 2 - c.anchoLineaCentral / 2, h);
            h += c.altoLineaCentral;
            context.lineTo(c.width / 2 - c.anchoLineaCentral / 2, h);
            context.stroke();
            h += c.separacionLineaCentral;
        }
    }

    var dibujarJugador = function (x, y) {
        context.beginPath();
        context.fillStyle = c.blanco;
        context.fillRect(x, y, c.barraWidth, c.barraHeight);
        context.stroke();
    }

    var dibujarMapa = function () {
        canvas.width = canvas.width;
        dibujarFondo(context);
        dibujarLineaCentral(context);
    }

    var dibujarJugadorLocal = function (jugador)
    {
        dibujarJugador(jugador.x, jugador.y);
    }

    var dibujarJugadorRemoto = function (jugador) {
        dibujarJugador(jugador.x, jugador.y);
    }

    var dibujarPelota = function (pelota) {
        context.beginPath();
        context.fillStyle = c.blanco;
        context.fillRect(pelota.x, pelota.y, c.pelotaWidth, c.pelotaHeight);
        context.stroke();
    }

    self.DibujarPartida = ko.computed(function() {
        if (partida() != null) {
            partida().NotificarActualizacion();
            dibujarMapa();
            dibujarJugadorLocal(partida().JugadorLocal);
            dibujarJugadorRemoto(partida().JugadorRemoto);
            dibujarPelota(partida().Pelota);
        }
    });
}

function Host(usuarioId) {
    var self = this;
    var host = $.connection.serverHub;

    self.BuscarPartida = function (callback) {
        host.server.unirseAPartida(usuarioId).done(callback);
    }

    self.Ready = function () {
        host.server.ready(usuarioId);
    }

    self.Subir = function (callback) {
        host.server.mover(usuarioId, true).done(callback);
    }

    self.Bajar = function (callback) {
        host.server.mover(usuarioId, false).done(callback);
    }
    
    self.RecibirMovimiento = function (callback) { }
    self.Iniciar = function (valoresIniciales) { }

    host.client.recibirMovimiento = function (arriba) {
        self.RecibirMovimiento(arriba);
    };

    host.client.recibirNuevaDireccion = function (arriba) {
        self.RecibirMovimiento(arriba);
    };

    host.client.iniciarPunto = function (valoresIniciales) {
        self.Iniciar(valoresIniciales);
    };

    //PING
    self.Ping = function () {
        host.server.ping(new Date().getTime());
    }

    host.client.responderPing = function (date, connectionId) {
        host.server.responderPing(date, connectionId);
    }

    host.client.recibirPing = function (date) {
        $('#pingResultado').val(new Date().getTime() - date);
    }
    //

    $.connection.hub.start().done(function () {
    });
}