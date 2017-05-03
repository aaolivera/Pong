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
        
        public void UnirseAPartida(string jugadorId)
        {
            if (Partidas.Any(x => x.Jugadores.Any(y => y.Id == jugadorId)))
            {
                return;
            }
            var jugador = Jugadores.FirstOrDefault(x => x.Id == jugadorId) ?? new Jugador { Id = jugadorId };

            var ultima = Partidas.LastOrDefault();
            
            if (ultima == null || ultima.Completa())
            {
                ultima = new Partida();
                Partidas.Add(ultima);
            }

            ultima.Jugadores.Add(jugador);
            
            Groups.Add(Context.ConnectionId, ultima.Id);
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
                Clients.Group(partidaExistente.Id).iniciarPartida();
            }
        }
    }
}