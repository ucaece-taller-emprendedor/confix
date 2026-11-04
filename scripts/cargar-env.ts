// Carga .env si existe (en CI las variables ya vienen en el entorno). Importar primero.
try {
  process.loadEnvFile('.env')
} catch {
  // Sin archivo .env: se usan las variables del entorno.
}
