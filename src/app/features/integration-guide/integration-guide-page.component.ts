import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WidgetInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface WidgetDoc {
  tag: string;
  description: string;
  inputs: WidgetInput[];
  example: string;
}

@Component({
  selector: 'app-integration-guide-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './integration-guide-page.component.html',
  styleUrl: './integration-guide-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntegrationGuidePageComponent {
  readonly scriptUrl = 'https://dota2db.com/widget/elements.js';
  readonly siteOrigin = 'https://dota2db.com';

  // ── Snippets (kept in TS so Angular never parses their braces) ──
  readonly snippetScriptTag = `<script src="${this.scriptUrl}" type="module"></script>`;

  readonly snippetBasicUsage = `<dota-item-icon item-id="blink"></dota-item-icon>
<dota-hero-icon hero-id="antimage"></dota-hero-icon>
<dota-ability-icon ability-id="antimage_mana_break"></dota-ability-icon>`;

  readonly snippetHrefStatic = `<!-- Автоматически заменится на <dota-hero-icon> -->
<a href="${this.siteOrigin}/hero?id=4">Bloodseeker</a>`;

  readonly snippetHrefMixed = `<p>
  Собери билд на
  <a href="${this.siteOrigin}/hero?id=antimage">Anti-Mage</a>
  с
  <a href="${this.siteOrigin}/item?id=blink">Blink Dagger</a>
  и
  <a href="${this.siteOrigin}/ability?id=antimage_mana_break">Mana Break</a>.
</p>`;

  readonly snippetSizeInline = `<!-- Single widget -->
<dota-item-icon item-id="blink" style="--dota-icon-size: 48px;"></dota-item-icon>

<!-- Group of widgets -->
<div class="items" style="--dota-icon-size: 64px;">
  <dota-item-icon item-id="blink"></dota-item-icon>
  <dota-item-icon item-id="black_king_bar"></dota-item-icon>
  <dota-item-icon item-id="sheepstick"></dota-item-icon>
</div>`;

  readonly snippetStyling = `.my-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
}

dota-item-icon,
dota-hero-icon,
dota-ability-icon {
  display: inline-block;
  --dota-icon-size: 64px;
}`;

  readonly snippetHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My page</title>
    <script src="${this.scriptUrl}" type="module"></script>
  </head>
  <body>
    <h1>Hero Build</h1>
    <dota-hero-icon hero-id="juggernaut"></dota-hero-icon>
    <dota-ability-icon ability-id="juggernaut_blade_fury"></dota-ability-icon>
  </body>
</html>`;

  readonly snippetReact = `import { useEffect } from 'react';

export function useDotaWidgets() {
  useEffect(() => {
    if (document.querySelector('script[data-dota-widgets]')) return;
    const s = document.createElement('script');
    s.src = '${this.scriptUrl}';
    s.type = 'module';
    s.dataset.dotaWidgets = '1';
    document.head.appendChild(s);
  }, []);
}

export function ItemCard({ id }) {
  return <dota-item-icon item-id={id} />;
}`;

  readonly snippetVue = `<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  const s = document.createElement('script');
  s.src = '${this.scriptUrl}';
  s.type = 'module';
  document.head.appendChild(s);
});
</script>

<template>
  <dota-hero-icon hero-id="invoker" />
</template>`;

  readonly snippetCsp = `script-src  'self' ${this.siteOrigin};
connect-src 'self' ${this.siteOrigin};
img-src     'self' https://cdn.cloudflare.steamstatic.com ${this.siteOrigin} data:;`;

  readonly widgets: WidgetDoc[] = [
    {
      tag: 'dota-item-icon',
      description:
        'Renders a Dota 2 item icon. Hovering displays a rich tooltip with cost, attributes, active/passive abilities and item lore.',
      inputs: [
        {
          name: 'item-id',
          type: 'string',
          required: true,
          description: 'Internal item key, e.g. blink, black_king_bar, aghanims_shard.',
        },
      ],
      example: `<dota-item-icon item-id="blink"></dota-item-icon>`,
    },
    {
      tag: 'dota-hero-icon',
      description:
        'Hero icon with a caption underneath. Tooltip includes stats, roles, abilities, attributes and hero biography.',
      inputs: [
        {
          name: 'hero-id',
          type: 'string',
          required: true,
          description: 'Hero slug, e.g. antimage, crystal_maiden, shadow_fiend.',
        },
        {
          name: 'display-name',
          type: 'string',
          required: false,
          description: 'Caption under the icon. If omitted, the name is pulled from bundled data.',
        },
        {
          name: 'img-path',
          type: 'string',
          required: false,
          description: 'Custom image path (e.g. your own CDN). Defaults to the Steam CDN.',
        },
      ],
      example: `<dota-hero-icon hero-id="antimage"></dota-hero-icon>`,
    },
    {
      tag: 'dota-ability-icon',
      description:
        'Ability icon. Tooltip contains description, mana cost, cooldown, behavior flags and per-level breakdown.',
      inputs: [
        {
          name: 'ability-id',
          type: 'string',
          required: true,
          description: 'Ability key, e.g. antimage_mana_break, crystal_maiden_frostbite.',
        },
        {
          name: 'display-name',
          type: 'string',
          required: false,
          description: 'Caption under the icon.',
        },
        {
          name: 'img-path',
          type: 'string',
          required: false,
          description: 'Custom image path (optional).',
        },
      ],
      example: `<dota-ability-icon ability-id="antimage_mana_break"></dota-ability-icon>`,
    },
  ];

  // ── FAQ ──
  readonly faq = [
    {
      title: 'Icons do not appear.',
      body: 'Make sure the script is loaded with type="module" before the elements enter the viewport. Open DevTools — you should see "[DotaWidgets] registered: …" in the console.',
    },
    {
      title: 'Tooltip does not open.',
      body: 'Check that no parent element disables pointer events (pointer-events: none). Tooltips are rendered into cdk-overlay-container attached to <body> and do not occupy DOM space.',
    },
    {
      title: 'Image fails to load.',
      body: 'Icons are served from cdn.cloudflare.steamstatic.com. If that domain is blocked in your region, pass your own img-path or extend img-src in your CSP.',
    },
    {
      title: 'Href auto-embed replaced a link I wanted to keep as text.',
      body: `The script rewrites <a href> pointing to ${this.siteOrigin}/item|hero|ability?id=… into widgets automatically. If you keep the link as plain text, wrap it in an element that is not an <a> (e.g. a <span> with the URL as text), or render the widget manually with <dota-*-icon>.`,
    },
    {
      title: 'I want to host my own dataset.',
      body: 'Deploy assets/data/*.json to your own CDN and fork the widget source. The environment.dataBase variable controls where the JSON files are fetched from.',
    },
  ];
}
