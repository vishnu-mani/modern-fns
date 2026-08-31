<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { memoize, once, random } from 'modern-fns';

const props = defineProps<{ mode: 'once' | 'memoize' | 'random'; min?: number; max?: number }>();

/* once ------------------------------------------------------------------ */
const onceRuns = ref(0);
const onceResults = ref<string[]>([]);
const onceFn = shallowRef(
  once((label: string) => {
    onceRuns.value += 1;
    return `computed for "${label}"`;
  }),
);
function callOnce(label: string): void {
  onceResults.value.push(String(onceFn.value(label)));
}
function resetOnce(): void {
  onceRuns.value = 0;
  onceResults.value = [];
  onceFn.value = once((label: string) => {
    onceRuns.value += 1;
    return `computed for "${label}"`;
  });
}

/* memoize --------------------------------------------------------------- */
const computations = ref(0);
const memoInput = ref('Hello World');
const memoLog = ref<string[]>([]);
const memoized = shallowRef(
  memoize((input: string) => {
    computations.value += 1;
    return input.toLowerCase().split(' ').join('-');
  }),
);
function callMemo(): void {
  const before = computations.value;
  const result = memoized.value(memoInput.value);
  memoLog.value.unshift(
    `${memoInput.value} -> ${result} (${before === computations.value ? 'cache hit' : 'computed'})`,
  );
  memoLog.value = memoLog.value.slice(0, 6);
}
function clearCache(): void {
  memoized.value.cache.clear();
  memoLog.value.unshift('cache cleared');
}

/* random ---------------------------------------------------------------- */
const rolls = ref<number[]>([]);
function roll(): void {
  rolls.value.unshift(random(props.min ?? 1, props.max ?? 6));
  rolls.value = rolls.value.slice(0, 12);
}
</script>

<template>
  <div class="widget">
    <template v-if="mode === 'once'">
      <div class="widget__actions">
        <button type="button" @click="callOnce('first')">call once('first')</button>
        <button type="button" @click="callOnce('second')">call once('second')</button>
        <button type="button" @click="resetOnce">new once()</button>
      </div>
      <div class="widget__stats">
        <span
          >underlying fn ran <strong>{{ onceRuns }}</strong> time(s)</span
        >
        <span
          >calls made: <strong>{{ onceResults.length }}</strong></span
        >
      </div>
      <pre class="widget__log">{{ onceResults.join('\n') || 'no calls yet' }}</pre>
    </template>

    <template v-else-if="mode === 'memoize'">
      <div class="widget__row">
        <input v-model="memoInput" class="field__control" />
        <button type="button" @click="callMemo">call</button>
        <button type="button" @click="clearCache">cache.clear()</button>
      </div>
      <div class="widget__stats">
        <span
          >computations: <strong>{{ computations }}</strong></span
        >
        <span
          >cache size: <strong>{{ memoized.cache.size }}</strong></span
        >
      </div>
      <pre class="widget__log">{{ memoLog.join('\n') || 'call it twice with the same input' }}</pre>
    </template>

    <template v-else>
      <div class="widget__actions">
        <button type="button" @click="roll">roll random({{ min ?? 1 }}, {{ max ?? 6 }})</button>
      </div>
      <div class="widget__stats">
        <span>inclusive at both ends — roll until you see both bounds</span>
      </div>
      <pre class="widget__log">{{ rolls.join(' ') || 'no rolls yet' }}</pre>
    </template>
  </div>
</template>
