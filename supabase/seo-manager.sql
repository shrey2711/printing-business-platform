-- Section 5: the remaining SEO fields, added to the existing per-route override
-- table. Purely additive — every column is nullable and the prerenderer falls
-- back to each page's own value when a column is null, so applying this changes
-- no output until someone fills a field in.
--
-- Run once in the Supabase SQL editor.

alter table public.seo_overrides add column if not exists h1               text;
alter table public.seo_overrides add column if not exists og_title         text;
alter table public.seo_overrides add column if not exists og_description   text;
alter table public.seo_overrides add column if not exists breadcrumb_title text;
alter table public.seo_overrides add column if not exists schema_type      text;
alter table public.seo_overrides add column if not exists faq_schema       jsonb;

comment on column public.seo_overrides.h1 is
  'Replaces the page''s visible H1. One H1 per page; the audit gates enforce that.';
comment on column public.seo_overrides.og_title is
  'Social share title. Falls back to the SEO title when null.';
comment on column public.seo_overrides.og_description is
  'Social share description. Falls back to the meta description when null.';
comment on column public.seo_overrides.breadcrumb_title is
  'This page''s own label in the breadcrumb trail, for when the H1 is too long.';
comment on column public.seo_overrides.schema_type is
  'schema.org @type for the page''s main entity, e.g. Product, Article, LocalBusiness.';
comment on column public.seo_overrides.faq_schema is
  'FAQPage entries as [{question, answer}]. Emitted as FAQPage JSON-LD.';
