<template>
  <Sidebar>
    <div class="bg-gray-100 p-4 rounded-md shadow-md" v-if="!loading">
      <h1 class="text-2xl font-bold w-fit mb-4">Perfil do usuário</h1>
      <div class="flex flex-col sm:flex-row gap-2 justify-between sm:items-center mb-6">
        <h1 class="text-xl font-semibold">Minha Coleção</h1>
        <input v-model="searchQuery" @input="updatePagination" type="text" placeholder="Buscar por nome"
          class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-sm:w-full">
      </div>
      <div v-if="paginatedCards.length !== 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="card in paginatedCards" :key="card.id" class="bg-white rounded-lg shadow-md overflow-hidden">
          <img :src="card.imageUrl" alt="Card Image" class="w-full h-full object-cover">
        </div>
      </div>
      <div v-else class="mt-4">
        <p>Você ainda não tem cartas em sua coleção...</p>
      </div>
      <div class="mt-4 flex justify-center">
        <button @click="prevPage" :disabled="page === 1"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Anterior</button>
        <button @click="nextPage" :disabled="!hasNextPage"
          class="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Próximo</button>
      </div>
    </div>
    <Loading v-else />
  </Sidebar>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Loading from '~/components/Loading.vue'

const profile = ref({
  name: '',
  email: '',
  cards: []
})
const loading = ref(true)
const rpp = 8
const page = ref(1)
const hasNextPage = ref(false)
const searchQuery = ref('')

const isWindowDefined = () => typeof window !== 'undefined'

const fetchProfile = async () => {
  try {
    loading.value = true
    const response = await fetch('https://cards-marketplace-api.onrender.com/me', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()
    profile.value = data
    updatePagination()
  } catch (error) {
  } finally {
    loading.value = false
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
  return profile.value.cards.filter(card => card.name.toLowerCase().includes(query))
})

const paginatedCards = ref([])

onMounted(() => {
  fetchProfile()
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
