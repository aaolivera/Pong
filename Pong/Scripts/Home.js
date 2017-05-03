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
    self.barraHeight = 30;

    self.pelotaWidth = 6;
    self.pelotaHeight = 6;

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
        host.BuscarPartida(function() {
            self.Partida(new Partida(host, new C()));
        });
    }
};

function Partida(host, c) {
    var self = this;
    self.Host = host;
    self.NotificarActualizacion = ko.observable();
    self.JugadorLocal = new JugadorLocal(self, c);
    self.JugadorRemoto = new JugadorRemoto(self, c);
    self.Pelota = new Pelota(self, c);

    self.Host.Iniciar = function () {

        setInterval(function () {
            self.Pelota.Mover();
        }, 17);
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
    self.x = c.width - 10;
    self.y = c.height / 2;

    partida.Host.RecibirMovimiento = function (arriba) {
        self.y += 10 * (arriba ? -1 : 1);
        partida.NotificarActualizacion.notifySubscribers();
    };
}

function Pelota(partida, c) {
    var self = this;
    self.x = c.width / 2;
    self.y = c.height / 2;
    self.velX = Math.floor(Math.random() * 2) ? -1 : 1;
    self.velY = Math.floor(Math.random() * 2) ? -1 : 1;

    self.Mover = function() {
        self.x += self.velX;
        self.y += self.velY;
        partida.NotificarActualizacion.notifySubscribers();
    }
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
    self.Iniciar = function (callback) { }

    host.client.informarMovimiento = function (arriba) {
        self.RecibirMovimiento(arriba);
    };

    host.client.iniciarPartida = function () {
        self.Iniciar();
    };

    $.connection.hub.start().done(function () {
    });
}