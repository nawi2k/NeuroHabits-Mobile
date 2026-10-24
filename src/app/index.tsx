import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

const FRASES_GOGGINS_SUCCESS = [
  "Stay Hard! Te estás volviendo imparable.",
  "Estás construyendo callos en la mente. ¡Sigue empujando!",
  "Rompiendo tus propios límites. ¡Eso es mentalidad de 1%!",
  "No paren cuando estén cansados, paren cuando hayan TERMINADO.",
  "La única persona en el espejo puede frenarte. ¡Bien hecho!",
];

const FRASES_GOGGINS_FAIL = [
  "¿En serio? ¿Sos una perra o querés cambiar?",
  "¡Puras excusas! Tu sistema límbico te está gobernando.",
  "Nadie viene a salvarte. ¡Levantate y hacé lo que tenés que hacer!",
  "¿Realmente querías mejorar o era mentira?",
  "Estás cómodo y por eso estás perdiendo. ¡Stay Hard!",
];

export default function App() {
  const [habitos, setHabitos] = useState<any[]>([]);
  const [fraseActual, setFraseActual] = useState(
    "«El crecimiento solo vive del otro lado del sufrimiento.»",
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const stored = await AsyncStorage.getItem("NEURO_HABITS_MOBILE");
      if (stored) {
        setHabitos(JSON.parse(stored));
      } else {
        const iniciales = [
          {
            id: 1,
            nombre: "Entrenar / Boxeo",
            checks: [null, null, null, null, null, null, null],
          },
          {
            id: 2,
            nombre: "Lectura diaria",
            checks: [null, null, null, null, null, null, null],
          },
          {
            id: 3,
            nombre: "Cero azúcar",
            checks: [null, null, null, null, null, null, null],
          },
        ];
        setHabitos(iniciales);
        await AsyncStorage.setItem(
          "NEURO_HABITS_MOBILE",
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
        "NEURO_HABITS_MOBILE",
        JSON.stringify(nuevosHabitos),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const manejarClickCelda = (
    hIdx: number,
    dIdx: number,
    tipo: "YES" | "NO",
  ) => {
    const nuevos = [...habitos];
    const actual = nuevos[hIdx].checks[dIdx];

    if (tipo === "YES") {
      nuevos[hIdx].checks[dIdx] = actual === "YES" ? null : "YES";
      const frase =
        FRASES_GOGGINS_SUCCESS[
          Math.floor(Math.random() * FRASES_GOGGINS_SUCCESS.length)
        ];
      setFraseActual(frase);
    } else {
      nuevos[hIdx].checks[dIdx] = actual === "NO" ? null : "NO";
      const frase =
        FRASES_GOGGINS_FAIL[
          Math.floor(Math.random() * FRASES_GOGGINS_FAIL.length)
        ];
      setFraseActual(frase);
    }

    guardarYActualizar(nuevos);
  };

  const totalChecksPosibles = habitos.length * 7;
  let totalHechos = 0;
  habitos.forEach((h) => {
    totalHechos += h.checks.filter((c: string) => c === "YES").length;
  });
  const porcentajeTotal =
    totalChecksPosibles > 0
      ? Math.round((totalHechos / totalChecksPosibles) * 100)
      : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NEURO HABITS</Text>
        <Text style={styles.subtitle}>STAY HARD 💀</Text>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>{fraseActual}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>
          PROGRESO SEMANAL: {porcentajeTotal}%
        </Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${porcentajeTotal}%` }]}
          />
        </View>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Hábito</Text>
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
                  onPress={() => manejarClickCelda(hIdx, dIdx, "YES")}
                  onLongPress={() => manejarClickCelda(hIdx, dIdx, "NO")}
                >
                  <Text style={styles.cellText}>{simbol}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.helpInstruction}>
        💡 Tocá una casilla para cumplir (✔). Mantené presionado para marcar
        fallo (✖).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090d16",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00f0ff",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    letterSpacing: 4,
    marginTop: 4,
  },
  quoteCard: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#00f0ff",
    marginBottom: 20,
  },
  quoteText: {
    color: "#e2e8f0",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  progressContainer: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  progressTitle: {
    color: "#00f0ff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "#1f2937",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00f0ff",
  },
  tableContainer: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerCell: {
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: 12,
  },
  headerDay: {
    flex: 1,
    textAlign: "center",
    color: "#94a3b8",
    fontWeight: "bold",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  habitoNombre: {
    flex: 2,
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
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
  cellText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  helpInstruction: {
    color: "#64748b",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 40,
  },
});
