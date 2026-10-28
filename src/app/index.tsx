import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const LISTA_FILOSOFIA = [
  "«Aerodinámicamente, el cuerpo de una abeja no está hecho para volar; lo bueno es que la abeja no lo sabe.»",
  "«No te desesperes, antes tenías menos.»",
  "«Tienes poder sobre tu mente, no sobre lo que sucede a tu alrededor. Comprende esto y encontrarás la fortaleza.» — Marco Aurelio",
  "«¿Cómo no te desesperaste si no avanzabas? — Porque lo entrené.»",
  "«El éxito significa ir de fracaso en fracaso sin perder el entusiasmo.»",
  "«Nunca te sentirás listo, porque estar listo no es un sentimiento. Es una decisión.»",
  "«La mayoría de la gente te dirá que pares porque ellos no pueden seguir. No confíes en sus límites, confía en tu capacidad de sufrir. Al final del día es tu mente contra ti, nadie más cuenta.» — David Goggins",
  "«Tuve que inventar un tipo que ni siquiera existía.» — David Goggins",
  "«Tu mínimo es el máximo de alguien. Tu máximo es el mínimo de alguien.»",
  "«Recuerda que la vida te hace perder, para ver si de verdad quieres ganar.»",
  "«Toqué tantas veces fondo que, cada vez que bajo, ya sé que mañana subiré.» — Jorge Luis Borges",
  "«La comodidad mata los sueños.» — Nahuel Sandoval",
  "«En condiciones de paz, el hombre de guerra se ataca a sí mismo.» — Friedrich Nietzsche",
  "«Renunciar a los placeres temporales para construir algo grande no es perderse nada.»",
  "«Domina tu mente, sé el hombre más disciplinado que haya existido en mi entorno. Que nadie, ni mis impulsos ni mi pasado, decida por mí.» — Nahuel Sandoval",
  "«Si le pides a Dios ganar un maratón, te enviará un par de zapatos, no una medalla.»",
  "«Ese antojo no te hizo perder músculo o engordar, pero sí te recordó que aún no dominas tu mente.»",
  "«Cuando la cabeza dice que pares, estás en un 40% de tu verdadero potencial.» — David Goggins",
  "«¿Quién sos cuando nadie te está mirando?»",
  "«El día que el hombre supere sus deseos y adicciones, ese día el hombre se vuelve libre de verdad para lograr cosas increíbles y conocer su verdadero potencial.»",
  "«No pares, no te conformes y cada día aunque te sientas bien. Busca un punto para mejorar.» — Nahuel Sandoval",
  "«Si Dios puede quitarte algo que nunca imaginaste perder, también puede darte algo que nunca imaginaste tener.»",
];

const FRASES_GOGGINS_SUCCESS = [
  "Stay Hard! Te estás volviendo imparable.",
  "Estás construyendo callos en la mente. ¡Sigue empujando!",
  "Rompiendo tus propios límites. ¡Eso es mentalidad de 1%!",
  "No paren cuando estén cansados, paren cuando hayan TERMINADO.",
  "La única persona en el espejo puede frenarte. ¡Bien hecho!",
  "Dominio absoluto de la corteza prefrontal. ¡Imparable!",
];

const FRASES_GOGGINS_FAIL = [
  "¿En serio? ¿Sos una perra o querés cambiar?",
  "¡Puras excusas! Tu sistema límbico te está gobernando.",
  "Nadie viene a salvarte. ¡Levantate y hacé lo que tenés que hacer!",
  "¿Realmente querías mejorar o era mentira?",
  "Estás cómodo y por eso estás perdiendo. ¡Stay Hard!",
  "Deja de llorar y ponete a trabajar. ¡Media pila!",
  "El dolor es temporal. Tu mediocridad si sigues así será eterna.",
];

const RANGOS_GOGGINS = [
  {
    nivel: 1,
    meta: 50,
    nombre: "NIVEL 1: ZONA DE CONFORT",
    desc: "Meta: 50%",
    img: require("../../assets/images/goggins_lvl1.png"),
  },
  {
    nivel: 2,
    meta: 60,
    nombre: "NIVEL 2: ESTABLECIENDO BASES",
    desc: "Meta: 60%",
    img: require("../../assets/images/goggins_lvl2.png"),
  },
  {
    nivel: 3,
    meta: 70,
    nombre: "NIVEL 3: CALLOUS YOUR MIND",
    desc: "Meta: 70%",
    img: require("../../assets/images/goggins_lvl3.png"),
  },
  {
    nivel: 4,
    meta: 80,
    nombre: "NIVEL 4: EL 1% MÁS DURO",
    desc: "Meta: 80%",
    img: require("../../assets/images/goggins_lvl4.png"),
  },
  {
    nivel: 5,
    meta: 90,
    nombre: "NIVEL MAX: STAY HARD!",
    desc: "Meta: 90%",
    img: require("../../assets/images/goggins_lvl5.png"),
  },
];

interface Habito {
  id: number;
  nombre: string;
  checks: (string | null)[];
}

