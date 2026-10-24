import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const FRASES_GOGGINS = [
  "«El crecimiento solo vive del otro lado del sufrimiento.»",
  "«David Goggins corrió 160 kilómetros con las rótulas destrozadas. ¿Y vos decís que estás cansado?»",
  "«Tu cerebro te miente diciendo que no podés más. Apenas vas por el 40%.»",
  "«Si buscas comodidad, estás eligiendo la mediocridad.»",
];

const RANGOS_GOGGINS = [
  { nivel: 1, meta: 50, nombre: "NIVEL 1: ZONA DE CONFORT", desc: "Meta: 50%" },
  {
    nivel: 2,
    meta: 60,
    nombre: "NIVEL 2: ESTABLECIENDO BASES",
    desc: "Meta: 60%",
  },
  {
    nivel: 3,
    meta: 70,
    nombre: "NIVEL 3: CALLOUS YOUR MIND",
    desc: "Meta: 70%",
  },
  { nivel: 4, meta: 80, nombre: "NIVEL 4: EL 1% MÁS DURO", desc: "Meta: 80%" },
  { nivel: 5, meta: 90, nombre: "NIVEL MAX: STAY HARD!", desc: "Meta: 90%" },
];

export default function App() {
  const [habitos, setHabitos] = useState<any[]>([]);
  const [fraseIdx, setFraseIdx] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAyudaVisible, setModalAyudaVisible] = useState(false);
  const [modalGogginsVisible, setModalGogginsVisible] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const stored = await AsyncStorage.getItem("NEURO_HABITS_MOBILE_V2");
      if (stored) {
        setHabitos(JSON.parse(stored));
      } else {
        const iniciales = [
          {
            id: 1,
            nombre: "Levantarme a las 08:30",
            checks: [null, null, null, null, null, null, null],
          },
          {
            id: 2,
            nombre: "Correr 10 AM",
            checks: [null, null, null, null, null, null, null],
          },
          {
            id: 3,
            nombre: "Comer bien",
            checks: [null, null, null, null, null, null, null],
          },
          {
            id: 4,
            nombre: "Dormir temprano",
            checks: [null, null, null, null, null, null, null],
          },
        ];
        setHabitos(iniciales);
        await AsyncStorage.setItem(
          "NEURO_HABITS_MOBILE_V2",
          JSON.stringify(iniciales),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const guardarYActualizar = async (nuevosHabitos: any[]) => {
    setHabitos(nuevosHabitos);
    try {
      await AsyncStorage.setItem(
        "NEURO_HABITS_MOBILE_V2",
        JSON.stringify(nuevosHabitos),
      );
    } catch (e) {
      console.error(e);
    }
  };

  // Ciclo de 3 estados: null -> YES -> NO -> null
  const manejarClickCelda = (hIdx: number, dIdx: number) => {
    const nuevos = [...habitos];
    const actual = nuevos[hIdx].checks[dIdx];

    if (actual === null) {
      nuevos[hIdx].checks[dIdx] = "YES"; // 1er toque: Cumplido
    } else if (actual === "YES") {
      nuevos[hIdx].checks[dIdx] = "NO"; // 2do toque: Fallado
    } else {
      nuevos[hIdx].checks[dIdx] = null; // 3er toque: Vacío
    }

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

  return (
    <View style={styles.mainContainer}>
      {/* HEADER PRINCIPAL */}
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
          onPress={() =>
            setFraseIdx((prev) => (prev + 1) % FRASES_GOGGINS.length)
          }
        >
          <Text style={styles.quoteText}>{FRASES_GOGGINS[fraseIdx]}</Text>
          <Text style={styles.quoteHint}>Toca para cambiar frase 🔄</Text>
        </TouchableOpacity>

        {/* SECCIÓN CEREBRO Y NEUROQUÍMICA */}
        <View style={styles.brainCard}>
          <View style={styles.brainHeader}>
            <Text style={styles.brainTitle}>🧠 Respuesta Neuroquímica</Text>
            <TouchableOpacity onPress={() => setModalAyudaVisible(true)}>
              <Text style={styles.smallQuestion}>?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brainStatsRow}>
            <Text style={styles.brainStatText}>
              Prefrontal:{" "}
              <Text style={{ color: "#00f0ff" }}>{pctPrefrontal}%</Text>
            </Text>
            <Text style={styles.brainStatText}>
              Límbico: <Text style={{ color: "#ff0055" }}>{pctLimbico}%</Text>
            </Text>
          </View>
        </View>

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

          {habitos.map((h, hIdx) => (
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
            </View>
          ))}
        </View>

        <Text style={styles.instructionFooter}>
          💡 1 toque: Cumplido (✔) | 2 toques: Fallado (✖) | 3 toques: Vacío
        </Text>
      </ScrollView>

      {/* MENÚ HAMBURGUESA LATERAL (DRAWER) */}
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
                <View key={r.nivel} style={styles.rangoItem}>
                  <Text style={styles.rangoNombre}>{r.nombre}</Text>
                  <Text style={styles.rangoDesc}>
                    {r.desc} (Requieres {r.meta}% de corteza prefrontal)
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.gogginsPhotoCard}
                onPress={() => setModalGogginsVisible(true)}
              >
                <Text
                  style={{
                    color: "#00f0ff",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  📸 Ver Mentor en Grande (Goggins)
                </Text>
              </TouchableOpacity>
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
          <View style={styles.modalContentGrande}>
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              STAY HARD 💀
            </Text>
            <TouchableOpacity
              onPress={() => setModalGogginsVisible(false)}
              style={styles.closeBtnModal}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                CERRAR ✕
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE AYUDA / EXPLICACIÓN */}
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
  },
  brainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  brainTitle: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  smallQuestion: { color: "#00f0ff", fontWeight: "bold", fontSize: 14 },
  brainStatsRow: { flexDirection: "row", justifyContent: "space-around" },
  brainStatText: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
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
    marginBottom: 8,
  },
  rangoNombre: { color: "#00f0ff", fontSize: 11, fontWeight: "bold" },
  rangoDesc: { color: "#94a3b8", fontSize: 9, marginTop: 2 },
  gogginsPhotoCard: {
    backgroundColor: "#1f2937",
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    alignItems: "center",
  },
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
  closeBtnModal: {
    backgroundColor: "#1f2937",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
});
