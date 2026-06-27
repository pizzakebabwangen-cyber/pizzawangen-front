/**
 * Sortiert Hauptkategorien nach Admin-DisplayOrder (camelCase/PascalCase aus API).
 * Unterkategorien stabil nach Id.
 */
export function sortCategoriesForMenu(categories) {
  if (!Array.isArray(categories)) return [];
  return [...categories]
    .map((cat) => ({
      ...cat,
      subCategory: Array.isArray(cat.subCategory)
        ? [...cat.subCategory].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        : cat.subCategory,
    }))
    .sort((a, b) => {
      const ao = Number(a.displayOrder ?? a.DisplayOrder ?? 0);
      const bo = Number(b.displayOrder ?? b.DisplayOrder ?? 0);
      if (ao !== bo) return ao - bo;
      return (a.id ?? 0) - (b.id ?? 0);
    });
}
