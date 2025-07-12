// Lade E-Mail-Adressen aus Umgebungsvariablen oder verwende Default-Werte
const getEmailsFromEnv = (): string[] => {
  const envEmails = "sina.alker9@gmail.com,silasbeckmann1508@gmail.com";
  
  if (envEmails && typeof envEmails === 'string') {
    // Teile die kommagetrennte Liste auf und bereinige sie
    return envEmails
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0);
  }
  
  return [];
};

export const ALLOWED_EMAILS = getEmailsFromEnv();

// Hilfsfunktion zur Überprüfung, ob eine E-Mail erlaubt ist
export const isEmailAllowed = (email: string): boolean => {
  return ALLOWED_EMAILS.includes(email.toLowerCase().trim());
};

// Debug-Funktion (nur in Entwicklung)
if (import.meta.env.DEV) {
  console.log('🔒 Erlaubte E-Mail-Adressen:', ALLOWED_EMAILS);
} 