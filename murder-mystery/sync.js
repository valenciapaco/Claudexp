// ============================================================
// CAPA DE SINCRONIZACIÓN (Firebase Realtime Database)
// ------------------------------------------------------------
// Abstrae la comunicación entre la pantalla central y los teléfonos.
// Si Firebase no está configurado, cae a "modo offline" sin romperse.
//
// Estructura de datos en la base:
//   salas/{SALA}/meta       -> { fase, ronda, votacionAbierta, revelado }
//   salas/{SALA}/jugadores/{id} -> { nombre, rol, puntosMisiones,
//                                     voto, votoRevelado, otroCulpable, ts }
// ============================================================

const Sync = (function () {
  let modo = "offline";
  let db = null;

  function estaConfigurado() {
    return typeof FIREBASE_CONFIG !== "undefined" &&
      FIREBASE_CONFIG &&
      typeof FIREBASE_CONFIG.apiKey === "string" &&
      FIREBASE_CONFIG.apiKey.indexOf("PEGA_AQUI") === -1 &&
      typeof FIREBASE_CONFIG.databaseURL === "string" &&
      FIREBASE_CONFIG.databaseURL.indexOf("PEGA_AQUI") === -1;
  }

  function init() {
    if (estaConfigurado() && typeof firebase !== "undefined") {
      try {
        if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.database();
        modo = "online";
      } catch (e) {
        console.error("[Sync] Firebase no inició; modo offline.", e);
        modo = "offline";
      }
    } else {
      modo = "offline";
    }
    return modo;
  }

  function online() { return modo === "online"; }

  // -------- ANFITRIÓN (pantalla.html) --------
  function setMeta(sala, meta) {
    if (!online()) return Promise.resolve();
    return db.ref("salas/" + sala + "/meta").update(meta);
  }

  let refJugadores = null;
  function onJugadores(sala, cb) {
    if (!online()) { cb({}); return; }
    if (refJugadores) refJugadores.off();         // suelta la sala anterior si la había
    refJugadores = db.ref("salas/" + sala + "/jugadores");
    refJugadores.on("value", function (snap) {
      cb(snap.val() || {});
    });
  }

  // ¿Ya existe una sala con ese nombre?
  function salaExiste(sala) {
    if (!online()) return Promise.resolve(false);
    return db.ref("salas/" + sala).once("value").then(function (s) { return s.exists(); });
  }

  // Lista en vivo de salas disponibles (las que creó la pantalla),
  // ordenadas de la más reciente a la más vieja. El jugador elige de aquí.
  function listarSalas(cb) {
    if (!online()) { cb([]); return; }
    db.ref("salas").on("value", function (snap) {
      const val = snap.val() || {};
      const arr = Object.keys(val).map(function (nombre) {
        const meta = (val[nombre] && val[nombre].meta) || {};
        return { nombre: nombre, creada: meta.creada || 0 };
      });
      arr.sort(function (a, b) { return (b.creada || 0) - (a.creada || 0); });
      cb(arr);
    });
  }

  function reiniciarSala(sala) {
    if (!online()) return Promise.resolve();
    return db.ref("salas/" + sala).remove();
  }

  // -------- JUGADOR (jugador.html) --------
  function unirse(sala, id, data) {
    if (!online()) return Promise.resolve();
    data = Object.assign({}, data, { ts: Date.now() });
    return db.ref("salas/" + sala + "/jugadores/" + id).update(data);
  }

  function actualizarJugador(sala, id, data) {
    return unirse(sala, id, data);
  }

  function onMeta(sala, cb) {
    if (!online()) { cb(null); return; }
    db.ref("salas/" + sala + "/meta").on("value", function (snap) {
      cb(snap.val());
    });
  }

  // Escucha el propio nodo del jugador (para recibir el puntaje que
  // calcula la pantalla central al final).
  function onJugador(sala, id, cb) {
    if (!online()) { cb(null); return; }
    db.ref("salas/" + sala + "/jugadores/" + id).on("value", function (snap) {
      cb(snap.val());
    });
  }

  // id estable por dispositivo (sobrevive recargas)
  function idDispositivo() {
    let id = localStorage.getItem("mm_device_id");
    if (!id) {
      id = "j_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("mm_device_id", id);
    }
    return id;
  }

  return {
    init, online, estaConfigurado,
    setMeta, onJugadores, salaExiste, listarSalas, reiniciarSala,
    unirse, actualizarJugador, onMeta, onJugador,
    idDispositivo
  };
})();
