using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Pong.Models;

namespace Pong.Hubs
{
    public class ServerHub : Hub
    {
        private static readonly List<Partida> Partidas = new List<Partida>();
        private static readonly List<Jugador> Jugadores = new List<Jugador>();

        public void Mover(string jugadorId, bool arriba)
        {
            var partidaExistente = Partidas.FirstOrDefault(x => x.Jugadores.Any(y => y.Id == jugadorId));

            if (partidaExistente == null)
            {
                return;
            }

            Clients.OthersInGroup(partidaExistente.Id).informarMovimiento(arriba);
        }
        
        public int UnirseAPartida(string jugadorId)
        {
            var esVicitante = -1;
            if (Partidas.Any(x => x.Jugadores.Any(y => y.Id == jugadorId)))
            {
                return 1;
            }
            var jugador = Jugadores.FirstOrDefault(x => x.Id == jugadorId) ?? new Jugador { Id = jugadorId };

            var ultima = Partidas.LastOrDefault();
            
            if (ultima == null || ultima.Completa())
            {
                ultima = new Partida();
                Partidas.Add(ultima);
                esVicitante = 1;
            }

            ultima.Jugadores.Add(jugador);
            Groups.Add(Context.ConnectionId, ultima.Id);
            return esVicitante;
        }

        public void Ready(string jugadorId)
        {
            var partidaExistente = Partidas.FirstOrDefault(x => x.Jugadores.Any(y => y.Id == jugadorId));

            if (partidaExistente == null)
            {
                return;
            }

            partidaExistente.Jugadores.First(y => y.Id == jugadorId).Ready = true;

            if (partidaExistente.Ready())
            {
                var r = new Random();
                Clients.Group(partidaExistente.Id).iniciarPunto(
                new {
                    velX = Math.Floor(r.NextDouble() * 2) == 0 ? -1 : 1,
                    velY = Math.Floor(r.NextDouble() * 2) == 0 ? -1 : 1
                });
            }
        }
    }
}