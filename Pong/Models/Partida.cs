using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pong.Models
{
    public class Partida
    {
        public string Id { get; } = Guid.NewGuid().ToString();

        public List<Jugador> Jugadores { get; } = new List<Jugador>();

        public bool Completa()
        {
            return Jugadores.Count == 2;
        }

        public bool Ready()
        {
            return Jugadores.Count(x => x.Ready) == 2;
        }
    }
}