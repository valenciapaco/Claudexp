# 🪩🎂 El Misterio del Niño Envuelto — Guía del anfitrión

Murder mystery familiar para la fiesta de **El Peps**. Para 20-30 adultos, ~40 minutos, fiesta temática de los 70's.

El giro: **El Peps se comió el Niño Envuelto de la abuela Rosenda**… pero toda la investigación apunta a su **cómplice**. Quien atine al cómplice resuelve el caso; quien además descubra que fue El Peps, gana en grande.

---

## 1. Qué necesitas

- Una **TV o laptop** para la *Pantalla Central* (`pantalla.html`), que todos puedan ver.
- Que cada invitado abra `jugador.html` en **su propio teléfono**.
- **Internet/WiFi** para todos (la magia automática usa Firebase; ver más abajo).

Todo son archivos HTML estáticos enlazados con rutas relativas: súbelos a tu repositorio de GitHub (o GitHub Pages) y funcionan tal cual. **No necesitas servidor.**

---

## 2. Conectar Firebase (una sola vez, ~10 min)

Sin esto, el juego corre en *modo prueba* (cada teléfono por su cuenta, sin tabla central ni puntajes automáticos). Para la experiencia completa:

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google y crea un proyecto (cualquier nombre). Puedes desactivar Google Analytics.
2. En el menú, ve a **Build → Realtime Database → Crear base de datos**. Elige una ubicación y empieza en **modo de prueba** (test mode). *(El modo de prueba deja leer y escribir sin login; perfecto para una fiesta. Es temporal; para algo permanente se ajustarían las reglas.)*
3. Ve a **⚙️ Configuración del proyecto → tus apps → Web (`</>`)**. Registra una app web y copia el objeto `firebaseConfig` que te da.
4. Abre el archivo **`firebase-config.js`** de esta carpeta y pega ahí tus valores (apiKey, authDomain, **databaseURL**, projectId, etc.), reemplazando los `"PEGA_AQUI"`. La **databaseURL** es la más importante.
5. Sube los cambios a GitHub. ¡Listo!

> Tip: para confirmar que quedó, abre `pantalla.html`: arriba debe decir **"● En vivo · sala FIESTA"** en verde.

---

## 3. La hoja de control secreta (¡solo para ti!) 🔐

Cada invitado recibe un **número del 1 al 30** que tú le das **en voz alta**. Para ellos no significa nada; solo tú sabes qué rol esconde cada número:

| Número | Rol secreto | A quién dárselo |
|---|---|---|
| **7** | 🎂 **El Peps (culpable)** | A **El Peps** (el cumpleañero). |
| **21** | 🤝 **Cómplice** | A quien tú elijas esa noche para ser el cómplice. |
| **4, 13, 26** | 🕵️ **Detectives** | A 3 personas que quieras como detectives. |
| Todos los demás | ❓ Sospechosos | A cualquiera. |

Reglas de reparto:
- Dale **el 7 a El Peps** sí o sí (además, si El Peps elige su nombre en la lista, el juego lo marca como culpable automáticamente).
- Reparte el **21** (cómplice) y el **4/13/26** (detectives) a quien tú decidas, con cara de póker.
- Reparte el resto de los números al azar.
- Si hay **menos de 30 invitados**, simplemente no uses los números más altos, pero **nunca dejes de repartir el 7, el 21 y los tres de detective**.

Si quieres cambiar qué número es qué rol, edita `GAME_DATA.tablaRoles` en `data.js`.

---

## 4. Cómo entran los jugadores

Primero, en `pantalla.html` (la pantalla central) tú **le pones nombre a la partida** (por ejemplo `CUMPLE-PEPS`) y das clic en **Crear / abrir esta sala**. Eso crea una sala nueva con ese nombre. Si el nombre ya existía, te pregunta si lo quieres **sobrescribir** (y borra la partida vieja por ti). Ese nombre es el **código** que verás en grande en la pantalla.

Luego cada invitado abre `jugador.html` y:
1. Escribe el **código de la partida** que pusiste (te lo enseña la pantalla en grande).
2. **Elige su nombre** de la lista desplegable.
3. Escribe el **número** que le diste.
4. Ve su personaje secreto. ¡Que no lo enseñen!

La lista de nombres ya trae a toda la familia (de tu lista) más 4 "invitados extra" por si llega alguien de sorpresa.

---

## 5. El guion de la noche (≈40 min)

Todo se controla desde `pantalla.html` con el botón **Siguiente**. La pantalla te va diciendo qué hacer. El orden:

