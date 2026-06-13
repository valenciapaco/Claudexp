// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ------------------------------------------------------------
// Pega aquí los datos de TU proyecto Firebase (instrucciones paso a
// paso en Guia-Anfitrion.md, sección "Conectar Firebase").
//
// Mientras los valores digan "PEGA_AQUI", el juego funciona en
// MODO OFFLINE: cada teléfono corre por su cuenta (sirve para probar
// las cartas), pero NO hay tabla de posiciones en vivo ni cálculo
// automático de puntajes. Para la magia completa, llena esto.
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD-OrUJlKaWO61-V39eIPrS7XGDMiBXDoA",
  authDomain: "mysterypeps-a94ba.firebaseapp.com",
  databaseURL: "https://mysterypeps-a94ba-default-rtdb.firebaseio.com",
  projectId: "mysterypeps-a94ba",
  storageBucket: "mysterypeps-a94ba.firebasestorage.app",
  messagingSenderId: "673143209371",
  appId: "1:673143209371:web:c84c607c0f31c33afff53e"
};

// Código de la sala. Todos (pantalla y teléfonos) deben usar el MISMO.
// Cambia esto si quieres empezar una partida nueva y limpia.
const SALA_DEFAULT = "FIESTA";
