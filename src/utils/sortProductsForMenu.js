/** Reihenfolge pro Unterkategorie: kleinere displayOrder zuerst (Menüprodukt / API). */
export function sortProductsForMenu(products) {
  if (!Array.isArray(products)) return [];
  return [...products].sort((a, b) => {
    const ao = Number(a.displayOrder ?? a.DisplayOrder ?? 0);
    const bo = Number(b.displayOrder ?? b.DisplayOrder ?? 0);
    if (ao !== bo) return ao - bo;
    return (a.id ?? 0) - (b.id ?? 0);
  });
}
