declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"adaptivnyj-dizajn.md": {
	id: "adaptivnyj-dizajn.md";
  slug: "adaptivnyj-dizajn";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"ai-avtomatizaciya-biznesa.md": {
	id: "ai-avtomatizaciya-biznesa.md";
  slug: "ai-avtomatizaciya-biznesa";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"chatgpt-go-podpiska.md": {
	id: "chatgpt-go-podpiska.md";
  slug: "chatgpt-go-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"chatgpt-plus-podpiska.md": {
	id: "chatgpt-plus-podpiska.md";
  slug: "chatgpt-plus-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"chatgpt-plus-vs-pro.md": {
	id: "chatgpt-plus-vs-pro.md";
  slug: "chatgpt-plus-vs-pro";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"chto-takoe-crm-integracija.md": {
	id: "chto-takoe-crm-integracija.md";
  slug: "chto-takoe-crm-integracija";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"chto-takoe-modx-revolution.md": {
	id: "chto-takoe-modx-revolution.md";
  slug: "chto-takoe-modx-revolution";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"claude-ai-podpiska.md": {
	id: "claude-ai-podpiska.md";
  slug: "claude-ai-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"claude-pro-vs-max.md": {
	id: "claude-pro-vs-max.md";
  slug: "claude-pro-vs-max";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cursor-ai-podpiska.md": {
	id: "cursor-ai-podpiska.md";
  slug: "cursor-ai-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cursor-pro-vs-business.md": {
	id: "cursor-pro-vs-business.md";
  slug: "cursor-pro-vs-business";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"cursor-vs-copilot.md": {
	id: "cursor-vs-copilot.md";
  slug: "cursor-vs-copilot";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"github-copilot-podpiska.md": {
	id: "github-copilot-podpiska.md";
  slug: "github-copilot-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"gpt-5-3-codex-spark-novaya-ai-model-openai-dlya-kodinga.md": {
	id: "gpt-5-3-codex-spark-novaya-ai-model-openai-dlya-kodinga.md";
  slug: "gpt-5-3-codex-spark-novaya-ai-model-openai-dlya-kodinga";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"ii-agenty-dlya-biznesa-kak-vybrat.md": {
	id: "ii-agenty-dlya-biznesa-kak-vybrat.md";
  slug: "ii-agenty-dlya-biznesa-kak-vybrat";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"integraciya-ii-s-crm-bitrix24-amocrm.md": {
	id: "integraciya-ii-s-crm-bitrix24-amocrm.md";
  slug: "integraciya-ii-s-crm-bitrix24-amocrm";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-oplatit-chatgpt-iz-rossii.md": {
	id: "kak-oplatit-chatgpt-iz-rossii.md";
  slug: "kak-oplatit-chatgpt-iz-rossii";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-oplatit-nejroset-iz-rossii.md": {
	id: "kak-oplatit-nejroset-iz-rossii.md";
  slug: "kak-oplatit-nejroset-iz-rossii";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-podobrat-kljuchevye-slova.md": {
	id: "kak-podobrat-kljuchevye-slova.md";
  slug: "kak-podobrat-kljuchevye-slova";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-prodvinut-sajt-v-yandekse.md": {
	id: "kak-prodvinut-sajt-v-yandekse.md";
  slug: "kak-prodvinut-sajt-v-yandekse";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-sostavit-semanticheskoe-jadro.md": {
	id: "kak-sostavit-semanticheskoe-jadro.md";
  slug: "kak-sostavit-semanticheskoe-jadro";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-vnedrit-ii-v-biznes-poshagovo.md": {
	id: "kak-vnedrit-ii-v-biznes-poshagovo.md";
  slug: "kak-vnedrit-ii-v-biznes-poshagovo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-vybrat-cms.md": {
	id: "kak-vybrat-cms.md";
  slug: "kak-vybrat-cms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"kak-vybrat-seo-specialista.md": {
	id: "kak-vybrat-seo-specialista.md";
  slug: "kak-vybrat-seo-specialista";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"landing-vs-sajt.md": {
	id: "landing-vs-sajt.md";
  slug: "landing-vs-sajt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"lokalnoe-seo-yandex-karty.md": {
	id: "lokalnoe-seo-yandex-karty.md";
  slug: "lokalnoe-seo-yandex-karty";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"luchshie-hostingi-2025.md": {
	id: "luchshie-hostingi-2025.md";
  slug: "luchshie-hostingi-2025";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"meta-tegi-title-description-h1.md": {
	id: "meta-tegi-title-description-h1.md";
  slug: "meta-tegi-title-description-h1";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"midjourney-podpiska.md": {
	id: "midjourney-podpiska.md";
  slug: "midjourney-podpiska";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-api-xpdo.md": {
	id: "modx-api-xpdo.md";
  slug: "modx-api-xpdo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-bezopasnost-zashhita.md": {
	id: "modx-bezopasnost-zashhita.md";
  slug: "modx-bezopasnost-zashhita";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-blog-sozdanie.md": {
	id: "modx-blog-sozdanie.md";
  slug: "modx-blog-sozdanie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-chanki-primery.md": {
	id: "modx-chanki-primery.md";
  slug: "modx-chanki-primery";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-dopolneniya-top.md": {
	id: "modx-dopolneniya-top.md";
  slug: "modx-dopolneniya-top";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-elementy-shablony-chanki-snippety.md": {
	id: "modx-elementy-shablony-chanki-snippety.md";
  slug: "modx-elementy-shablony-chanki-snippety";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-fenom-shablonizator.md": {
	id: "modx-fenom-shablonizator.md";
  slug: "modx-fenom-shablonizator";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-filtracija-mfilter2.md": {
	id: "modx-filtracija-mfilter2.md";
  slug: "modx-filtracija-mfilter2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-formit-formy.md": {
	id: "modx-formit-formy.md";
  slug: "modx-formit-formy";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-friendly-url-nastrojka.md": {
	id: "modx-friendly-url-nastrojka.md";
  slug: "modx-friendly-url-nastrojka";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-gallery-rabota-s-foto.md": {
	id: "modx-gallery-rabota-s-foto.md";
  slug: "modx-gallery-rabota-s-foto";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-hosting-vybor.md": {
	id: "modx-hosting-vybor.md";
  slug: "modx-hosting-vybor";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-katalog-tovarov.md": {
	id: "modx-katalog-tovarov.md";
  slug: "modx-katalog-tovarov";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-korzina-oformlenie-zakaza.md": {
	id: "modx-korzina-oformlenie-zakaza.md";
  slug: "modx-korzina-oformlenie-zakaza";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-migracija-s-wordpress.md": {
	id: "modx-migracija-s-wordpress.md";
  slug: "modx-migracija-s-wordpress";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-minishop2-internet-magazin.md": {
	id: "modx-minishop2-internet-magazin.md";
  slug: "modx-minishop2-internet-magazin";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-multiyazychnost-babel.md": {
	id: "modx-multiyazychnost-babel.md";
  slug: "modx-multiyazychnost-babel";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-nastrojka-posle-ustanovki.md": {
	id: "modx-nastrojka-posle-ustanovki.md";
  slug: "modx-nastrojka-posle-ustanovki";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-oplata-dostavka.md": {
	id: "modx-oplata-dostavka.md";
  slug: "modx-oplata-dostavka";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-pdotools-rukovodstvo.md": {
	id: "modx-pdotools-rukovodstvo.md";
  slug: "modx-pdotools-rukovodstvo";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-prodvinutaya-razrabotka.md": {
	id: "modx-prodvinutaya-razrabotka.md";
  slug: "modx-prodvinutaya-razrabotka";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-schema-markup.md": {
	id: "modx-schema-markup.md";
  slug: "modx-schema-markup";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-seo-prodvizhenie.md": {
	id: "modx-seo-prodvizhenie.md";
  slug: "modx-seo-prodvizhenie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-shablony-sozdanie.md": {
	id: "modx-shablony-sozdanie.md";
  slug: "modx-shablony-sozdanie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-skorost-optimizaciya.md": {
	id: "modx-skorost-optimizaciya.md";
  slug: "modx-skorost-optimizaciya";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-snippety-napisanie.md": {
	id: "modx-snippety-napisanie.md";
  slug: "modx-snippety-napisanie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-tv-polya.md": {
	id: "modx-tv-polya.md";
  slug: "modx-tv-polya";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-ustanovka-na-hosting.md": {
	id: "modx-ustanovka-na-hosting.md";
  slug: "modx-ustanovka-na-hosting";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"modx-vs-wordpress.md": {
	id: "modx-vs-wordpress.md";
  slug: "modx-vs-wordpress";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"openai-mentalnoe-zdorove-obnovlenie-chatgpt.md": {
	id: "openai-mentalnoe-zdorove-obnovlenie-chatgpt.md";
  slug: "openai-mentalnoe-zdorove-obnovlenie-chatgpt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"podpiski-na-nejroseti-2025.md": {
	id: "podpiski-na-nejroseti-2025.md";
  slug: "podpiski-na-nejroseti-2025";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"razrabotka-landinga-2025.md": {
	id: "razrabotka-landinga-2025.md";
  slug: "razrabotka-landinga-2025";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"razrabotka-sajta-na-modx.md": {
	id: "razrabotka-sajta-na-modx.md";
  slug: "razrabotka-sajta-na-modx";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-audit-chto-proveryat.md": {
	id: "seo-audit-chto-proveryat.md";
  slug: "seo-audit-chto-proveryat";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-audit-sajta.md": {
	id: "seo-audit-sajta.md";
  slug: "seo-audit-sajta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-dlya-internet-magazina.md": {
	id: "seo-dlya-internet-magazina.md";
  slug: "seo-dlya-internet-magazina";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-dlya-novichkov.md": {
	id: "seo-dlya-novichkov.md";
  slug: "seo-dlya-novichkov";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-optimizacija-sajta.md": {
	id: "seo-optimizacija-sajta.md";
  slug: "seo-optimizacija-sajta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-optimizacija-teksta.md": {
	id: "seo-optimizacija-teksta.md";
  slug: "seo-optimizacija-teksta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"seo-prodvizhenie-sajta-samostojatelno.md": {
	id: "seo-prodvizhenie-sajta-samostojatelno.md";
  slug: "seo-prodvizhenie-sajta-samostojatelno";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"skolko-stoit-sajt.md": {
	id: "skolko-stoit-sajt.md";
  slug: "skolko-stoit-sajt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"skolko-stoit-seo-prodvizhenie.md": {
	id: "skolko-stoit-seo-prodvizhenie.md";
  slug: "skolko-stoit-seo-prodvizhenie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"skolko-stoit-vnedrenie-ii-v-biznes.md": {
	id: "skolko-stoit-vnedrenie-ii-v-biznes.md";
  slug: "skolko-stoit-vnedrenie-ii-v-biznes";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"tz-na-sajt.md": {
	id: "tz-na-sajt.md";
  slug: "tz-na-sajt";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vertikalnaya-polosa-sprava-na-mobilnom.md": {
	id: "vertikalnaya-polosa-sprava-na-mobilnom.md";
  slug: "vertikalnaya-polosa-sprava-na-mobilnom";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vneshnie-ssylki-i-ssylochnoe-prodvizhenie.md": {
	id: "vneshnie-ssylki-i-ssylochnoe-prodvizhenie.md";
  slug: "vneshnie-ssylki-i-ssylochnoe-prodvizhenie";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"vnutrennjaja-optimizacija-sajta.md": {
	id: "vnutrennjaja-optimizacija-sajta.md";
  slug: "vnutrennjaja-optimizacija-sajta";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
