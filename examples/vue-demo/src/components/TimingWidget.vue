<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { debounce, throttle } from 'modern-fns';

const props = defineProps<{ mode: 'debounce' | 'throttle'; wait: number }>();

const typed = ref('');
const rawCalls = ref(0);
const ranCalls = ref(0);
const lastValue = ref('');
const pending = ref(false);

let wrapped = build(props.wait);

function build(wait: number) {
  const factory = props.mode === 'debounce' ? debounce : throttle;
  return factory((value: string) => {
    ranCalls.value += 1;
    lastValue.value = value;
  }, wait);
}

watch(
  () => props.wait,
  (wait) => {
    wrapped.cancel();
    wrapped = build(Number.isFinite(wait) && wait >= 0 ? wait : 0);
    pending.value = false;
  },
);

function onInput(): void {
  rawCalls.value += 1;
  wrapped(typed.value);
  pending.value = wrapped.pending();
}

// The wrapper's timers fire outside Vue's reactivity, so poll the real state.
const poll = window.setInterval(() => {
  pending.value = wrapped.pending();
}, 100);

function flush(): void {
  wrapped.flush();
  pending.value = wrapped.pending();
}
function cancel(): void {
  wrapped.cancel();
  pending.value = wrapped.pending();
}
function reset(): void {
  cancel();
  typed.value = '';
  rawCalls.value = 0;
  ranCalls.value = 0;
  lastValue.value = '';
}

onBeforeUnmount(() => {
  window.clearInterval(poll);
  wrapped.cancel();
});
</script>

<template>
  <div class="widget">
    <input
      v-model="typed"
      class="field__control"
      :placeholder="
        mode === 'debounce'
          ? 'Type fast — it fires once you stop'
          : 'Type fast — it fires at most once per window'
      "
      @input="onInput"
    />
    <div class="widget__stats">
      <span
        ><strong>{{ rawCalls }}</strong> keystrokes</span
      >
      <span
        ><strong>{{ ranCalls }}</strong> invocations</span
      >
      <span
        >pending: <strong>{{ pending }}</strong></span
      >
      <span
        >last value: <code>{{ lastValue || '—' }}</code></span
      >
    </div>
    <div class="widget__actions">
      <button type="button" @click="flush">flush()</button>
      <button type="button" @click="cancel">cancel()</button>
      <button type="button" @click="reset">reset</button>
    </div>
  </div>
</template>
