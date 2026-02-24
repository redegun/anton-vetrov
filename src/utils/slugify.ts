const categorySlugMap: Record<string, string> = {
  'ИИ': 'ai',
  'Разработка': 'razrabotka',
  'SEO': 'seo',
  'Хостинги': 'hosting',
};

const slugToCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categorySlugMap).map(([k, v]) => [v, k])
);

export function categoryToSlug(category: string): string {
  return categorySlugMap[category] || category.toLowerCase();
}

export function slugToCategory(slug: string): string {
  return slugToCategoryMap[slug] || slug;
}
