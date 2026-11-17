/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  animations,
  foreground,
  iconKinds,
  industries,
  industryPreset,
  linkTypes,
  presets,
  slugify,
  type BrandRecord,
  type BrandLink,
} from '@/lib/product/model';
import { normalizeLink, publishIssues } from '@/lib/product/validation';
import {
  filenameSuggestion,
  paletteFromPixels,
} from '@/lib/product/color-suggestions';
import { QRAssets } from './QRAssets';
const steps = ['Company', 'Branding', 'Links', 'Style', 'Preview', 'Publish'];
type Colors = Pick<
  BrandRecord,
  'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor'
>;
function iconFor(type: string): BrandLink['icon'] {
  return (
    (
      {
        google_review: 'review',
        call: 'phone',
        email: 'enquiry',
        maps: 'location',
        admissions: 'courses',
        appointment: 'timings',
        facebook: 'website',
        custom: 'website',
      } as Record<string, BrandLink['icon']>
    )[type] || (type as BrandLink['icon'])
  );
}
export function BrandWizard({ initial }: { initial: BrandRecord }) {
  const [brand, setBrand] = useState(initial),
    [step, setStep] = useState(0),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saveState, setSaveState] = useState(''),
    [manualSlug, setManualSlug] = useState(!!initial.id),
    [suggestions, setSuggestions] = useState<Colors | null>(null),
    [suggestedName, setSuggestedName] = useState(''),
    [previewWidth, setPreviewWidth] = useState(390),
    [success, setSuccess] = useState(false),
    [website, setWebsite] = useState('');
  const iframe = useRef<HTMLIFrameElement>(null);
  const latest = useRef(brand);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    latest.current = brand;
    dirtyRef.current = dirty;
  }, [brand, dirty]);
  function update<K extends keyof BrandRecord>(key: K, value: BrandRecord[K]) {
    setBrand((b) => ({
      ...b,
      [key]: value,
      ...([
        'primaryColor',
        'secondaryColor',
        'accentColor',
        'backgroundColor',
        'themePreset',
      ].includes(key)
        ? { legacyPresentation: undefined }
        : {}),
    }));
    setDirty(true);
    setSaveState('Unsaved changes');
  }
  useEffect(() => {
    function unload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) {
        e.preventDefault();
      }
    }
    function click(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (
        dirtyRef.current &&
        anchor &&
        anchor.target !== '_blank' &&
        !anchor.hasAttribute('download') &&
        !anchor.href.startsWith('data:') &&
        new URL(anchor.href).pathname !== location.pathname &&
        !confirm('Discard unsaved edits and leave this wizard?')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    window.addEventListener('beforeunload', unload);
    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    function traverse(e: Event) {
      if (
        (e as Event & { navigationType?: string }).navigationType ===
          'traverse' &&
        e.cancelable &&
        dirtyRef.current &&
        !confirm('Discard unsaved edits and leave this wizard?')
      )
        e.preventDefault();
    }
    navigation?.addEventListener('navigate', traverse);
    document.addEventListener('click', click, true);
    return () => {
      window.removeEventListener('beforeunload', unload);
      navigation?.removeEventListener('navigate', traverse);
      document.removeEventListener('click', click, true);
    };
  }, []);
  useEffect(() => {
    function send() {
      iframe.current?.contentWindow?.postMessage(
        { type: 'go-linking-preview', brand: latest.current },
        location.origin,
      );
    }
    function ready(e: MessageEvent) {
      if (
        e.origin === location.origin &&
        e.source === iframe.current?.contentWindow &&
        e.data?.type === 'go-linking-preview-ready'
      )
        send();
    }
    send();
    window.addEventListener('message', ready);
    return () => window.removeEventListener('message', ready);
  }, [brand, step]);
  function linkUpdate(id: string, patch: Partial<BrandLink>) {
    update(
      'links',
      brand.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }
  function move(index: number, delta: number) {
    const links = [...brand.links];
    [links[index], links[index + delta]] = [links[index + delta], links[index]];
    update(
      'links',
      links.map((l, sortOrder) => ({ ...l, sortOrder })),
    );
  }
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      if (
        file.size > 3 * 1024 * 1024 ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
      )
        throw new Error('Choose a PNG, JPEG or WebP under 3 MB.');
      const image = await createImageBitmap(file);
      if (
        image.width > 6000 ||
        image.height > 6000 ||
        image.width * image.height > 16000000
      ) {
        image.close();
        throw new Error(
          'Logo dimensions must be at most 6000px and 16 megapixels.',
        );
      }
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0, 64, 64);
      image.close();
      const palette = paletteFromPixels(
        context.getImageData(0, 0, 64, 64).data,
      );
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'X-Filename': encodeURIComponent(file.name),
        },
        body: file,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      update('logo', data.url);
      setSuggestions(palette);
      if (!brand.name) setSuggestedName(filenameSuggestion(file.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logo upload failed.');
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError('');
    setSaveState('Saving…');
    try {
      let confirmSlug = false;
      if (brand.status === 'published' && brand.slug !== initial.slug) {
        confirmSlug = confirm(
          'This can break existing printed QR codes and NFC tags. Confirm this published slug change?',
        );
        if (!confirmSlug) {
          setSaveState('Unsaved changes');
          return null;
        }
      }
      const r = await fetch(
        brand.id ? `/api/admin/brands/${brand.id}` : '/api/admin/brands',
        {
          method: brand.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(brand.id ? { brand, confirmSlug } : brand),
        },
      );
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setBrand(data);
      setDirty(false);
      setSaveState('Saved');
      if (!brand.id) history.replaceState(null, '', `/admin/brands/${data.id}`);
      return data as BrandRecord;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save brand.');
      setSaveState('Not saved');
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/brands/${saved.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setBrand(data);
      setSuccess(true);
      setDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to publish.');
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setError('');
    if (step === 0 && (!brand.name || !brand.slug)) {
      setError('Enter a brand name and slug before continuing.');
      return;
    }
    setStep(Math.min(5, step + 1));
  }
  const field = (
    key:
      | 'name'
      | 'slug'
      | 'category'
      | 'tagline'
      | 'description'
      | 'heroTitle'
      | 'heroSubtitle',
    label: string,
    help?: string,
  ) => (
    <label key={key}>
      {label}
      {key === 'description' || key === 'heroTitle' ? (
        <textarea
          aria-label={label}
          value={brand[key]}
          maxLength={key === 'description' ? 2000 : 300}
          onChange={(e) => update(key, e.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          value={brand[key]}
          maxLength={key === 'slug' ? 70 : 300}
          onChange={(e) => {
            if (key === 'name' && !manualSlug) {
              setBrand((b) => ({
                ...b,
                name: e.target.value,
                slug: slugify(e.target.value),
              }));
              setDirty(true);
              setSaveState('Unsaved changes');
            } else {
              if (key === 'slug') setManualSlug(true);
              update(key, e.target.value);
            }
          }}
        />
      )}
      {help && <small>{help}</small>}
    </label>
  );
  if (success)
    return (
      <>
        <div className="admin-page-heading">
          <div>
            <p className="admin-kicker">CONNECTED, LOCALLY</p>
            <h1>Brand published.</h1>
            <p>
              {brand.name} now has its own public destination on this
              development server.
            </p>
          </div>
          <Link
            className="admin-primary"
            href={`/${brand.slug}`}
            target="_blank"
          >
            Open Public Page ↗
          </Link>
        </div>
        <div className="admin-row-actions">
          <button
            onClick={() => {
              setSuccess(false);
              setStep(0);
            }}
          >
            Continue editing
          </button>
          <Link href="/admin/brands">All brands</Link>
        </div>
        <QRAssets brands={[brand]} />
      </>
    );
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <p className="admin-kicker">
            {brand.id ? 'SHAPE YOUR BRAND' : 'A NEW CONNECTION STARTS HERE'}
          </p>
          <h1>{brand.id ? 'Edit brand.' : 'Create a brand.'}</h1>
          <p>Company to connection, in six considered steps.</p>
        </div>
        <div className="admin-save">
          <span role="status">
            {saveState || (brand.id ? 'Saved' : 'New draft')}
          </span>
          <button onClick={save} disabled={busy}>
            {busy
              ? 'Saving…'
              : brand.status === 'published'
                ? 'Save changes'
                : 'Save draft'}
          </button>
        </div>
      </div>
      <nav className="wizard-progress" aria-label="Brand setup steps">
        {steps.map((label, index) => (
          <button
            key={label}
            onClick={() => {
              setStep(index);
              setError('');
            }}
            aria-current={step === index ? 'step' : undefined}
            disabled={busy}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {label}
          </button>
        ))}
      </nav>
      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="wizard-fields">
        <section className="admin-panel wizard-panel">
          <div className="wizard-step-title">
            <p className="admin-kicker">STEP {step + 1} OF 6</p>
            <h2>
              {
                [
                  'Tell us about the company.',
                  'Make it unmistakably theirs.',
                  'Create their connections.',
                  'Choose the atmosphere.',
                  'See it before the world does.',
                  'Ready to connect?',
                ][step]
              }
            </h2>
          </div>
          {step === 0 && (
            <div className="admin-form-grid">
              {field('name', 'Brand name *')}
              {field(
                'slug',
                'Slug *',
                'Lowercase letters, numbers and hyphens. Published slug changes require confirmation.',
              )}
              <label>
                Industry *
                <select
                  aria-label="Industry *"
                  value={brand.industry}
                  onChange={(e) => {
                    const preset = industryPreset(e.target.value);
                    setBrand((b) => ({
                      ...b,
                      industry: e.target.value,
                      themePreset: preset,
                      animationPreset: preset,
                      legacyPresentation:
                        preset === b.themePreset
                          ? b.legacyPresentation
                          : undefined,
                    }));
                    setDirty(true);
                  }}
                >
                  {industries.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </label>
              {field('category', 'Category')}
              {field('tagline', 'Tagline')}
              {field('description', 'Short description')}
              <label>
                Company website (optional)
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
                <small>
                  Discovery is planned. Use “Add website link” to add the URL
                  you provide.
                </small>
              </label>
              <div className="field-action">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const url = normalizeLink('website', website);
                      update('links', [
                        ...brand.links,
                        {
                          id: crypto.randomUUID(),
                          brandId: brand.id,
                          type: 'website',
                          label: 'Website',
                          description: '',
                          url,
                          icon: 'website',
                          enabled: true,
                          sortOrder: brand.links.length,
                        },
                      ]);
                      setWebsite('');
                      setSaveState('Website added to Links');
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Add website link
                </button>
              </div>
            </div>
          )}
          {step === 1 && (
            <>
              <div className="logo-upload">
                <img
                  src={brand.logo || '/brands/fallback.svg'}
                  alt="Brand logo preview"
                />
                <div>
                  <label>
                    Upload logo
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => {
                        void upload(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <p>
                    PNG, JPEG or WebP · up to 3 MB. Original image is preserved.
                  </p>
                  {brand.logo && (
                    <button onClick={() => update('logo', '')}>
                      Remove logo
                    </button>
                  )}
                </div>
              </div>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={brand.fallbackApproved}
                  onChange={(e) => update('fallbackApproved', e.target.checked)}
                />
                Approve the neutral Go-Linking fallback if no logo is uploaded
              </label>
              {suggestions && (
                <div className="palette-suggestion">
                  <h3>Colors from your logo</h3>
                  <div className="palette-swatches">
                    {Object.values(suggestions).map((c, i) => (
                      <span
                        key={i}
                        style={{ background: c, color: foreground(c) }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <p>
                    Suggested style: {industryPreset(brand.industry)}. Review
                    these suggestions before applying.
                  </p>
                  <button
                    onClick={() => {
                      setBrand((b) => ({
                        ...b,
                        ...suggestions,
                        themePreset: industryPreset(b.industry),
                        animationPreset: industryPreset(b.industry),
                        legacyPresentation: undefined,
                      }));
                      setDirty(true);
                      setSuggestions(null);
                    }}
                  >
                    Apply suggested palette and style
                  </button>
                </div>
              )}
              {suggestedName && !brand.name && (
                <div className="admin-notice">
                  Filename suggestion: {suggestedName}{' '}
                  <button
                    onClick={() => {
                      update('name', suggestedName);
                      if (!manualSlug) update('slug', slugify(suggestedName));
                      setSuggestedName('');
                    }}
                  >
                    Use this name
                  </button>
                </div>
              )}
              <div className="admin-form-grid">
                {(
                  [
                    'primaryColor',
                    'secondaryColor',
                    'accentColor',
                    'backgroundColor',
                  ] as const
                ).map((key) => (
                  <label key={key}>
                    {key
                      .replace('Color', ' color')
                      .replace(/^./, (c) => c.toUpperCase())}
                    <div className="color-field">
                      <input
                        type="color"
                        aria-label={`${key} picker`}
                        value={
                          /^#[0-9a-f]{6}$/i.test(brand[key])
                            ? brand[key]
                            : '#255C88'
                        }
                        onChange={(e) => update(key, e.target.value)}
                      />
                      <input
                        aria-label={key}
                        value={brand[key]}
                        maxLength={7}
                        onChange={(e) => update(key, e.target.value)}
                      />
                    </div>
                  </label>
                ))}
              </div>
              <p
                className="contrast-preview"
                style={{
                  background: brand.backgroundColor,
                  color: foreground(brand.backgroundColor),
                }}
              >
                Readable foreground suggestion:{' '}
                {foreground(brand.backgroundColor)} — Your brand, clearly
                connected.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <p>
                Add the channels customers should use to reach this business.
              </p>
              {!brand.links.length && (
                <div className="admin-empty">
                  <h3>No links yet.</h3>
                  <p>Start with a website, review page or contact channel.</p>
                </div>
              )}
              <div className="link-editor-list">
                {brand.links.map((link, index) => {
                  let message = '';
                  try {
                    if (link.url) normalizeLink(link.type, link.url);
                    else if (link.enabled)
                      message = 'Add a value or disable this link.';
                  } catch (e) {
                    message = (e as Error).message;
                  }
                  return (
                    <section className="link-editor" key={link.id}>
                      <div className="admin-section-heading">
                        <h3>
                          {index + 1}. {link.label || 'New link'}
                        </h3>
                        <div className="admin-row-actions">
                          <button
                            aria-label={`Move ${link.label} up`}
                            disabled={index === 0}
                            onClick={() => move(index, -1)}
                          >
                            ↑
                          </button>
                          <button
                            aria-label={`Move ${link.label} down`}
                            disabled={index === brand.links.length - 1}
                            onClick={() => move(index, 1)}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() =>
                              update(
                                'links',
                                brand.links.filter((l) => l.id !== link.id),
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="admin-form-grid">
                        <label>
                          Link type
                          <select
                            value={link.type}
                            onChange={(e) =>
                              linkUpdate(link.id, {
                                type: e.target.value as BrandLink['type'],
                                icon: iconFor(e.target.value),
                              })
                            }
                          >
                            {linkTypes.map((t) => (
                              <option value={t} key={t}>
                                {t.replaceAll('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Icon
                          <select
                            value={link.icon}
                            onChange={(e) =>
                              linkUpdate(link.id, {
                                icon: e.target.value as BrandLink['icon'],
                              })
                            }
                          >
                            {iconKinds.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Label
                          <input
                            value={link.label}
                            maxLength={100}
                            onChange={(e) =>
                              linkUpdate(link.id, { label: e.target.value })
                            }
                          />
                        </label>
                        <label>
                          Description
                          <input
                            value={link.description}
                            maxLength={300}
                            onChange={(e) =>
                              linkUpdate(link.id, {
                                description: e.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="full-width">
                          URL / phone / email
                          <input
                            value={link.url}
                            maxLength={2000}
                            aria-invalid={!!message}
                            onChange={(e) =>
                              linkUpdate(link.id, { url: e.target.value })
                            }
                          />
                          {message && (
                            <small className="field-error">{message}</small>
                          )}
                        </label>
                        <label className="admin-checkbox">
                          <input
                            type="checkbox"
                            checked={link.enabled}
                            onChange={(e) =>
                              linkUpdate(link.id, { enabled: e.target.checked })
                            }
                          />
                          Enabled
                        </label>
                      </div>
                    </section>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  update('links', [
                    ...brand.links,
                    {
                      id: crypto.randomUUID(),
                      brandId: brand.id,
                      type: 'website',
                      label: 'Website',
                      description: '',
                      url: '',
                      icon: 'website',
                      sortOrder: brand.links.length,
                      enabled: true,
                    },
                  ])
                }
                disabled={brand.links.length >= 40}
              >
                ＋ Add Link
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <div className="admin-form-grid">
                <label>
                  Theme preset
                  <select
                    aria-label="Theme preset"
                    value={brand.themePreset}
                    onChange={(e) =>
                      update(
                        'themePreset',
                        e.target.value as BrandRecord['themePreset'],
                      )
                    }
                  >
                    {presets.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <small>
                    Reusable visual direction. Your logo, colors and content
                    stay yours.
                  </small>
                </label>
                <label>
                  Animation preset
                  <select
                    aria-label="Animation preset"
                    value={brand.animationPreset}
                    onChange={(e) =>
                      update(
                        'animationPreset',
                        e.target.value as BrandRecord['animationPreset'],
                      )
                    }
                  >
                    {animations.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                  <small>
                    Lightweight SVG/CSS with reduced-motion support.
                  </small>
                </label>
                {field(
                  'heroTitle',
                  'Hero heading',
                  'Use a new line for a second heading line.',
                )}
                {field('heroSubtitle', 'Hero subtitle')}
              </div>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={brand.directoryVisible}
                  onChange={(e) => update('directoryVisible', e.target.checked)}
                />
                Show on the Go-Linking directory when published
              </label>
            </>
          )}
          {step === 4 && (
            <>
              <div className="preview-toolbar">
                <div>
                  <button
                    aria-pressed={previewWidth === 390}
                    onClick={() => setPreviewWidth(390)}
                  >
                    Mobile · 390
                  </button>
                  <button
                    aria-pressed={previewWidth === 1280}
                    onClick={() => setPreviewWidth(1280)}
                  >
                    Desktop · 1280
                  </button>
                </div>
                <p>Live preview · uses the public rendering engine</p>
              </div>
              <div className="preview-scroll">
                <iframe
                  title="Live brand preview"
                  ref={iframe}
                  src="/admin/live-preview"
                  style={{ width: previewWidth }}
                  onLoad={() =>
                    iframe.current?.contentWindow?.postMessage(
                      { type: 'go-linking-preview', brand },
                      location.origin,
                    )
                  }
                />
              </div>
            </>
          )}
          {step === 5 && (
            <>
              <div className="publish-summary">
                <span className="status-badge draft">LOCAL PUBLISHING</span>
                <h3>{brand.name || 'Your brand'}</h3>
                <p>
                  /{brand.slug || 'your-slug'} · {brand.industry}
                </p>
                <p>
                  {brand.links.filter((l) => l.enabled && l.url).length} enabled
                  links ·{' '}
                  {brand.directoryVisible
                    ? 'Visible in directory'
                    : 'Hidden from directory'}
                </p>
              </div>
              {publishIssues(brand).length ? (
                <div className="admin-error">
                  <h3>Before publishing</h3>
                  <ul>
                    {publishIssues(brand).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="admin-notice">
                  Required information is present. Server validation checks
                  every link and slug before publishing.
                </p>
              )}
              <button
                className="admin-primary"
                onClick={publish}
                disabled={publishIssues(brand).length > 0}
              >
                Publish Brand →
              </button>
              <p>
                Publishing here makes the page available on this local server.
                Production publishing waits for the production adapters.
              </p>
              {brand.slug && (
                <QRAssets brands={[{ ...brand, status: 'draft' }]} />
              )}
            </>
          )}
        </section>
      </fieldset>
      <div className="wizard-navigation">
        <button disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>
          ← Back
        </button>
        <span>
          {steps[step]} · {step + 1} / 6
        </span>
        {step < 5 ? (
          <button className="admin-primary" disabled={busy} onClick={next}>
            Next →
          </button>
        ) : (
          <button disabled={busy} onClick={save}>
            Save {brand.status === 'published' ? 'changes' : 'draft'}
          </button>
        )}
      </div>
    </>
  );
}
