export function canViewPage(role, page) {
  if (role === "admin" || role === "patron") return true;

  if (role === "gestionnaire") {
    return page !== "statistics"; // il ne voit pas Statistiques
  }

  return false;
}

export function canCreateUser(role) {
  return role === "admin" || role === "patron" || role === "gestionnaire";
}

export function canEditUser(role) {
  return role === "admin" || role === "patron";
}

export function canDeleteUser(role) {
  return role === "admin" || role === "patron";
}