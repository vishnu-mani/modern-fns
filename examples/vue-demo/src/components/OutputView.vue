<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ value: unknown; error?: string | null }>();

function describe(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return `array(${value.length})`;
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  if (value instanceof Date) return 'Date';
  if (typeof value === 'number' && Number.isNaN(value)) return 'NaN';
  return typeof value;
}

function render(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
  if (value instanceof Map) return JSON.stringify([...value.entries()], null, 2);
  if (value instanceof Set) return JSON.stringify([...value], null, 2);
  if (typeof value === 'function') return value.toString();
  try {
    return (
      JSON.stringify(value, (_key, v) => (v === undefined ? '<undefined>' : v), 2) ?? String(value)
    );
  } catch {
    return String(value);
  }
}

const type = computed(() => describe(props.value));
const body = computed(() => render(props.value));
</script>

<template>
  <div class="output" :class="{ 'output--error': error }">
    <div class="output__meta">
      <span class="badge" :class="error ? 'badge--error' : 'badge--type'">{{
        error ? 'threw' : type
      }}</span>
    </div>
    <pre v-if="error" class="output__body">{{ error }}</pre>
    <pre v-else class="output__body">{{ body }}</pre>
  </div>
</template>
