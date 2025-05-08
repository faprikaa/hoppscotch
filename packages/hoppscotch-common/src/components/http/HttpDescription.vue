<template>
  <div class="px-4 py-3">
    <div>
      <div class="flex flex-col">
        <div class="flex flex-1 items-center">
          <textarea
            v-model="description"
            class="input floating-input flex min-h-32 w-full resize-y rounded bg-transparent pt-4 pb-2"
            :placeholder="`${t('request.description_placeholder')}`"
            @input="$emit('update:modelValue', description)"
          ></textarea>
        </div>
      </div>
      <div class="flex justify-between pl-2 text-secondaryLight">
        <span class="text-tiny">
          {{ t('request.description_help') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "@composables/i18n"
import { ref, watch } from "vue"

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const t = useI18n()

const description = ref(props.modelValue || "")

watch(
  () => props.modelValue,
  (newValue) => {
    description.value = newValue || ""
  }
)
</script> 