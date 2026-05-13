import { StyleSheet, Platform } from 'react-native';
import { tema } from './tema';

export const estilosCompartidos = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: tema.primario },
  container: { flex: 1, backgroundColor: tema.scrollFondo },
  scrollContent: { padding: tema.spacing.lg, paddingBottom: 48 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    paddingTop: Platform.OS === 'ios' ? 52 : 48,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitulo: { color: tema.blanco, fontSize: 20, fontWeight: '700' },
  headerSubtitulo: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  headerBoton: { padding: 8 },

  card: {
    backgroundColor: tema.blanco,
    borderRadius: tema.radius.lg,
    padding: tema.spacing.lg,
    borderWidth: 1,
    borderColor: tema.borde,
    marginBottom: tema.spacing.md
  },
  cardTitulo: {
    fontSize: tema.fontSize.lg,
    fontWeight: '700',
    color: tema.textoPrincipal,
    marginBottom: tema.spacing.md
  },

  label: {
    color: tema.textoPrincipal,
    fontWeight: '600',
    marginBottom: tema.spacing.xs,
    fontSize: tema.fontSize.md
  },
  input: {
    backgroundColor: tema.inputFondo,
    borderColor: tema.inputBorde,
    borderWidth: 1,
    borderRadius: tema.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tema.textoPrincipal,
    fontSize: tema.fontSize.md
  },
  inputDeshabilitado: { backgroundColor: tema.inputDeshabilitado, color: tema.textoSecundario },
  ayuda: { color: tema.textoSecundario, fontSize: tema.fontSize.sm, marginTop: 4 },
  errorText: { color: tema.error, fontSize: tema.fontSize.sm, marginTop: 4 },

  botonPrimario: {
    backgroundColor: tema.primario,
    borderRadius: tema.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: tema.primario,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  botonPrimarioDeshabilitado: { opacity: 0.5 },
  botonPrimarioTexto: { color: tema.blanco, fontWeight: '700', fontSize: tema.fontSize.md },

  botonSecundario: {
    backgroundColor: tema.secundario,
    borderRadius: tema.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  botonSecundarioTexto: { color: tema.blanco, fontWeight: '700' },

  fila: { flexDirection: 'row', alignItems: 'center' },
  filaSeparada: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start'
  },
  badgeTexto: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: tema.borde, marginVertical: tema.spacing.md },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: tema.blanco,
    borderTopLeftRadius: tema.radius.xl,
    borderTopRightRadius: tema.radius.xl,
    padding: tema.spacing.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tema.spacing.md
  },
  modalTitulo: { fontSize: tema.fontSize.lg, fontWeight: '700', color: tema.textoPrincipal }
});