**Ya no hay que teclear claves.** Las rondas, la votación y el cálculo final se abren **solos** en los teléfonos conforme tú avanzas con **Siguiente** en la pantalla central.

| Momento | Qué pasa |
|---|---|
| **Nueva partida / Preparativos** | Nombras la partida, repartes números, ves cuántos se conectaron. |
| **Narración (×6)** | Lees la historia con mucho drama. En la escena del grito, **Teté actúa la alarma**. |
| **Lean su personaje** | Todos leen su carta en silencio (2-3 min). |
| **Ronda 1** | Al entrar a la ronda, las misiones de la ronda 1 **se abren solas** en los teléfonos. Anuncias «¡Ronda 1, revisen sus misiones!» y corre el cronómetro (~6 min). |
| **Interrogatorio 1** | Un detective llama a alguien al frente; sacas una pregunta al azar. |
| **Posiciones** | La pantalla muestra la **tabla de puntos** de la ronda. |
| **Ronda 2 / 3** | Igual: las misiones se abren solas al avanzar. |
| **Interrogatorios + Posiciones** | Entre cada ronda. |
| **Votación** | Cada quien **emite su voto** en su teléfono (no se puede cambiar). Cuando todos votaron, di **"¡revelen!"** y muestran su voto. Ves el conteo en vivo. |
| **Revelación** | Narras el desenlace: ¡fue **El Peps**! Su teléfono trae la confesión para que la lea de pie. |
| **Resultados** | La pantalla **calcula y muestra el ranking automáticamente** y corona al ganador. |

---

## 6. Cómo se ganan los puntos

- **Misiones cumplidas:** +1 cada una (cada quien las marca en su teléfono; se revelan por ronda).
- **Tu voto (acusación principal):** al **cómplice** = +5; a **El Peps** = +8 (viste el giro).
- **Segundo paso — encontrar al cómplice:** +5 si nombras al **cómplice** y tu voto principal **no** fue el cómplice. O sea: si votaste a El Peps, remátalo encontrando al cómplice (8+5 = la jugada ganadora); y si no le atinaste a ninguno, es tu segunda oportunidad para hallar al cómplice. Si ya habías votado al cómplice, esos puntos ya están contados (no se duplican), y **no** puedes reclamar a El Peps después.
- **Los culpables (El Peps y el cómplice) no votan de verdad:** su teléfono les dice "haz como que votas" para despistar. Cada uno **gana 100 puntos si NO lo descubren** (si menos del 25% lo señaló), y ganan de forma independiente. Su chamba toda la noche es no ser cazados.
- **Detectives certeros:** +3 si atinaron al cómplice o a El Peps.

La pantalla central suma todo sola y le devuelve a cada teléfono su total.

---

## 7. Consejos para que vuele

- **Sé teatral.** Lee la narración como tráiler de película: pausas, voces, drama.
- **Empuja la actuación.** Recuérdales que las misiones son medio actuadas: la risa nerviosa, sembrar sospechas, defenderse. Ahí está la diversión.
- **Los detectives mandan el ritmo:** que interroguen al frente para que todos escuchen.
- **El cómplice es el corazón del misterio:** tiene "tells" (manos pegajosas, risa nerviosa) que debe disimular. Los detectives los andan buscando.
- **Guárdate el giro.** Que nadie sepa que El Peps es el culpable hasta la revelación.

---

## 8. Si algo falla

- **No aparece "En vivo":** revisa que pegaste bien la config en `firebase-config.js` (sobre todo `databaseURL`) y que subiste el cambio.
- **Un teléfono no se conecta:** que verifique que escribió bien el código de la partida (el que pusiste en la pantalla) y que tenga internet. Puede recargar la página; sus datos se guardan.
- **Quieres empezar de cero:** tienes dos formas. (1) Botón **🔁 Reiniciar la partida** en la pantalla central (borra votos y puntajes y limpia los teléfonos solos). (2) **Cambiar el nombre de la partida** y crear una sala nueva; si reutilizas un nombre que ya existe, te pregunta si lo quieres sobrescribir y lo borra por ti. Ya no necesitas entrar a Firebase a mano.
- **Sin WiFi de plano:** el juego sigue funcionando en *modo prueba* (cartas y misiones). En ese caso, el conteo final se hace a mano: cada quien suma sus puntos en su teléfono y preguntas en voz alta quién ganó.

¡Que se diviertan! 🎂🪩
