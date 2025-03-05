
// 📌 Función para obtener un número aleatorio entero entre 0 y max (exclusivo)
export function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

// 📌 Función para decodificar un token JWT y devolverlo como un objeto JSON
export function parseJwtAWS(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1]; // Obtiene el payload
    if (!base64Url) throw new Error("Token inválido");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Corrige caracteres
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al parsear JWT:", error);
    return {};
  }
}

export function parseJwt(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1]; // Obtiene el payload
    if (!base64Url) throw new Error("Token inválido");

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Corrige caracteres
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al parsear JWT:", error);
    return {};
  }
}
