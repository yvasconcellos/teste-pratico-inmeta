<template>
    <Sidebar>
        <div class="bg-gray-100 p-4 rounded-md shadow-md" v-if="!loading">
            <h1 class="text-2xl font-bold w-fit mb-4">Cartas</h1>
            <div class="flex flex-col sm:flex-row gap-2 justify-between sm:items-center mb-6">
                <h1 class="text-xl font-semibold">Adicione cartas à sua coleção</h1>
                <input v-model="searchQuery" @input="updatePagination" type="text" placeholder="Buscar por nome"
                    class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:w-full">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="card in paginatedCards" :key="card.id"
                    class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col p-4">
                    <img :src="card.imageUrl" alt="Card Image" class="w-full h-full object-cover">
                    <div class="flex-1 flex flex-col justify-between">
                        <button @click="addCard(card.id)"
                            class="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg w-full">Adicionar</button>
                    </div>
                </div>
            </div>
            <div class="mt-4 flex justify-center">
                <button @click="prevPage" :disabled="page === 1"
                    class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Anterior</button>
                <button @click="nextPage" :disabled="!hasNextPage"
                    class="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Próximo</button>
            </div>
        </div>
        <Loading v-else />
        <ToastSuccess v-if="showSuccessToast" :success-message="successMessage" @close="showSuccessToast = false"
            class="fixed bottom-5 right-5" />
        <ToastError v-if="showErrorToast" :error-message="errorMessage" @close="showErrorToast = false"
            class="fixed bottom-5 right-5" />
    </Sidebar>
</template>



<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Loading from '~/components/Loading.vue'
import ToastSuccess from '~/components/ToastSuccess.vue'
import ToastError from '~/components/ToastError.vue'

const cards = ref([])
const rpp = 8
const page = ref(1)
const hasNextPage = ref(false)
const loading = ref(true)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const searchQuery = ref('')

const isWindowDefined = () => typeof window !== 'undefined'

const fetchCards = async () => {
    try {
        loading.value = true
        const response = await fetch(`https://cards-marketplace-api.onrender.com/cards?rpp=100&page=1`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        cards.value = data.list.filter(card => card.imageUrl)
        updatePagination()
    } catch (error) {
        showErrorToast.value = true
        errorMessage.value = error.message || 'Erro desconhecido'
        setTimeout(() => {
            showErrorToast.value = false
        }, 5000)
    } finally {
        loading.value = false
    }
}

const addCard = async (uuid) => {
    try {
        const response = await fetch(`https://cards-marketplace-api.onrender.com/me/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                cardIds: [uuid]
            })
        })

        showSuccessToast.value = true
        successMessage.value = 'Carta adicionada à sua coleção!'
        setTimeout(() => {
            showSuccessToast.value = false
        }, 3000)

    } catch (error) {
        showErrorToast.value = true
        errorMessage.value = error.message || 'Erro ao adicionar a carta'
        setTimeout(() => {
            showErrorToast.value = false
        }, 5000)
    }
}

const updatePagination = () => {
    const filtered = filteredCards.value
    const totalCards = filtered.length
    const startIndex = (page.value - 1) * rpp
    const endIndex = startIndex + rpp
    paginatedCards.value = filtered.slice(startIndex, endIndex)
    hasNextPage.value = endIndex < totalCards

    if (isWindowDefined()) {
        const queryParams = new URLSearchParams(window.location.search)
        queryParams.set('page', page.value)
        window.history.replaceState({}, '', `${window.location.pathname}?${queryParams.toString()}`)
    }
}

const prevPage = () => {
    if (page.value > 1) {
        page.value--
        updatePagination()
    }
}

const nextPage = () => {
    if (hasNextPage.value) {
        page.value++
        updatePagination()
    }
}

const filteredCards = computed(() => {
    const query = searchQuery.value.toLowerCase()
    return cards.value.filter(card => card.name.toLowerCase().includes(query))
})

const paginatedCards = ref([])

onMounted(() => {
    fetchCards()
    if (isWindowDefined()) {
        page.value = parseInt(new URLSearchParams(window.location.search).get('page')) || 1
    }
})

watch(page, updatePagination)
watch(searchQuery, () => {
    page.value = 1
    updatePagination()
})
</script>

<style scoped>
button[disabled] {
    background-color: #e0e0e0;
    cursor: not-allowed;
}

input[type="text"] {
    transition: box-shadow 0.3s ease;
}

input[type="text"]:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
}
</style>
