<template>
    <div class="relative">
        <div @click="toggleDropdown" class="w-full px-4 py-2 border rounded-lg cursor-pointer flex items-center justify-between bg-white">
            <div class="flex items-center justify-between w-full">
                <span v-if="selectedLabel">{{ selectedLabel }}</span>
                <span v-else class="text-gray-500">Selecione uma carta</span>
                <img v-if="selectedImage" :src="selectedImage" alt="Selected Item Image" class="w-8 h-full object-cover mr-2">
            </div>
            <span class="ml-2">&#9662;</span>
        </div>
        <div v-if="isOpen" class="absolute mt-2 w-full bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
            <div v-for="item in items" :key="item.value" @click="selectItem(item)" class="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between">
                <span>{{ item.label }}</span>
                <img v-if="item.image" :src="item.image" alt="Item Image" class="w-16 h-full object-cover ml-2">
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
    items: {
        type: Array,
        required: true
    },
    modelValue: {
        type: String,
        default: ''
    }
})

const emits = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedLabel = ref('')
const selectedImage = ref('')

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const selectItem = (item) => {
    emits('update:modelValue', item.value)
    selectedLabel.value = item.label
    selectedImage.value = item.image || ''
    isOpen.value = false
}

watch(() => props.modelValue, (newValue) => {
    const selectedItem = props.items.find(item => item.value === newValue)
    selectedLabel.value = selectedItem ? selectedItem.label : ''
    selectedImage.value = selectedItem ? selectedItem.image : ''
})

onMounted(() => {
    const selectedItem = props.items.find(item => item.value === props.modelValue)
    selectedLabel.value = selectedItem ? selectedItem.label : ''
    selectedImage.value = selectedItem ? selectedItem.image : ''
})

</script>
