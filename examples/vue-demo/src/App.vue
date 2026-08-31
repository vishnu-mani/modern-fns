<script setup lang="ts">
import { computed, ref } from 'vue';
import FunctionCard from './components/FunctionCard.vue';
import { computeCoverage, modules } from './registry';

const search = ref('');
const activeModule = ref<string>('all');
const coverage = computeCoverage();

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  return modules
    .filter((mod) => activeModule.value === 'all' || mod.module === activeModule.value)
    .map((mod) => ({
      ...mod,
      specs: mod.specs.filter(
        (spec) =>
          term === '' ||
          spec.name.toLowerCase().includes(term) ||
          spec.summary.toLowerCase().includes(term) ||
          spec.signature.toLowerCase().includes(term),
      ),
    }))
    .filter((mod) => mod.specs.length > 0);
});

const shownCount = computed(() =>
  filtered.value.reduce((total, mod) => total + mod.specs.length, 0),
);
</script>

<template>
  <div class="app">
    <header class="masthead">
      <div class="masthead__title">
        <h1>modern-fns <span>playground</span></h1>
        <p>
          Every exported function, live. Edit any input — the call re-runs as you type, against the
          real package resolved through its <code>exports</code> map.
        </p>
      </div>

      <div class="masthead__coverage" :class="{ 'is-complete': coverage.missing.length === 0 }">
        <strong>{{ coverage.demoed }} / {{ coverage.exported }}</strong>
        <span>exported names demoed</span>
        <small>{{ coverage.uniqueFunctions }} unique functions</small>
        <p v-if="coverage.missing.length" class="masthead__missing">
          missing: {{ coverage.missing.join(', ') }}
        </p>
        <p v-if="coverage.unknown.length" class="masthead__missing">
          not in library: {{ coverage.unknown.join(', ') }}
        </p>
      </div>
    </header>

    <nav class="toolbar">
      <input
        v-model="search"
        class="toolbar__search"
        type="search"
        placeholder="Search by name, signature or description…"
      />
      <div class="toolbar__chips">
        <button
          type="button"
          :class="['chip', { 'chip--active': activeModule === 'all' }]"
          @click="activeModule = 'all'"
        >
          all
        </button>
        <button
          v-for="mod in modules"
          :key="mod.module"
          type="button"
          :class="['chip', { 'chip--active': activeModule === mod.module }]"
          @click="activeModule = mod.module"
        >
          {{ mod.module }}
          <em>{{ mod.specs.length }}</em>
        </button>
      </div>
      <p class="toolbar__count">{{ shownCount }} shown</p>
    </nav>

    <main>
      <section v-for="mod in filtered" :key="mod.module" class="module">
        <div class="module__head">
          <h2>{{ mod.module }}</h2>
          <p>{{ mod.blurb }}</p>
        </div>
        <div class="grid">
          <FunctionCard
            v-for="spec in mod.specs"
            :key="spec.name"
            :spec="spec"
            :module="mod.module"
          />
        </div>
      </section>

      <p v-if="filtered.length === 0" class="empty">Nothing matches “{{ search }}”.</p>
    </main>

    <footer class="footer">
      <p>
        modern-fns — modular, immutable, tree-shakeable, dependency-free. Function arguments marked
        <em>fn</em> are compiled from the text you type, so predicates and selectors are editable
        too.
      </p>
    </footer>
  </div>
</template>
