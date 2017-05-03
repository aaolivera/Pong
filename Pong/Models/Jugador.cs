using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Pong.Models
{
    public class Jugador
    {
        public string Id { get; set; }

        public bool Ready { get; set; }

        public int Puntos { get; set; }
    }
}