<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import InputField from './InputField.vue';
import OutputView from './OutputView.vue';
import TimingWidget from './TimingWidget.vue';
import StatefulWidget from './StatefulWidget.vue';
import { callSource, parseInput, type DemoSpec } from '../registry/types';

const props = defineProps<{ spec: DemoSpec; module: string }>();

const values = reactive<string[]>(props.spec.inputs.map((input) => input.value));
const asyncResult = ref<unknown>(undefined);
const asyncPending = ref(false);

function reset(): void {
  props.spec.inputs.forEach((input, index) => {
    values[index] = input.value;
  });
}

const evaluated = computed<{ value: unknown; error: string | null }>(() => {
  try {
    const args = props.spec.inputs.map((input, index) =>
      parseInput({ ...input, value: values[index] }),
    );
    const result = (props.spec.run as (...a: unknown[]) => unknown)(...args);
    return { value: result, error: null };
  } catch (error) {
    return { value: undefined, error: error instanceof Error ? error.message : String(error) };
  }
});

const isPromise = computed(
  () => typeof (evaluated.value.value as PromiseLike<unknown> | undefined)?.then === 'function',
);

watch(
  evaluated,
  (current) => {
    if (typeof (current.value as PromiseLike<unknown> | undefined)?.then !== 'function') {
      asyncResult.value = undefined;
      asyncPending.value = false;
      return;
    }
    asyncPending.value = true;
    void Promise.resolve(current.value)
      .then((resolved) => {
        asyncResult.value = resolved;
      })
      .catch((error: unknown) => {
        asyncResult.value = `rejected: ${String(error)}`;
      })
      .finally(() => {
        asyncPending.value = false;
      });
  },
  { immediate: true },
);

const source = computed(() =>
  callSource({
    ...props.spec,
    inputs: props.spec.inputs.map((input, i) => ({ ...input, value: values[i] })),
  }),
);

const waitValue = computed(() => Number(values[0] ?? 400));
const rangeBounds = computed(() => ({ min: Number(values[0] ?? 1), max: Number(values[1] ?? 6) }));
</script>

<template>
  <article class="card" :id="`${module}-${spec.name}`">
    <header class="card__head">
      <h3 class="card__name">
        {{ spec.name }}
        <span class="card__module">{{ module }}</span>
      </h3>
      <button class="card__reset" type="button" title="Reset inputs" @click="reset">reset</button>
    </header>

    <code class="card__signature">{{ spec.signature }}</code>
    <p class="card__summary">{{ spec.summary }}</p>

    <div v-if="spec.inputs.length" class="card__inputs">
      <InputField
        v-for="(input, index) in spec.inputs"
        :key="input.label"
        v-model="values[index]"
        :input="input"
      />
    </div>

    <pre class="card__call">{{ source }}</pre>

    <OutputView v-if="!isPromise" :value="evaluated.value" :error="evaluated.error" />
    <OutputView
      v-else
      :value="asyncPending ? 'resolving…' : asyncResult"
      :error="evaluated.error"
    />

    <TimingWidget
      v-if="spec.widget === 'debounce' || spec.widget === 'throttle'"
      :mode="spec.widget"
      :wait="Number.isFinite(waitValue) ? waitValue : 400"
    />
    <StatefulWidget
      v-else-if="spec.widget === 'once' || spec.widget === 'memoize'"
      :mode="spec.widget"
    />
    <StatefulWidget
      v-else-if="spec.widget === 'random'"
      mode="random"
      :min="rangeBounds.min"
      :max="rangeBounds.max"
    />

    <p v-if="spec.note" class="card__note">{{ spec.note }}</p>
  </article>
</template>
