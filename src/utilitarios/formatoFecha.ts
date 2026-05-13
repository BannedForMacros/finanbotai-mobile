export function fechaLocal(d: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function mostrarFecha(s?: string | null): string {
  if (!s) return '';
  if (s.includes('T') || s.includes('Z')) {
    try {
      return new Date(s).toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
    } catch {
      return s;
    }
  }
  const [y, m, d] = s.split('-');
  if (!y || !m || !d) return s;
  return `${d}/${m}/${y}`;
}

export function parsearFechaLocal(s: string): Date {
  if (!s) return new Date();
  const limpio = s.split('T')[0].split(' ')[0];
  const [y, m, d] = limpio.split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}
