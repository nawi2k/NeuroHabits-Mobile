import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function App() {
  const [habitos, setHabitos] = useState<any[]>([]);
  const [fraseActual, setFraseActual] = useState(LISTA_FILOSOFIA[0]);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAyudaVisible, setModalAyudaVisible] = useState(false);
  const [modalNuevoHabito, setModalNuevoHabito] = useState(false);
  const [nombreNuevoHabito, setNombreNuevoHabito] = useState("");
  const [modalGogginsVisible, setModalGogginsVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const stored = await AsyncStorage.getItem("NEURO_HABITS_MOBILE_V5");
      if (stored) {
        setHabitos(JSON.parse(stored));
      } else {
        setHabitos([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const guardarYActualizar = async (nuevosHabitos: any[]) => {
    setHabitos(nuevosHabitos);
    try {
      await AsyncStorage.setItem(
        "NEURO_HABITS_MOBILE_V5",
        JSON.stringify(nuevosHabitos),
      );
    } catch (e) {
      console.error(e);
    }
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

  const eliminarHabito = (hIdx: number) => {
    const nuevos = habitos.filter((_, idx) => idx !== hIdx);
    guardarYActualizar(nuevos);
  };

  const totalChecks = habitos.length * 7;
  let cumplidos = 0;
  let fallados = 0;
  habitos.forEach((h) => {
    cumplidos += h.checks.filter((c: string) => c === "YES").length;
    fallados += h.checks.filter((c: string) => c === "NO").length;
  });

  const pctPrefrontal =
    totalChecks > 0 ? Math.round((cumplidos / totalChecks) * 100) : 0;
  const pctLimbico =
    totalChecks > 0 ? Math.round((fallados / totalChecks) * 100) : 0;

  // Lógica de imágenes del cerebro según tu rendimiento
  let imagenCerebro = require("../../assets/images/brain_base.jpg");
  if (pctPrefrontal > pctLimbico && pctPrefrontal > 0) {
    imagenCerebro = require("../../assets/images/brain_prefrontal.jpg");
  } else if (pctLimbico > pctPrefrontal && pctLimbico > 0) {
    imagenCerebro = require("../../assets/images/brain_limbico.jpg");
  }

  return (
    <View style={styles.mainContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setMenuAbierto(true)}
          style={styles.menuButton}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.title}>NEURO HABITS</Text>
          <Text style={styles.subtitle}>created by sandev</Text>
        </View>

        <TouchableOpacity
          onPress={() => setModalAyudaVisible(true)}
          style={styles.helpButton}
        >
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* FRASES MOTIVACIONALES */}
        <TouchableOpacity
          style={styles.quoteCard}
          onPress={cambiarFraseAleatoria}
        >
          <Text style={styles.quoteText}>{fraseActual}</Text>
          <Text style={styles.quoteHint}>Toca para cambiar frase 🔄</Text>
        </TouchableOpacity>

        {/* SECCIÓN CEREBRO CON IMAGEN Y ESTADÍSTICAS ABAJO */}
        <View style={styles.brainCard}>
          <View style={styles.brainHeader}>
            <Text style={styles.brainTitle}>🧠 Respuesta Neuroquímica</Text>
            <TouchableOpacity onPress={() => setModalAyudaVisible(true)}>
              <Text style={styles.smallQuestion}>?</Text>
            </TouchableOpacity>
          </View>

          <Image source={imagenCerebro} style={styles.brainImage} />

          <View style={styles.brainStatsBox}>
            <Text style={styles.brainStatText}>
              Mejoraste tu corteza prefrontal:{" "}
              <Text style={{ color: "#00f0ff" }}>{pctPrefrontal}%</Text>
            </Text>
            <Text style={styles.brainStatText}>
              Tu sistema límbico aumentó:{" "}
              <Text style={{ color: "#ff0055" }}>{pctLimbico}%</Text>
            </Text>
          </View>
        </View>

        {/* BOTÓN NUEVO HÁBITO */}
        <TouchableOpacity
          style={styles.btnAddHabit}
          onPress={() => setModalNuevoHabito(true)}
        >
          <Text style={styles.btnAddHabitText}>+ Nuevo Hábito</Text>
        </TouchableOpacity>

        {/* PLANILLA DE HÁBITOS */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Hábitos</Text>
            {DIAS.map((d, i) => (
              <Text key={i} style={styles.headerDay}>
                {d}
              </Text>
            ))}
          </View>

          {habitos.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay hábitos. ¡Agregá uno con el botón de arriba!
            </Text>
          ) : (
            habitos.map((h, hIdx) => (
              <View key={h.id} style={styles.tableRow}>
                <Text style={styles.habitoNombre} numberOfLines={1}>
                  {h.nombre}
                </Text>
                {h.checks.map((chk: string | null, dIdx: number) => {
                  let cellStyle: any = styles.cell;
                  let simbol = "";

                  if (chk === "YES") {
                    cellStyle = [styles.cell, styles.cellYes];
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
                      <Text style={styles.cellText}>{simbol}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  onPress={() => eliminarHabito(hIdx)}
                  style={{ paddingLeft: 6 }}
                >
                  <Text style={{ color: "#ff0055", fontWeight: "bold" }}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Text style={styles.instructionFooter}>
          💡 1 toque: Cumplido (✔) | 2 toques: Fallado (✖) | 3 toques: Vacío
        </Text>
      </ScrollView>

      {/* MENÚ HAMBURGUESA LATERAL */}
      <Modal visible={menuAbierto} animationType="slide" transparent={true}>
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>⚡ Menú & Rangos</Text>
              <TouchableOpacity onPress={() => setMenuAbierto(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.sectionTitle}>🏆 Progreso de Rangos</Text>
              {RANGOS_GOGGINS.map((r) => (
                <TouchableOpacity
                  key={r.nivel}
                  style={styles.rangoItem}
                  onPress={() => {
                    setFotoSeleccionada(r.img);
                    setModalGogginsVisible(true);
                  }}
                >
                  <Text style={styles.rangoNombre}>{r.nombre}</Text>
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
          </View>
        </View>
      </Modal>

      {/* MODAL FOTO GOGGINS GRANDE */}
      <Modal
        visible={modalGogginsVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentGrande, { alignItems: "center" }]}>
            <Text
              style={{
                color: "#00f0ff",
                fontSize: 16,
                marginBottom: 10,
                fontWeight: "bold",
              }}
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
          </View>
        </View>
      </Modal>

      {/* MODAL NUEVO HÁBITO */}
      <Modal visible={modalNuevoHabito} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentGrande}>
            <Text style={styles.modalTitle}>Crear Nuevo Hábito</Text>
            <TextInput
              style={styles.inputModal}
              placeholder="Ej: Entrenar / Boxeo"
              placeholderTextColor="#64748b"
              value={nombreNuevoHabito}
              onChangeText={setNombreNuevoHabito}
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
                  { backgroundColor: "#00f0ff", flex: 1, marginLeft: 5 },
                ]}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                  GUARDAR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL AYUDA */}
      <Modal
        visible={modalAyudaVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentGrande}>
            <Text style={styles.modalTitle}>
              🧠 Corteza Prefrontal vs Sistema Límbico
            </Text>
            <Text style={styles.modalText}>
              • Corteza Prefrontal: Es la parte del cerebro de la disciplina, el
              foco y el cumplimiento de metas a largo plazo (✔).{"\n\n"}•
              Sistema Límbico: Es el que busca la comodidad, el placer inmediato
              y pone excusas (✖).{"\n\n"}
              Tu objetivo es dominar tu mente y elevar tu prefrontal por encima
              del 70%.
            </Text>
            <TouchableOpacity
              onPress={() => setModalAyudaVisible(false)}
              style={styles.closeBtnModal}
            >
              <Text style={{ color: "#00f0ff", fontWeight: "bold" }}>
                ENTENDIDO
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  helpButton: {
    backgroundColor: "#1f2937",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  helpIcon: { color: "#00f0ff", fontWeight: "bold" },
  container: { flex: 1, padding: 16 },
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
  brainImage: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 12,
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
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
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
    width: "85%",
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#00f0ff",
  },
  modalTitle: {
    color: "#00f0ff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    color: "#d1d5db",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputModal: {
    backgroundColor: "#1f2937",
    color: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 12,
  },
  closeBtnModal: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
});