interface Rango {
  nivel: number;
  meta: number;
  nombre: string;
  desc: string;
  img: any;
}

const obtenerNumeroSemana = (d: Date) => {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    ) + 1
  );
};

export default function App() {
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [fraseActual, setFraseActual] = useState<string>(LISTA_FILOSOFIA[0]);
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const [modalAyudaVisible, setModalAyudaVisible] = useState<boolean>(false);
  const [modalNuevoHabito, setModalNuevoHabito] = useState<boolean>(false);
  const [nombreNuevoHabito, setNombreNuevoHabito] = useState<string>("");
  const [modalGogginsVisible, setModalGogginsVisible] =
    useState<boolean>(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<any>(null);

  const [modalRangosVisible, setModalRangosVisible] = useState<boolean>(false);
  const [modalHistorialVisible, setModalHistorialVisible] =
    useState<boolean>(false);
  const [modalSemanaVisible, setModalSemanaVisible] = useState<boolean>(false);
  const [modalMeditacionVisible, setModalMeditacionVisible] =
    useState<boolean>(false);
  const [modalAlertaLimbicaVisible, setModalAlertaLimbicaVisible] =
    useState<boolean>(false);
  const [modalAscensoVisible, setModalAscensoVisible] =
    useState<boolean>(false);
  const [mensajeAscenso, setMensajeAscenso] = useState<string>("");

  const [habitoSeleccionadoTexto, setHabitoSeleccionadoTexto] = useState<
    string | null
  >(null);

  const [minutosMeditacion, setMinutosMeditacion] = useState<string>("5");
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [meditando, setMeditando] = useState<boolean>(false);

  const animPrefrontal = useRef(new Animated.Value(0)).current;
  const animLimbico = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    verificarYReiniciarSemana();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (meditando && tiempoRestante > 0) {
      interval = setInterval(() => setTiempoRestante((prev) => prev - 1), 1000);
    } else if (tiempoRestante === 0 && meditando) {
      setMeditando(false);
      Vibration.vibrate([0, 600, 200, 600, 200, 1000]);
      Alert.alert(
        "🔔 ¡CAMPANA TIBETANA (432Hz)! 🔔",
        "Sesión de meditación concluida. Abrí los ojos y volvé al ruedo. Stay Hard! 💀",
      );
    }
    return () => clearInterval(interval);
  }, [meditando, tiempoRestante]);

  const iniciarMeditacion = () => {
    const mins = parseInt(minutosMeditacion) || 5;
    setTiempoRestante(mins * 60);
    setMeditando(true);
  };

  const formatearTiempo = (segundos: number) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const verificarYReiniciarSemana = async () => {
    try {
      const stored = await AsyncStorage.getItem("NEURO_HABITS_MOBILE_V22");
      const ultimaSemanaGuardada = await AsyncStorage.getItem(
        "NEURO_HABITS_ULTIMA_SEMANA",
      );
      const nivelActualStr =
        (await AsyncStorage.getItem("NEURO_HABITS_NIVEL")) || "1";

      const semanaActual = obtenerNumeroSemana(new Date());

      if (stored) {
        let parsedHabitos: Habito[] = JSON.parse(stored);

        if (
          ultimaSemanaGuardada &&
          parseInt(ultimaSemanaGuardada) !== semanaActual
        ) {
          const totalChecks = parsedHabitos.length * 7;
          let cumplidos = 0;
          parsedHabitos.forEach((h: Habito) => {
            cumplidos += h.checks.filter(
              (c: string | null) => c === "YES",
            ).length;
          });
          const pctPrefrontalSemana =
            totalChecks > 0 ? Math.round((cumplidos / totalChecks) * 100) : 0;

          let nivelNum = parseInt(nivelActualStr);
          if (pctPrefrontalSemana >= 50 && nivelNum < 5) {
            nivelNum += 1;
            await AsyncStorage.setItem(
              "NEURO_HABITS_NIVEL",
              nivelNum.toString(),
            );
            const nuevoRango = RANGOS_GOGGINS.find((r) => r.nivel === nivelNum);
            setMensajeAscenso(
              `¡Felicidades! Lograsiste un ${pctPrefrontalSemana}% de disciplina prefrontal la semana pasada. Te volviste más malditamente duro. ¡Ahora sos ${nuevoRango?.nombre}!\n\nLos hábitos continúan, los ticks se reiniciaron. ¡A seguir sufriendo! 💀🔥`,
            );
            setModalAscensoVisible(true);
          } else {
            setMensajeAscenso(
              `Comenzó una nueva semana. Tu rendimiento anterior fue de ${pctPrefrontalSemana}%. Los hábitos siguen en pie, ¡es hora de revalidar tu dureza mental!`,
            );
            setModalAscensoVisible(true);
          }

          parsedHabitos = parsedHabitos.map((h: Habito) => ({
            ...h,
            checks: [null, null, null, null, null, null, null],
          }));
        }

        setHabitos(parsedHabitos);
        actualizarAnimacionCerebro(parsedHabitos);
      } else {
        setHabitos([]);
        actualizarAnimacionCerebro([]);
      }

      await AsyncStorage.setItem(
        "NEURO_HABITS_ULTIMA_SEMANA",
        semanaActual.toString(),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const guardarYActualizar = async (nuevosHabitos: Habito[]) => {
    setHabitos(nuevosHabitos);
    actualizarAnimacionCerebro(nuevosHabitos);
    try {
      await AsyncStorage.setItem(
        "NEURO_HABITS_MOBILE_V22",
        JSON.stringify(nuevosHabitos),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const actualizarAnimacionCerebro = async (listaHabitos: Habito[]) => {
    const totalChecks = listaHabitos.length * 7;
    let cumplidos = 0;
    let fallados = 0;

    listaHabitos.forEach((h: Habito) => {
      cumplidos += h.checks.filter((c: string | null) => c === "YES").length;
      fallados += h.checks.filter((c: string | null) => c === "NO").length;
    });

    const targetPrefrontal =
      totalChecks > 0 ? Math.min(cumplidos / totalChecks, 1) : 0;
    const targetLimbico =
      totalChecks > 0 ? Math.min(fallados / totalChecks, 1) : 0;

    Animated.parallel([
      Animated.timing(animPrefrontal, {
        toValue: targetPrefrontal,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(animLimbico, {
        toValue: targetLimbico,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    if (fallados > cumplidos && fallados >= 3) {
      try {
        const hoyKey = new Date().toISOString().split("T")[0];
        const yaMostradaHoy = await AsyncStorage.getItem(
          `NEURO_ALERTA_${hoyKey}`,
        );
        if (!yaMostradaHoy) {
          setModalAlertaLimbicaVisible(true);
          await AsyncStorage.setItem(`NEURO_ALERTA_${hoyKey}`, "true");
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const calcularRachaHabito = (checks: (string | null)[]) => {
    let racha = 0;
    const diaActualIndex =
      new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    for (let i = diaActualIndex; i >= 0; i--) {
      if (checks[i] === "YES") {
        racha++;
      } else if (i !== diaActualIndex) {
        break;
      }
    }
    return racha;
  };

  const manejarClickCelda = (hIdx: number, dIdx: number) => {
    const nuevos = [...habitos];
    const actual = nuevos[hIdx].checks[dIdx];

    if (actual === null) {
      nuevos[hIdx].checks[dIdx] = "YES";
      const frase =
        FRASES_GOGGINS_SUCCESS[
          Math.floor(Math.random() * FRASES_GOGGINS_SUCCESS.length)
        ];
      setFraseActual(`"${frase}"`);
    } else if (actual === "YES") {
      nuevos[hIdx].checks[dIdx] = "NO";
      const frase =
        FRASES_GOGGINS_FAIL[
          Math.floor(Math.random() * FRASES_GOGGINS_FAIL.length)
        ];
      setFraseActual(`"${frase}"`);
    } else {
      nuevos[hIdx].checks[dIdx] = null;
    }

    guardarYActualizar(nuevos);
  };

  const cambiarFraseAleatoria = () => {
    const idx = Math.floor(Math.random() * LISTA_FILOSOFIA.length);
    setFraseActual(LISTA_FILOSOFIA[idx]);
  };

  const agregarHabito = () => {
    if (nombreNuevoHabito.trim() === "") return;
    const nuevos = [
      ...habitos,
      {
        id: Date.now(),
        nombre: nombreNuevoHabito.trim(),
        checks: [null, null, null, null, null, null, null],
      },
    ];
    guardarYActualizar(nuevos);
    setNombreNuevoHabito("");
    setModalNuevoHabito(false);
  };

  const confirmarEliminarHabito = (hIdx: number) => {
    Alert.alert(
      "Eliminar Hábito",
      "¿Estás seguro de que querés borrar este hábito?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, borrar",
          style: "destructive",
          onPress: () => {
            const nuevos = habitos.filter((_, idx: number) => idx !== hIdx);
            guardarYActualizar(nuevos);
          },
        },
      ],
    );
  };

  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  const mesActual = hoy.getMonth();
  const totalDiasMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const nombreMes = hoy.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const totalChecks = habitos.length * 7;
  let cumplidos = 0;
  let fallados = 0;
  habitos.forEach((h: Habito) => {
    cumplidos += h.checks.filter((c: string | null) => c === "YES").length;
    fallados += h.checks.filter((c: string | null) => c === "NO").length;
  });

  const pctPrefrontal =
    totalChecks > 0 ? Math.round((cumplidos / totalChecks) * 100) : 0;
  const pctLimbico =
    totalChecks > 0 ? Math.round((fallados / totalChecks) * 100) : 0;

  const esHellWeek = pctLimbico > pctPrefrontal && pctLimbico > 30;

  return (
    <View
      style={[
        styles.mainContainer,
        esHellWeek && { backgroundColor: "#140505" },
      ]}
    >
      <View
        style={[styles.header, esHellWeek && { borderBottomColor: "#ff0055" }]}
      >
        <TouchableOpacity
          onPress={() => setMenuAbierto(true)}
          style={styles.menuButton}
        >
          <Text style={[styles.menuIcon, esHellWeek && { color: "#ff0055" }]}>
            ☰
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={[styles.title, esHellWeek && { color: "#ff0055" }]}>
            NEURO HABITS
          </Text>
          <Text style={[styles.subtitle, esHellWeek && { color: "#ff88aa" }]}>
            created by sandev
          </Text>
        </View>

        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.container}>
        <View
          style={[
            styles.streakCard,
            esHellWeek && {
              borderColor: "#ff0055",
              backgroundColor: "#1f1012",
            },
          ]}
        >
          <Text style={[styles.streakText, esHellWeek && { color: "#ffccd5" }]}>
            🔥 Racha Prefrontal:{" "}
            <Text style={{ color: esHellWeek ? "#00ff66" : "#00f0ff" }}>
              {pctPrefrontal}% Dominio
            </Text>
          </Text>
          <Text
            style={[styles.streakSubText, esHellWeek && { color: "#ff99bb" }]}
          >
            {esHellWeek
              ? "⚠️ MODO HELL WEEK ACTIVADO: ¡Pelea contra tu sistema límbico!"
              : "Mantén la disciplina al máximo. Stay Hard!"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.quoteCard,
            esHellWeek && {
              backgroundColor: "#1c090b",
              borderLeftColor: "#ff0055",
            },
          ]}
          onPress={cambiarFraseAleatoria}
        >
          <Text style={[styles.quoteText, esHellWeek && { color: "#ffccd5" }]}>
            {fraseActual}
          </Text>
          <Text style={[styles.quoteHint, esHellWeek && { color: "#ff99bb" }]}>
            Toca para cambiar frase 🔄
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.brainCard,
            esHellWeek && { backgroundColor: "#1a080a" },
          ]}
        >
          <View style={styles.brainHeader}>
            <Text
              style={[styles.brainTitle, esHellWeek && { color: "#ffccd5" }]}
            >
              🧠 Respuesta Neuroquímica
            </Text>
            <TouchableOpacity onPress={() => setModalAyudaVisible(true)}>
              <Text
                style={[
                  styles.smallQuestion,
                  esHellWeek && { color: "#ff0055" },
                ]}
              >
                ?
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.brainImageContainer}>
            <Image
              source={require("../../assets/images/brain_base.png")}
              style={styles.brainImage}
            />
            <Animated.Image
              source={require("../../assets/images/brain_prefrontal.png")}
              style={[styles.brainOverlay, { opacity: animPrefrontal }]}
            />
            <Animated.Image
              source={require("../../assets/images/brain_limbico.png")}
              style={[styles.brainOverlay, { opacity: animLimbico }]}
            />
          </View>

          <View style={styles.brainStatsBox}>
            <Text
              style={[styles.brainStatText, esHellWeek && { color: "#ffccd5" }]}
            >
              Mejoraste tu corteza prefrontal:{" "}
              <Text style={{ color: esHellWeek ? "#00ff66" : "#00f0ff" }}>
                {pctPrefrontal}%
              </Text>
            </Text>
            <Text
              style={[styles.brainStatText, esHellWeek && { color: "#ffccd5" }]}
            >
              Tu sistema límbico aumentó:{" "}
              <Text style={{ color: "#ff0055" }}>{pctLimbico}%</Text>
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.btnAddHabit,
            esHellWeek && {
              borderColor: "#ff0055",
              backgroundColor: "#1f1012",
            },
          ]}
          onPress={() => setModalNuevoHabito(true)}
        >
          <Text
            style={[styles.btnAddHabitText, esHellWeek && { color: "#ff0055" }]}
          >
            + Nuevo Hábito
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.tableContainer,
            esHellWeek && { backgroundColor: "#1a080a" },
          ]}
        >
          <View style={styles.tableHeader}>
            <Text
              style={[
                styles.headerCell,
                { flex: 2 },
                esHellWeek && { color: "#ff99bb" },
              ]}
            >
              Hábitos & Rachas
            </Text>
            {DIAS.map((d: string, i: number) => (
              <Text
                key={i}
                style={[styles.headerDay, esHellWeek && { color: "#ff99bb" }]}
              >
                {d}
              </Text>
            ))}
          </View>

          {habitos.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay hábitos. ¡Agregá uno con el botón de arriba!
            </Text>
          ) : (
            habitos.map((h: Habito, hIdx: number) => {
              const racha = calcularRachaHabito(h.checks);
              return (
                <View key={h.id} style={styles.tableRow}>
                  <TouchableOpacity
                    style={{ flex: 2 }}
                    onPress={() => setHabitoSeleccionadoTexto(h.nombre)}
                  >
                    <Text
                      style={[
                        styles.habitoNombre,
                        esHellWeek && { color: "#fff" },
                      ]}
                      numberOfLines={1}
                    >
                      {h.nombre}
                    </Text>
                    {racha > 0 && (
                      <Text style={{ color: "#00ff66", fontSize: 9 }}>
                        🔥 Racha: {racha} días
                      </Text>
                    )}
                  </TouchableOpacity>

                  {h.checks.map((chk: string | null, dIdx: number) => {
                    let cellStyle: any = styles.cell;
                    let simbol = "";

                    if (chk === "YES") {
                      cellStyle = [
                        styles.cell,
                        styles.cellYes,
                        esHellWeek && {
                          backgroundColor: "rgba(0, 255, 102, 0.25)",
                          borderColor: "#00ff66",
                        },
                      ];
                      simbol = "✔";
                    } else if (chk === "NO") {
                      cellStyle = [styles.cell, styles.cellNo];
                      simbol = "✖";
                    }

                    return (
                      <TouchableOpacity
                        key={dIdx}
                        style={cellStyle}
                        onPress={() => manejarClickCelda(hIdx, dIdx)}
                      >
                        <Text
                          style={[
                            styles.cellText,
                            esHellWeek && chk === "YES" && { color: "#00ff66" },
                          ]}
                        >
                          {simbol}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    onPress={() => confirmarEliminarHabito(hIdx)}
                    style={{ paddingLeft: 6 }}
                  >
                    <Text style={{ color: "#ff0055", fontWeight: "bold" }}>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <Text
          style={[styles.instructionFooter, esHellWeek && { color: "#ff99bb" }]}
        >
          💡 Toca un hábito largo para leerlo completo | 1 toque: (✔) | 2
          toques: (✖)
        </Text>
      </ScrollView>

      {/* MODAL PARA VER TEXTO LARGO */}
      <Modal
        visible={habitoSeleccionadoTexto !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setHabitoSeleccionadoTexto(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHabitoSeleccionadoTexto(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <Text
              style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
            >
              📌 Detalle del Hábito:
            </Text>
            <ScrollView style={{ maxHeight: 150, marginBottom: 15 }}>
              <Text style={{ color: "#fff", fontSize: 15, lineHeight: 22 }}>
                {habitoSeleccionadoTexto}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setHabitoSeleccionadoTexto(null)}
              style={[
                styles.closeBtnModal,
                esHellWeek && { backgroundColor: "#1f1012" },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>CERRAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DE ASCENSO DE RANGO SEMANAL */}
      <Modal
        visible={modalAscensoVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalAscensoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalAscensoVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContentGrande, { borderColor: "#00f0ff" }]}
          >
            <Text
              style={{
                color: "#00f0ff",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              🏆 ¡REPORTE SEMANAL & ASCENSO!
            </Text>
            <Text
              style={{
                color: "#e2e8f0",
                fontSize: 13,
                lineHeight: 20,
                marginBottom: 20,
              }}
            >
              {mensajeAscenso}
            </Text>
            <TouchableOpacity
              onPress={() => setModalAscensoVisible(false)}
              style={[styles.closeBtnModal, { backgroundColor: "#00f0ff" }]}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                ¡ENTENDIDO, A SEGUIR SUFRIENDO!
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MENÚ HAMBURGUESA LATERAL */}
      <Modal
        visible={menuAbierto}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuAbierto(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setMenuAbierto(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.drawerContent,
              esHellWeek && {
                backgroundColor: "#140505",
                borderColor: "#ff0055",
                borderRightWidth: 1,
              },
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text
                style={[styles.drawerTitle, esHellWeek && { color: "#ff0055" }]}
              >
                ⚡ Menú & Opciones
              </Text>
              <TouchableOpacity onPress={() => setMenuAbierto(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <TouchableOpacity
                style={[
                  styles.menuItemBtn,
                  esHellWeek && {
                    backgroundColor: "#1f1012",
                    borderColor: "#ff0055",
                  },
                ]}
                onPress={() => {
                  setMenuAbierto(false);
                  setModalRangosVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    esHellWeek && { color: "#ff0055" },
                  ]}
                >
                  🏆 Progreso de Rangos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItemBtn,
                  esHellWeek && {
                    backgroundColor: "#1f1012",
                    borderColor: "#ff0055",
                  },
                ]}
                onPress={() => {
                  setMenuAbierto(false);
                  setModalHistorialVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    esHellWeek && { color: "#ff0055" },
                  ]}
                >
                  📜 Historial & Mapa de Calor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItemBtn,
                  esHellWeek && {
                    backgroundColor: "#1f1012",
                    borderColor: "#ff0055",
                  },
                ]}
                onPress={() => {
                  setMenuAbierto(false);
                  setModalSemanaVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    esHellWeek && { color: "#ff0055" },
                  ]}
                >
                  📊 Rendimiento Semana Pasada
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItemBtn,
                  esHellWeek && {
                    backgroundColor: "#1f1012",
                    borderColor: "#ff0055",
                  },
                ]}
                onPress={() => {
                  setMenuAbierto(false);
                  setModalMeditacionVisible(true);
                }}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    esHellWeek && { color: "#ff0055" },
                  ]}
                >
                  🧘‍♂️ Módulo de Meditación
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 1: PROGRESO DE RANGOS */}
      <Modal
        visible={modalRangosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalRangosVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalRangosVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
              >
                🏆 Progreso de Rangos
              </Text>
              <TouchableOpacity onPress={() => setModalRangosVisible(false)}>
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {RANGOS_GOGGINS.map((r: Rango) => (
                <TouchableOpacity
                  key={r.nivel}
                  style={[
                    styles.rangoItem,
                    esHellWeek && { backgroundColor: "#1f1012" },
                  ]}
                  onPress={() => {
                    setFotoSeleccionada(r.img);
                    setModalGogginsVisible(true);
                  }}
                >
                  <Text
                    style={[
                      styles.rangoNombre,
                      esHellWeek && { color: "#ff0055" },
                    ]}
                  >
                    {r.nombre}
                  </Text>
                  <Text style={styles.rangoDesc}>
                    {r.desc} (Requiere {r.meta}% prefrontal)
                  </Text>
                  <Image source={r.img} style={styles.rangoMiniImg} />
                  <Text style={{ color: "#64748b", fontSize: 9, marginTop: 4 }}>
                    Toca para ver en grande 🔍
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 2: HISTORIAL Y MAPA DE CALOR */}
      <Modal
        visible={modalHistorialVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalHistorialVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalHistorialVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
              >
                📜 Mapa de Calor ({nombreMes})
              </Text>
              <TouchableOpacity onPress={() => setModalHistorialVisible(false)}>
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{ alignItems: "center", marginBottom: 15 }}>
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#00ff66",
                      marginRight: 4,
                    }}
                  />
                  <Text
                    style={{ color: "#94a3b8", fontSize: 10, marginRight: 15 }}
                  >
                    Estable / Cumplido
                  </Text>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: "#ff0055",
                      marginRight: 4,
                    }}
                  />
                  <Text style={{ color: "#94a3b8", fontSize: 10 }}>
                    Fallado / Límbico
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 15,
                }}
              >
                {Array.from({ length: totalDiasMes }, (_, i) => i + 1).map(
                  (dia: number) => {
                    const esHoy = dia === hoy.getDate();
                    const bg = esHoy
                      ? pctPrefrontal >= pctLimbico
                        ? "#00ff66"
                        : "#ff0055"
                      : dia < hoy.getDate()
                        ? "#1f2937"
                        : "#111827";
                    const textColor = esHoy ? "#000" : "#94a3b8";
                    return (
                      <View
                        key={dia}
                        style={{
                          width: 38,
                          height: 38,
                          backgroundColor: bg,
                          borderRadius: 6,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: esHoy ? 2 : 0,
                          borderColor: "#fff",
                        }}
                      >
                        <Text
                          style={{
                            color: textColor,
                            fontWeight: "bold",
                            fontSize: 11,
                          }}
                        >
                          {dia}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 3: RENDIMIENTO SEMANA PASADA */}
      <Modal
        visible={modalSemanaVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalSemanaVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalSemanaVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
              >
                📊 Rendimiento Semana Anterior
              </Text>
              <TouchableOpacity onPress={() => setModalSemanaVisible(false)}>
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <Text
                style={[
                  styles.modalTitle,
                  { fontSize: 13, marginBottom: 10 },
                  esHellWeek && { color: "#ff0055" },
                ]}
              >
                Dominio prefrontal general: {pctPrefrontal}%
              </Text>
              {habitos.length === 0 ? (
                <Text style={{ color: "#64748b", fontSize: 12 }}>
                  No hay hábitos registrados.
                </Text>
              ) : (
                habitos.map((h: Habito) => {
                  const cumplidosH = h.checks.filter(
                    (c: string | null) => c === "YES",
                  ).length;
                  return (
                    <Text
                      key={h.id}
                      style={{
                        color: "#d1d5db",
                        fontSize: 12,
                        marginBottom: 6,
                      }}
                    >
                      • {h.nombre}:{" "}
                      <Text
                        style={{
                          color: esHellWeek ? "#00ff66" : "#00f0ff",
                          fontWeight: "bold",
                        }}
                      >
                        {cumplidosH}/7 días cumplidos
                      </Text>
                    </Text>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 4: MÓDULO DE MEDITACIÓN */}
      <Modal
        visible={modalMeditacionVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setMeditando(false);
          setModalMeditacionVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setMeditando(false);
            setModalMeditacionVisible(false);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              { alignItems: "center" },
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
              >
                🧘‍♂️ Módulo de Meditación
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMeditando(false);
                  setModalMeditacionVisible(false);
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.timerCircle,
                esHellWeek && { borderColor: "#ff0055" },
              ]}
            >
              <Text
                style={[styles.timerText, esHellWeek && { color: "#ff0055" }]}
              >
                {meditando
                  ? formatearTiempo(tiempoRestante)
                  : `${minutosMeditacion}:00`}
              </Text>
            </View>

            <View style={{ width: "100%", marginBottom: 15 }}>
              <Text style={{ color: "#94a3b8", fontSize: 12, marginBottom: 5 }}>
                ⏱️ Duración (min):
              </Text>
              <TextInput
                style={styles.inputModal}
                keyboardType="numeric"
                value={minutosMeditacion}
                onChangeText={setMinutosMeditacion}
                editable={!meditando}
              />
            </View>

            <TouchableOpacity
              onPress={
                meditando ? () => setMeditando(false) : iniciarMeditacion
              }
              style={[
                styles.closeBtnModal,
                {
                  backgroundColor: meditando
                    ? "#ff0055"
                    : esHellWeek
                      ? "#ff0055"
                      : "#00f0ff",
                  width: "100%",
                },
              ]}
            >
              <Text
                style={{
                  color: meditando ? "#fff" : "#000",
                  fontWeight: "bold",
                }}
              >
                {meditando ? "Pausar Meditación" : "▶ Iniciar Meditación"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL ADVERTENCIA MODO LÍMBICO */}
      <Modal
        visible={modalAlertaLimbicaVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalAlertaLimbicaVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalAlertaLimbicaVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalContentGrande, { borderColor: "#ff0055" }]}
          >
            <Text
              style={{
                color: "#ff0055",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              ⚠️ ¡ALERTA DE SISTEMA LÍMBICO!
            </Text>
            <Text
              style={{
                color: "#e2e8f0",
                fontSize: 12,
                lineHeight: 18,
                marginBottom: 15,
              }}
            >
              Estás acumulando demasiados fallos. La comodidad te está ganando.
              ¿En serio vas a dejar que tus impulsos ganen hoy? ¡Levantate y
              cambiá el rumbo ahora mismo! Stay Hard! 💀
            </Text>
            <TouchableOpacity
              onPress={() => setModalAlertaLimbicaVisible(false)}
              style={[styles.closeBtnModal, { backgroundColor: "#ff0055" }]}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                ACEPTO EL RETO
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL FOTO GOGGINS GRANDE */}
      <Modal
        visible={modalGogginsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalGogginsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalGogginsVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              { alignItems: "center" },
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <Text
              style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
            >
              STAY HARD 💀
            </Text>
            {fotoSeleccionada && (
              <Image
                source={fotoSeleccionada}
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 8,
                  marginBottom: 15,
                }}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity
              onPress={() => setModalGogginsVisible(false)}
              style={styles.closeBtnModal}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>CERRAR</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* MODAL NUEVO HÁBITO */}
      <Modal
        visible={modalNuevoHabito}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalNuevoHabito(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalContentGrande,
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <Text
              style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
            >
              Crear Nuevo Hábito
            </Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: Entrenar / Boxeo"
              placeholderTextColor="#64748b"
              value={nombreNuevoHabito}
              onChangeText={setNombreNuevoHabito}
              autoFocus={true}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                onPress={() => setModalNuevoHabito(false)}
                style={[
                  styles.closeBtnModal,
                  { backgroundColor: "#1f2937", flex: 1, marginRight: 5 },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  CANCELAR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={agregarHabito}
                style={[
                  styles.closeBtnModal,
                  {
                    backgroundColor: esHellWeek ? "#ff0055" : "#00f0ff",
                    flex: 1,
                    marginLeft: 5,
                  },
                ]}
              >
                <Text
                  style={{
                    color: esHellWeek ? "#fff" : "#000",
                    fontWeight: "bold",
                  }}
                >
                  GUARDAR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL AYUDA */}
      <Modal
        visible={modalAyudaVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalAyudaVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalAyudaVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[
              styles.modalContentGrande,
              { maxHeight: "85%" },
              esHellWeek && { borderColor: "#ff0055" },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={[styles.modalTitle, esHellWeek && { color: "#ff0055" }]}
              >
                🧠 Neurociencia de tus Hábitos
              </Text>
              <TouchableOpacity onPress={() => setModalAyudaVisible(false)}>
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: esHellWeek ? "#00ff66" : "#00f0ff",
                  fontWeight: "bold",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                🔵 Corteza Prefrontal (Disciplina y Evolución)
              </Text>
              <Text
                style={{
                  color: "#d1d5db",
                  fontSize: 11,
                  lineHeight: 15,
                  marginBottom: 10,
                }}
              >
                Es la región más avanzada del cerebro humano. Se encarga de la
                planificación a largo plazo, el autocontrol y la fuerza de
                voluntad.
              </Text>

              <Text
                style={{
                  color: "#ff0055",
                  fontWeight: "bold",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                🔴 Sistema Límbico (Instinto y Comodidad)
              </Text>
              <Text
                style={{
                  color: "#d1d5db",
                  fontSize: 11,
                  lineHeight: 15,
                  marginBottom: 15,
                }}
              >
                El centro emocional primitivo del cerebro. Busca el placer
                inmediato y evita el esfuerzo (zona de confort).
              </Text>

              <View
                style={{
                  height: 2,
                  backgroundColor: "#ff0055",
                  width: "100%",
                  marginBottom: 15,
                }}
              />

              <Text
                style={{
                  color: "#ff0055",
                  fontWeight: "bold",
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                🔥 SEMANA HELL WEEK (SEMANA DEL INFIERNO)
              </Text>
              <Text
                style={{
                  color: "#d1d5db",
                  fontSize: 11,
                  lineHeight: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "bold", color: "#fff" }}>
                  ¿Qué es?
                </Text>{" "}
                Inspirada en el entrenamiento límite de los Navy SEALs y
                popularizada por David Goggins, es el estado de combate mental
                extremo donde te enfrentas cara a cara con tu debilidad.
              </Text>
              <Text
                style={{
                  color: "#d1d5db",
                  fontSize: 11,
                  lineHeight: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontWeight: "bold", color: "#fff" }}>
                  ¿Por qué se activa?
                </Text>{" "}
                La app la enciende automáticamente cuando acumulas más fallos
                (✖) que aciertos (✔), superando el 30% de dominancia de tu
                sistema límbico. Te avisa que estás cayendo en la comodidad.
              </Text>
              <Text
                style={{
                  color: "#d1d5db",
                  fontSize: 11,
                  lineHeight: 16,
                  marginBottom: 15,
                }}
              >
                <Text style={{ fontWeight: "bold", color: "#fff" }}>
                  ¿Cómo salir de ella?
                </Text>{" "}
                No hay atajos ni excusas. Debes romper las cadenas del confort,
                cumplir tus hábitos diarios y lograr que tu dominio prefrontal
                vuelva a superar a tus fallos para que la app recupere su tono
                de disciplina óptima. ¡Stay Hard!
              </Text>

              <TouchableOpacity
                onPress={() => setModalAyudaVisible(false)}
                style={styles.closeBtnModal}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  ENTENDIDO
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#090d16" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: "#090d16",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  menuButton: { padding: 8 },
  menuIcon: { color: "#00f0ff", fontSize: 22 },
  headerTitles: { alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00f0ff",
    letterSpacing: 1,
  },
  subtitle: { fontSize: 10, color: "#94a3b8", letterSpacing: 2 },
  container: { flex: 1, padding: 16 },

  streakCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#00f0ff",
    marginBottom: 15,
    alignItems: "center",
  },
  streakText: { color: "#e2e8f0", fontSize: 12, fontWeight: "bold" },
  streakSubText: {
    color: "#64748b",
    fontSize: 9,
    textAlign: "center",
    marginTop: 2,
  },

  quoteCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#00f0ff",
    marginBottom: 15,
  },
  quoteText: {
    color: "#e2e8f0",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  quoteHint: {
    color: "#64748b",
    fontSize: 9,
    textAlign: "center",
    marginTop: 4,
  },
  brainCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
  },
  brainHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  brainTitle: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  smallQuestion: { color: "#00f0ff", fontWeight: "bold", fontSize: 14 },

  brainImageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
    backgroundColor: "#111827",
  },
  brainImage: { width: "100%", height: "100%", resizeMode: "cover" },
  brainOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  brainStatsBox: { width: "100%", alignItems: "center" },
  brainStatText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  btnAddHabit: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#00f0ff",
  },
  btnAddHabitText: { color: "#00f0ff", fontWeight: "bold", fontSize: 12 },
  tableContainer: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingBottom: 6,
    marginBottom: 6,
  },
  headerCell: { color: "#94a3b8", fontWeight: "bold", fontSize: 11 },
  headerDay: {
    flex: 1,
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: 11,
  },
  tableRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  habitoNombre: { flex: 2, color: "#fff", fontSize: 11, fontWeight: "600" },
  cell: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#1f2937",
    marginHorizontal: 2,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  cellYes: {
    backgroundColor: "rgba(0, 240, 255, 0.2)",
    borderColor: "#00f0ff",
    borderWidth: 1,
  },
  cellNo: {
    backgroundColor: "rgba(255, 0, 85, 0.2)",
    borderColor: "#ff0055",
    borderWidth: 1,
  },
  cellText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  emptyText: {
    color: "#64748b",
    textAlign: "center",
    padding: 15,
    fontSize: 12,
  },
  instructionFooter: {
    color: "#64748b",
    fontSize: 10,
    textAlign: "center",
    marginBottom: 30,
  },

  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-start",
  },
  drawerContent: {
    width: "80%",
    height: "100%",
    backgroundColor: "#111827",
    padding: 20,
    paddingTop: 50,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  drawerTitle: { color: "#00f0ff", fontSize: 18, fontWeight: "bold" },
  closeButton: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  menuItemBtn: {
    backgroundColor: "#1f2937",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  menuItemText: { color: "#00f0ff", fontSize: 13, fontWeight: "bold" },

  rangoItem: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: "center",
  },
  rangoNombre: {
    color: "#00f0ff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  rangoDesc: {
    color: "#94a3b8",
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
  },
  rangoMiniImg: { width: 70, height: 70, borderRadius: 4, marginTop: 6 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentGrande: {
    width: "88%",
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00f0ff",
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#00f0ff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputModal: {
    backgroundColor: "#1f2937",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  closeBtnModal: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },

  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "#00f0ff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#090d16",
  },
  timerText: { color: "#00f0ff", fontSize: 26, fontWeight: "bold" },
});
