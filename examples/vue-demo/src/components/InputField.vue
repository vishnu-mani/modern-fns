<script setup lang="ts">
import type { DemoInput } from '../registry/types';

defineProps<{ input: DemoInput }>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <label class="field">
    <span class="field__label">
      {{ input.label }}
      <em class="field__kind">{{ input.kind }}</em>
    </span>

    <select v-if="input.kind === 'select'" v-model="model" class="field__control">
      <option v-for="option in input.options" :key="option" :value="option">{{ option }}</option>
    </select>

    <select v-else-if="input.kind === 'boolean'" v-model="model" class="field__control">
      <option value="true">true</option>
      <option value="false">false</option>
    </select>

    <input
      v-else-if="input.kind === 'number'"
      v-model="model"
      type="text"
      inputmode="decimal"
      class="field__control"
      spellcheck="false"
    />

    <textarea
      v-else-if="(input.rows ?? 1) > 1 || input.kind === 'fn'"
      v-model="model"
      class="field__control field__control--code"
      :rows="input.rows ?? 2"
      spellcheck="false"
    ></textarea>

    <input
      v-else
      v-model="model"
      type="text"
      class="field__control"
      :class="{ 'field__control--code': input.kind === 'json' }"
      spellcheck="false"
    />
  </label>
</template>
